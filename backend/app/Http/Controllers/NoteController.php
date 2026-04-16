<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    // قائمة ملاحظات طلب معين
    public function index($requestId)
    {
        $notes = Note::with('user')
            ->where('request_id', $requestId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    // إضافة ملاحظة
    public function store(Request $http, $requestId)
    {
        $http->validate([
            'content' => 'required|string|min:3|max:1000',
        ]);

        $note = Note::create([
            'request_id' => $requestId,
            'user_id'    => $http->user()->id,
            'content'    => $http->content,
        ]);

        return response()->json([
            'message' => 'تمت إضافة الملاحظة بنجاح',
            'note'    => $note->load('user'),
        ], 201);
    }

    // حذف ملاحظة
   public function destroy(Request $http, $requestId, $noteId)
{
    $note = Note::where('request_id', $requestId)
        ->where('id', $noteId)
        ->firstOrFail();

    // المدير يحذف أي ملاحظة، الموظف يحذف ملاحظاته فقط
    if ($http->user()->role !== 'manager' && $note->user_id !== $http->user()->id) {
        return response()->json(['message' => 'غير مصرح'], 403);
    }

    $note->delete();

    return response()->json(['message' => 'تم حذف الملاحظة']);
}
}