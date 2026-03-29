<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestDocument extends Model
{
    protected $fillable = [
        'request_id', 'type', 'file_path', 'file_name',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}
