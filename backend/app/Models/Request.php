<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
      protected $fillable = [
        'full_name', 'phone', 'age', 'gender',
        'family_members', 'children_count',
        'monthly_income', 'housing_status',
        'region', 'address',
        'assistance_type', 'description',
        'priority', 'status', 'assigned_to',
        'documents_reminder_sent_at',
    ];

    protected $casts = [
        'documents_reminder_sent_at' => 'datetime',
        'monthly_income' => 'decimal:2',
    ];

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function documents()
    {
        return $this->hasMany(RequestDocument::class);
    }

    public function statusLogs()
    {
        return $this->hasMany(RequestStatusLog::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function notifications()
    {
        return $this->hasMany(NotificationLog::class);
    }
}
