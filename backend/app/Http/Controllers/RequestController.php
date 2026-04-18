<?php

namespace App\Http\Controllers;

use App\Models\Request;
use App\Models\RequestStatusLog;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\RequestConfirmation;
use App\Mail\StatusUpdated;
use App\Events\NewRequestSubmitted;



class RequestController extends Controller
{
    // تقديم طلب جديد — بدون login
    public function store(HttpRequest $http)
    {
        $data = $http->validate([
            'full_name'       => 'required|string|max:255',
            'phone'           => 'required|string|max:20',
            'age'             => 'required|integer|min:1|max:120',
            'gender'          => ['required', Rule::in(['male', 'female'])],
            'family_members'  => 'required|integer|min:1',
            'children_count'  => 'nullable|integer|min:0',
            'national_id'  => 'nullable|string|max:20',
            'income_range' => 'nullable|in:none,under_1m,1m_2m,2m_4m,over_4m',
            'housing_status'  => ['required', Rule::in(['owned', 'rented', 'other'])],
            'region'          => 'required|string|max:255',
            'address'         => 'nullable|string|max:500',
            'assistance_type' => ['required', Rule::in(['medical', 'education', 'financial'])],
            'description'     => 'required|string|min:20',
            'email'           => 'nullable|email|max:255',
        ]);

        // منع التكرار — نفس الهاتف خلال 60 ثانية
    $recentRequest = Request::where('phone', $data['phone'])
        ->where('created_at', '>=', now()->subSeconds(60))
        ->first();

    if ($recentRequest) {
        return response()->json([
            'message' => 'تم إرسال طلبك مسبقاً، يُرجى الانتظار قليلاً',
            'ref_number' => $recentRequest->ref_number,
            'request_id' => $recentRequest->id,
        ], 200);
    }

       do {
         $refNumber = 'GH-' . random_int(1000000, 9999999);
        } while (Request::where('ref_number', $refNumber)->exists());

        $data['ref_number'] = $refNumber;

        // توزيع الطلبات بشكل دائري بين الموظفين النشطين
        $employees = \App\Models\User::where('role', 'employee')
            ->where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();

        $employee = null;

        if ($employees->count() > 0) {
            // اقرأ آخر موظف أُسند إليه طلب
            $lastAssignedId = \App\Models\Setting::where('key', 'last_assigned_employee_id')
                ->value('value');

            // ابحث عن الموظف اللي بعده
            $nextEmployee = null;

            if ($lastAssignedId) {
                // ابحث عن الموظف اللي بعد الأخير
                $nextEmployee = $employees->first(function ($e) use ($lastAssignedId) {
                    return $e->id > (int) $lastAssignedId;
                });
            }

            // إذا ما لقينا أحد بعده، ارجع للأول (دورة جديدة)
            $employee = $nextEmployee ?? $employees->first();

            // احفظ آخر موظف أُسند إليه
            \App\Models\Setting::updateOrCreate(
                ['key' => 'last_assigned_employee_id'],
                ['value' => $employee->id]
            );
        }
        
        if ($employee) {$data['assigned_to'] = $employee->id;}
        $request = Request::create($data);

        if ($employee) {
            try {
                broadcast(new NewRequestSubmitted(
                    requestId:      (string) $request->id,
                    fullName:       $request->full_name,
                    refNumber:      $request->ref_number,
                    assistanceType: $request->assistance_type,
                    region:         $request->region,
                    assignedToId:   $employee->id,  //  الموظف المعيّن
                ))->toOthers();
            } catch (\Exception $e) {
                \Log::error('Broadcast error: ' . $e->getMessage());
            }
        }

       if (!empty($data['email'])) {
            try {
                Mail::to($data['email'])->send(new RequestConfirmation(
                    fullName: $request->full_name,
                    refNumber: $request->ref_number,
                    assistanceType: $request->assistance_type,
                ));
            } catch (\Exception $e) {
                \Log::error('Mail error: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message'    => 'تم استلام طلبك بنجاح',
            'request_id' => $request->id,
            'ref_number' => $request->ref_number,
        ], 201);
    }

    // تتبع الطلب برقمه أو رقم الهاتف — بدون login
   public function track(HttpRequest $http)
{
    $http->validate([
        'query' => 'required|string',
    ]);

    

    $query = $http->input('query');

    $request = Request::where('ref_number', $query)
        ->orWhere('ref_number', 'GH-' . $query)
        ->orWhere('phone', $query)
        ->first();

    if (!$request) {
        return response()->json(['message' => 'لم يتم العثور على طلب بهذا الرقم'], 404);
    }

    return response()->json([
        'id'              => $request->id,
        'phone'           => $request->phone,
        'ref_number'      => $request->ref_number,
        'full_name'       => $request->full_name,
        'assistance_type' => $request->assistance_type,
        'status'          => $request->status,
        'created_at'      => $request->created_at->toISOString(),
        'updated_at'      => $request->updated_at->toISOString(),
    ]);
}

    // قائمة الطلبات — موظف/مدير
    public function index(HttpRequest $http)
    {
        $query = Request::query();
        $user  = $http->user();

        if ($user->role === 'employee') {
        $query->where('assigned_to', $user->id);
    }

        if ($http->status) {
            $query->where('status', $http->status);
        }
        if ($http->region) {
            $query->where('region', $http->region);
        }
        if ($http->assistance_type) {
            $query->where('assistance_type', $http->assistance_type);
        }
        if ($http->priority) {
            $query->where('priority', $http->priority);
        }
        if ($http->search) {
            $query->where(function ($q) use ($http) {
                $q->where('full_name', 'like', '%' . $http->search . '%')
                  ->orWhere('phone', 'like', '%' . $http->search . '%');
            });
        }
        if ($http->assigned_to) {
        $query->where('assigned_to', $http->assigned_to);
        }

        if ($http->date_from) {
            $query->whereDate('created_at', '>=', $http->date_from);
        }

        if ($http->date_to) {
            $query->whereDate('created_at', '<=', $http->date_to);
        }

        $perPage = $http->get('per_page', 10);
        $requests = $query->with(['assignedTo', 'documents'])->orderBy('created_at', 'desc') ->paginate($perPage);

        return response()->json($requests);
    }

    // تفاصيل طلب — موظف/مدير
    public function show($id)
    {
        $request = Request::with([
            'documents',
            'statusLogs.changedBy',
            'notes.user',
            'assignedTo',
        ])->findOrFail($id);

        $user = auth()->user();
    if ($user->role === 'employee' && $request->assigned_to !== $user->id) {
        return response()->json(['message' => 'غير مصرح'], 403);
    }

        return response()->json($request);
    }

    // تغيير حالة الطلب — موظف/مدير
    public function updateStatus(HttpRequest $http, $id)
    {
        $request = Request::findOrFail($id);

        $user = auth()->user();
    if ($user->role === 'employee' && $request->assigned_to !== $user->id) {
        return response()->json(['message' => 'غير مصرح'], 403);
    }

        $http->validate([
            'status' => ['required', Rule::in(['reviewing', 'needs_info', 'approved', 'rejected'])],
            'note'   => 'nullable|string|max:1000',
            'priority' => ['nullable', Rule::in(['high', 'medium', 'normal'])],
        ]);

        $oldStatus = $request->status;

        $request->update([
            'status'   => $http->status,
            'priority' => $http->priority ?? $request->priority,
        ]);

        if (!empty($request->email)) {
            try {
                Mail::to($request->email)->send(new StatusUpdated(
                    fullName:  $request->full_name,
                    refNumber: $request->ref_number,
                    newStatus: $http->status,
                    note:      $http->note ?? '',
                ));
            } catch (\Exception $e) {
                \Log::error('Status mail error: ' . $e->getMessage());
            }
        }


        // تسجيل في السجل
        RequestStatusLog::create([
            'request_id'  => $request->id,
            'changed_by'  => $http->user()->id,
            'from_status' => $oldStatus,
            'to_status'   => $http->status,
            'note'        => $http->note,
        ]);

        return response()->json([
            'message' => 'تم تحديث حالة الطلب بنجاح',
            'status'  => $request->status,
        ]);
    }

    public function updateFollowUp(HttpRequest $http, $id)
{
    $request = Request::findOrFail($id);

    $user = auth()->user();
    if ($user->role === 'employee' && $request->assigned_to !== $user->id) {
        return response()->json(['message' => 'غير مصرح'], 403);
    }

    $http->validate([
        'follow_up_date'   => 'nullable|date',
        'follow_up_note'   => 'nullable|string|max:1000',
        'follow_up_status' => 'required|in:none,scheduled,done,completed',
    ]);

    $request->update([
        'follow_up_date'   => $http->follow_up_date,
        'follow_up_note'   => $http->follow_up_note,
        'follow_up_status' => $http->follow_up_status,
    ]);

    return response()->json([
        'message' => 'تم تحديث المتابعة بنجاح',
        'request' => $request,
    ]);
}

public function assign(HttpRequest $http, $id)
{
    $user = $http->user();
    if ($user->role !== 'manager') {
        return response()->json(['message' => 'غير مصرح'], 403);
    }

    $http->validate([
        'assigned_to' => 'required|exists:users,id',
    ]);

    $request = Request::findOrFail($id);
    $request->update(['assigned_to' => $http->assigned_to]);

    return response()->json(['message' => 'تم تعيين الموظف بنجاح']);
}
}