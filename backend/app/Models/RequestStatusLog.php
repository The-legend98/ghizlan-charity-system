<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestStatusLog extends Model
{
   protected $fillable = [
        'request_id', 'changed_by', 'from_status', 'to_status', 'note',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
