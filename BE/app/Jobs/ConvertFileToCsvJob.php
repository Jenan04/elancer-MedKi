<?php

namespace App\Jobs;

use App\Models\UploadFile; 
use App\Ai\Agents\FlashcardConverterAgent;
use App\Services\CloudinaryService; 
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ConvertFileToCsvJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 120;

    public function __construct(public UploadFile $file) {}

    public function handle(CloudinaryService $cloudinaryService): void
    {
        try {
            // 1. جلب الملف من العمود الصحيح original_file_url
            $content = file_get_contents($this->file->original_file_url);
            
            if (!$content) {
                throw new \Exception("Failed to download file from Cloudinary.");
            }

            $ext  = strtolower(pathinfo($this->file->original_name, PATHINFO_EXTENSION));
            $text = $this->extractText($content, $ext);

            $agent = new FlashcardConverterAgent();
            $csv = (string) $agent->prompt("Convert the following content to flashcard CSV:\n\n" . $text);

            $csv = preg_replace('/^```[a-z]*\n?/m', '', $csv);$csv = trim(str_replace('```', '', $csv));

            $tmpPath = sys_get_temp_dir() . '/' . uniqid('csv_') . '.csv';
            file_put_contents($tmpPath, $csv);

            $csvSecureUrl = $cloudinaryService->uploadFile($tmpPath, 'medki/csv');

            if (file_exists($tmpPath)) {
                unlink($tmpPath);
            }

            $this->file->update([
                'csv_file_url' => $csvSecureUrl,
                'status'       => 'completed', 
            ]);

        } catch (\Throwable $e) {
            Log::error('Conversion failed for file ID ' . $this->file->id . ': ' . $e->getMessage());
            
            $safeErrorMessage = mb_convert_encoding($e->getMessage(), 'UTF-8', 'UTF-8');

            $this->file->update([
                'status'        => 'failed',
                // 'error_message' => $e->getMessage(),
                'error_message' => $safeErrorMessage,
            ]);
        }
    }


    private function extractText(string $content, string $ext): string
{
    $text = '';

    $plain = ['txt', 'md', 'csv', 'json', 'html', 'xml'];
    if (in_array($ext, $plain)) {
        $text = $content;
    } elseif ($ext === 'pdf') {
        $tmp = sys_get_temp_dir() . '/' . uniqid() . '.pdf';
        file_put_contents($tmp, $content);
        
        $text = shell_exec("pdftotext -layout " . escapeshellarg($tmp) . " -") ?? $content;
        
        if (file_exists($tmp)) {
            unlink($tmp);
        }
    } else {
        $text = $content;
    }

    return mb_convert_encoding($text, 'UTF-8', 'UTF-8'); 
}
}