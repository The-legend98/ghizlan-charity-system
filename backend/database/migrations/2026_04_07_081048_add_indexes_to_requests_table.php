<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('requests', function (Blueprint $table) {
            $table->index('status');
            $table->index('assigned_to');
            $table->index('region');
            $table->index('assistance_type');
            $table->index('created_at');
        });
    }

    public function down(): void {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['assigned_to']);
            $table->dropIndex(['region']);
            $table->dropIndex(['assistance_type']);
            $table->dropIndex(['created_at']);
        });
    }
};