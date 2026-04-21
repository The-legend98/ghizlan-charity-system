<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Request extends Model
{
        

    use HasFactory;
      protected $fillable = [
        'ref_number','full_name', 'phone', 'age', 'gender',
        'family_members', 'children_count',
        'national_id', 'income_range', 'housing_status',
        'housing_details',
        'region', 'address',
        'assistance_type', 'description',
        'priority', 'status', 'assigned_to',
        'documents_reminder_sent_at','email', 'follow_up_date',
        'follow_up_note', 
        'follow_up_status',
    ];

    protected $casts = [
        'documents_reminder_sent_at' => 'datetime',
        'follow_up_date' => 'datetime',

      
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

    public function documentation() {
    return $this->hasOne(CaseDocumentation::class, 'request_id');}
}
