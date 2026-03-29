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
         Schema::create('notifications_log', function (Blueprint $table) {
        $table->id();
        $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
        $table->string('recipient_phone');
        $table->string('recipient_email')->nullable();
        $table->enum('channel', ['sms', 'whatsapp', 'email']);
        $table->enum('type', ['confirmation', 'status_change', 'reminder', 'info_needed']);
        $table->text('message');
        $table->enum('status', ['sent', 'failed'])->default('sent');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications_log');
    }
};
