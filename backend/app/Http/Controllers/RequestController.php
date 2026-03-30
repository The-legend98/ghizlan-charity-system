<?php

namespace App\Http\Controllers;

use App\Models\Request;
use App\Models\RequestStatusLog;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\RequestConfirmation;

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
            'monthly_income'  => 'nullable|numeric|min:0',
            'housing_status'  => ['required', Rule::in(['owned', 'rented', 'other'])],
            'region'          => 'required|string|max:255',
            'address'         => 'nullable|string|max:500',
            'assistance_type' => ['required', Rule::in(['medical', 'education', 'financial'])],
            'description'     => 'required|string|min:20',
            'email'           => 'nullable|email|max:255',
        ]);

       do {
         $refNumber = 'GH-' . random_int(1000000, 9999999);
        } while (Request::where('ref_number', $refNumber)->exists());

        $data['ref_number'] = $refNumber;

        $request = Request::create($data);

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
        'ref_number'      => $request->ref_number,
        'full_name'       => $request->full_name,
        'assistance_type' => $request->assistance_type,
        'status'          => $request->status,
        'created_at'      => $request->created_at->format('d M Y'),
        'updated_at'      => $request->updated_at->format('d M Y — h:i A'),
    ]);
}

    // قائمة الطلبات — موظف/مدير
    public function index(HttpRequest $http)
    {
        $query = Request::query();

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

        $requests = $query->orderBy('created_at', 'desc')->paginate(20);

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

        return response()->json($request);
    }

    // تغيير حالة الطلب — موظف/مدير
    public function updateStatus(HttpRequest $http, $id)
    {
        $request = Request::findOrFail($id);

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
}