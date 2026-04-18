<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function store(Request $http)
    {
        $data = $http->validate([
            'name'           => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'email'          => 'nullable|email|max:255',
            'region'         => 'required|string',
            'volunteer_type' => 'required|string',
            'availability'   => 'required|string',
            'skills'         => 'nullable|string',
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to('hamzabackend98@gmail.com')  // غيّر للإيميل الرسمي
                ->send(new \App\Mail\VolunteerRequest($data));
        } catch (\Exception $e) {
            \Log::error('Volunteer mail error: ' . $e->getMessage());
        }

        return response()->json(['message' => 'تم إرسال طلب التطوع بنجاح'], 201);
    }
}