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
         Schema::create('request_status_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
        $table->foreignId('changed_by')->constrained('users')->cascadeOnDelete();
        $table->enum('from_status', ['new', 'reviewing', 'needs_info', 'approved', 'rejected'])->nullable();
        $table->enum('to_status', ['new', 'reviewing', 'needs_info', 'approved', 'rejected']);
        $table->text('note')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_status_logs');
    }
};
