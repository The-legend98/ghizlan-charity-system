<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentationFile extends Model {
    protected $fillable = ['documentation_id', 'file_path', 'file_name', 'file_type'];

    public function documentation() {
        return $this->belongsTo(CaseDocumentation::class, 'documentation_id');
    }
}