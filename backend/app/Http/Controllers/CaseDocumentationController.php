<?php

namespace App\Http\Controllers;

use App\Models\CaseDocumentation;
use App\Models\DocumentationFile;
use App\Models\Request as HelpRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CaseDocumentationController extends Controller
{
    // إضافة توثيق جديد
    public function store(Request $http)
    {
        $http->validate([
            'request_id'       => 'required|exists:requests,id',
            'result'           => 'required|in:completed,partial,not_delivered',
            'amount_delivered' => 'nullable|numeric|min:0',
            'service_delivered'=> 'nullable|string|max:500',
            'delivery_date'    => 'required|date',
            'notes'            => 'nullable|string',
            'needs_follow_up'  => 'boolean',
            'follow_up_date'   => 'required_if:needs_follow_up,true|nullable|date|after:today',
            'follow_up_reason' => 'required_if:needs_follow_up,true|nullable|string',
            'files.*'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // تحقق إن الطلب مقبول
        $request = HelpRequest::findOrFail($http->request_id);
        if ($request->status !== 'approved') {
            return response()->json(['message' => 'لا يمكن توثيق طلب غير مقبول'], 422);
        }

        // تحقق إن ما في توثيق مسبق
        if ($request->documentation) {
            return response()->json(['message' => 'هذا الطلب موثّق مسبقاً'], 422);
        }

        $doc = CaseDocumentation::create([
            'request_id'        => $http->request_id,
            'created_by'        => Auth::id(),
            'result'            => $http->result,
            'amount_delivered'  => $http->amount_delivered,
            'service_delivered' => $http->service_delivered,
            'delivery_date'     => $http->delivery_date,
            'notes'             => $http->notes,
            'needs_follow_up'   => $http->boolean('needs_follow_up'),
            'follow_up_date'    => $http->needs_follow_up ? $http->follow_up_date : null,
            'follow_up_reason'  => $http->needs_follow_up ? $http->follow_up_reason : null,
            'follow_up_status'  => 'pending',
        ]);

        // رفع الملفات
        if ($http->hasFile('files')) {
            foreach ($http->file('files') as $file) {
                $path = $file->store('documentation/' . $doc->id, 'public');
                DocumentationFile::create([
                    'documentation_id' => $doc->id,
                    'file_path'        => $path,
                    'file_name'        => $file->getClientOriginalName(),
                    'file_type'        => $file->getClientMimeType(),
                ]);
            }
        }

        return response()->json([
            'message' => 'تم توثيق الحالة بنجاح',
            'data'    => $doc->load(['creator', 'files']),
        ], 201);
    }

    // عرض توثيق طلب معين
    public function show($requestId)
    {
        $doc = CaseDocumentation::with(['creator', 'files', 'request'])
            ->where('request_id', $requestId)
            ->first();

        if (!$doc) {
            return response()->json(['message' => 'لا يوجد توثيق لهذا الطلب'], 404);
        }

        return response()->json($doc);
    }

    // كل التوثيقات للتقارير
    public function index(Request $http)
    {
        $query = CaseDocumentation::with(['creator', 'request', 'files']);

        // فلاتر
        if ($http->result) {
            $query->where('result', $http->result);
        }
        if ($http->needs_follow_up !== null) {
            $query->where('needs_follow_up', $http->boolean('needs_follow_up'));
        }
        if ($http->follow_up_status) {
            $query->where('follow_up_status', $http->follow_up_status);
        }
        if ($http->date_from) {
            $query->whereDate('delivery_date', '>=', $http->date_from);
        }
        if ($http->date_to) {
            $query->whereDate('delivery_date', '<=', $http->date_to);
        }
        // تنبيه: متابعات اليوم وما فات
        if ($http->due_follow_ups) {
            $query->where('needs_follow_up', true)
                  ->where('follow_up_status', 'pending')
                  ->whereDate('follow_up_date', '<=', now());
        }

        $perPage = $http->get('per_page', 10);
        $docs    = $query->latest()->paginate($perPage);

        // إحصائيات سريعة
        $stats = [
            'total'           => CaseDocumentation::count(),
            'completed'       => CaseDocumentation::where('result', 'completed')->count(),
            'partial'         => CaseDocumentation::where('result', 'partial')->count(),
            'not_delivered'   => CaseDocumentation::where('result', 'not_delivered')->count(),
            'needs_follow_up' => CaseDocumentation::where('needs_follow_up', true)->where('follow_up_status', 'pending')->count(),
            'due_today'       => CaseDocumentation::where('needs_follow_up', true)
                                    ->where('follow_up_status', 'pending')
                                    ->whereDate('follow_up_date', '<=', now())
                                    ->count(),
        ];

        return response()->json(['data' => $docs, 'stats' => $stats]);
    }

    // تحديث حالة المتابعة
    public function updateFollowUp(Request $http, $id)
    {
        $http->validate([
        'follow_up_status' => 'required|in:pending,done,rescheduled,completed',
        'follow_up_notes'  => 'nullable|string',
        'follow_up_date'   => 'nullable|date',
    ]);

    $doc = CaseDocumentation::findOrFail($id);
    $doc->update([
        'follow_up_status' => $http->follow_up_status,
        'follow_up_notes'  => $http->follow_up_notes,
        'follow_up_date'   => $http->follow_up_date ?? $doc->follow_up_date,
    ]);

        return response()->json(['message' => 'تم تحديث المتابعة', 'data' => $doc]);
    }

    // حذف ملف
    public function deleteFile($fileId)
    {
        $file = DocumentationFile::findOrFail($fileId);
        Storage::disk('public')->delete($file->file_path);
        $file->delete();
        return response()->json(['message' => 'تم حذف الملف']);
    }
}