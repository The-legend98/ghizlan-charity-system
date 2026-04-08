<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // قائمة المستخدمين — للمدير فقط
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    // إضافة موظف جديد
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => ['required', Rule::in(['employee', 'manager'])],
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'تم إضافة الموظف بنجاح',
            'user'    => $user,
        ], 201);
    }

    // تعديل حالة المستخدم (تفعيل/تعطيل)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user->update(['is_active' => $request->is_active]);

        return response()->json([
            'message' => $request->is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب',
        ]);
    }


    // تغيير كلمة المرور
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate([
            'password' => 'required|string|min:8',
        ]);
        $user->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'تم تغيير كلمة المرور بنجاح']);
    }

    // حذف مستخدم
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'تم حذف المستخدم']);
    }

    // إحصائيات أداء الموظفين — للمدير فقط
public function performance()
{
    $employees = User::where('role', 'employee')
        ->where('is_active', true)
        ->withCount([
            'assignedRequests as total_requests',
            'assignedRequests as new_requests' => function ($q) {
                $q->where('status', 'new');
            },
            'assignedRequests as reviewing_requests' => function ($q) {
                $q->where('status', 'reviewing');
            },
            'assignedRequests as approved_requests' => function ($q) {
                $q->where('status', 'approved');
            },
            'assignedRequests as rejected_requests' => function ($q) {
                $q->where('status', 'rejected');
            },
            'assignedRequests as pending_requests' => function ($q) {
                $q->whereIn('status', ['new', 'reviewing', 'needs_info']);
            },
        ])
        ->get()
        ->map(function ($emp) {
            $completionRate = $emp->total_requests > 0
                ? round(($emp->approved_requests / $emp->total_requests) * 100)
                : 0;

            return [
                'id'               => $emp->id,
                'name'             => $emp->name,
                'email'            => $emp->email,
                'total_requests'   => $emp->total_requests,
                'new_requests'     => $emp->new_requests,
                'reviewing'        => $emp->reviewing_requests,
                'approved'         => $emp->approved_requests,
                'rejected'         => $emp->rejected_requests,
                'pending'          => $emp->pending_requests,
                'completion_rate'  => $completionRate,
            ];
        });

    return response()->json($employees);
}
}