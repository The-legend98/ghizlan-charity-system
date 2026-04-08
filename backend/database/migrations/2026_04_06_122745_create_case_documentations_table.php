<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('case_documentations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->enum('result', ['completed', 'partial', 'not_delivered']);
            $table->decimal('amount_delivered', 10, 2)->nullable();
            $table->string('service_delivered')->nullable();
            $table->date('delivery_date');
            $table->text('notes')->nullable();
            $table->boolean('needs_follow_up')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->string('follow_up_reason')->nullable();
            $table->enum('follow_up_status', ['pending', 'done'])->default('pending');
            $table->text('follow_up_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('case_documentations');
    }
};