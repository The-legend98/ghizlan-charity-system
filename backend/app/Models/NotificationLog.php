<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
   protected $fillable = [
        'request_id', 'recipient_phone', 'recipient_email',
        'channel', 'type', 'message', 'status',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}
