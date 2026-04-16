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
    Schema::table('requests', function (Blueprint $table) {
        $table->timestamp('follow_up_date')->nullable()->after('status');
        $table->text('follow_up_note')->nullable()->after('follow_up_date');
        $table->enum('follow_up_status', ['none','scheduled','done','completed'])
              ->default('none')->after('follow_up_note');
    });
}

public function down(): void
{
    Schema::table('requests', function (Blueprint $table) {
        $table->dropColumn(['follow_up_date','follow_up_note','follow_up_status']);
    });
}
};
