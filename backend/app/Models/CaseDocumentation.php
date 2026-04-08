<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseDocumentation extends Model {
    protected $fillable = [
        'request_id', 'created_by', 'result',
        'amount_delivered', 'service_delivered',
        'delivery_date', 'notes',
        'needs_follow_up', 'follow_up_date',
        'follow_up_reason', 'follow_up_status', 'follow_up_notes',
    ];

    protected $casts = [
        'needs_follow_up' => 'boolean',
        'delivery_date'   => 'date',
        'follow_up_date'  => 'date',
    ];

    public function request() {
        return $this->belongsTo(Request::class);
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function files() {
        return $this->hasMany(DocumentationFile::class, 'documentation_id');
    }
}