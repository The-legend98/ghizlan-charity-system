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
}