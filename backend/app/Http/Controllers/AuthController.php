<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['هذا الحساب معطّل. تواصل مع المدير.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'تم تسجيل الخروج بنجاح.']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'id'    => $request->user()->id,
            'name'  => $request->user()->name,
            'email' => $request->user()->email,
            'role'  => $request->user()->role,
        ]);
    }


    public function forgotPassword(Request $http)
{
    $http->validate(['email' => 'required|email']);

    $status = Password::sendResetLink($http->only('email'));

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => 'تم إرسال رابط إعادة التعيين على بريدك'])
        : response()->json(['message' => 'البريد غير موجود'], 404);
}

public function resetPassword(Request $http)
{
    $http->validate([
        'token'    => 'required',
        'email'    => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $http->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill(['password' => bcrypt($password)])->save();
        }
    );

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => 'تم تغيير كلمة المرور بنجاح'])
        : response()->json(['message' => 'الرابط غير صالح أو منتهي الصلاحية'], 400);
}
}