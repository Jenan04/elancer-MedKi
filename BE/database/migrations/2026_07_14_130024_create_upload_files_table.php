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
        Schema::create('upload_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('deck_id')->constrained()->cascadeOnDelete();

            $table->string('original_name');
            $table->string('original_file_url');
            $table->string('extension');
            
            $table->string('csv_file_url')->nullable(); 
            
            
            $table->enum('status', ['uploaded', 'converting', 'completed', 'failed'])->default('uploaded');
            $table->text('error_message')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_files');
    }
};
