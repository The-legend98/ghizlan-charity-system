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
       Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone');
            $table->integer('age');
            $table->enum('gender', ['male', 'female']);
            $table->integer('family_members');
            $table->integer('children_count')->default(0);
            $table->decimal('monthly_income', 20, 2)->default(0);
            $table->enum('housing_status', ['owned', 'rented', 'other']);
            $table->string('region');
            $table->string('address')->nullable();
            $table->enum('assistance_type', ['medical', 'education', 'financial']);
            $table->text('description');
            $table->enum('priority', ['high', 'medium', 'normal'])->default('normal');
            $table->enum('status', ['new', 'reviewing', 'needs_info', 'approved', 'rejected'])->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('documents_reminder_sent_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
