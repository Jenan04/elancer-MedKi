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
        Schema::create('card_user', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('card_id')->constrained('cards')->cascadeOnDelete();
            
            $table->timestamp('due_at')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->integer('box_level')->default(1);
            $table->decimal('ease_factor', 4, 2)->default(2.50);
            $table->timestamps();

            $table->primary(['user_id', 'card_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_user');
    }
};
