<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        DB::statement("ALTER TABLE case_documentations MODIFY COLUMN follow_up_status ENUM('pending','done','rescheduled','completed') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE case_documentations MODIFY COLUMN follow_up_status ENUM('pending','done') DEFAULT 'pending'");
    }
};
