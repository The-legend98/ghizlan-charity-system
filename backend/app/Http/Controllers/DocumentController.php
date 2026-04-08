<?php

namespace App\Http\Controllers;

use App\Models\RequestDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    // رفع ملف
    public function store(Request $http, $requestId)
    {
        $http->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,pdf',
            'type' => 'required|in:photo,medical_report,official_proof,other',
        ]);

        $file     = $http->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $path     = $file->storeAs("requests/{$requestId}", $fileName, 'local');

        $document = RequestDocument::create([
            'request_id' => $requestId,
            'type'       => $http->type,
            'file_path'  => $path,
            'file_name'  => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message'  => 'تم رفع الملف بنجاح',
            'document' => $document,
        ], 201);
    }

    // قائمة ملفات طلب
    public function index($requestId)
    {
        $documents = RequestDocument::where('request_id', $requestId)->get();
        return response()->json($documents);
    }

    // حذف ملف
    public function destroy($requestId, $documentId)
    {
        $document = RequestDocument::where('request_id', $requestId)
            ->where('id', $documentId)
            ->firstOrFail();

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'تم حذف الملف']);
    }


    public function addMore(Request $http, $id)
    {
        $http->validate([
            'files.*'    => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'phone'      => 'required|string',
            'ref_number' => 'required|string',
        ]);

        $request = \App\Models\Request::findOrFail($id);

        // تحقق إن الهاتف ورقم المرجع مطابقان
        if ($request->phone !== $http->phone || $request->ref_number !== $http->ref_number) {
            return response()->json(['message' => 'رقم الهاتف أو رقم المرجع غير صحيح'], 403);
        }

        $uploaded = [];
        if ($http->hasFile('files')) {
            foreach ($http->file('files') as $file) {
                $path = $file->store('documents', 'public');
                $doc  = \App\Models\RequestDocument::create([
                    'request_id' => $id,
                    'file_path'  => $path,
                    'file_name'  => $file->getClientOriginalName(),
                    'type'       => 'other',
                ]);
                $uploaded[] = $doc;
            }
        }

        return response()->json([
            'message' => 'تم رفع الملفات بنجاح',
            'files'   => $uploaded,
        ]);
    }

    public function download($documentId)
{
    $document = RequestDocument::findOrFail($documentId);
    
   if (!Storage::disk('public')->exists($document->file_path)) {
        return response()->json(['message' => 'الملف غير موجود'], 404);
    }

    return Storage::disk('public')->download(
        $document->file_path,
        $document->file_name
    );
}

}