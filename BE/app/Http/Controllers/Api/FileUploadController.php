<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ConvertFileToCsvJob;
use App\Models\UploadFile;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class FileUploadController extends Controller
{
    protected $cloudinaryService;
    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function upload(Request $request, $deckId)
    {
        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max
        ]);

        $secureUrl = $this->cloudinaryService->uploadFile(
            $request->file('file'), 
            'medki/raw' 
        );

        $uploadedFile = UploadFile::create([
            'deck_id'           => $deckId,
            'user_id'           => Auth::id(), 
            'original_name'     => $request->file('file')->getClientOriginalName(),
            'original_file_url' => $secureUrl, 
            'extension'         => $request->file('file')->getClientOriginalExtension(),
            'csv_file_url'      => null,
            'status'            => 'uploaded', 
        ]);

        return response()->json(['file' => $uploadedFile], 201);
    }

    public function convert(UploadFile $file)
    {
        abort_if($file->user_id !== Auth::id(), 403);
        abort_if($file->status === 'converting', 409, 'Already converting');

        $file->update(['status' => 'converting']);

        // Dispatch background job
        ConvertFileToCsvJob::dispatch($file);

        return response()->json(['message' => 'Conversion started', 'file' => $file]);
    }


    public function index()
{
    $files = UploadFile::where('user_id', Auth::id())
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json(['files' => $files]);
}

    public function userFiles()
    {
        $files = UploadFile::where('user_id', Auth::id())
            ->where('status', 'completed')
            ->whereNotNull('csv_file_url')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'original_name', 'csv_file_url']);

        $data = $files->map(function ($file) {
            $csvName = pathinfo($file->original_name, PATHINFO_FILENAME) . '.csv';
            return [
                'id' => $file->id,
                'file_name' => $csvName,
                'url' => $file->csv_file_url,
            ];
        });

        return response()->json(['data' => $data]);
    }

public function show(UploadFile $file)
{
    abort_if($file->user_id !== Auth::id(), 403);
    return response()->json(['file' => $file]);
}

public function download(Request $request, UploadFile $file)
{
    if (!Auth::check() && $request->has('token')) {
        $token = PersonalAccessToken::findToken($request->query('token'));
        if ($token) {
            Auth::login($token->tokenable);
        }
    }

    abort_if(!Auth::check() || $file->user_id !== Auth::id(), 403);
    abort_if(!$file->csv_file_url, 404, 'CSV not ready');



    try {
    $response = Http::withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ])
    ->timeout(30) 
    ->get($file->csv_file_url);

    if ($response->failed()) {
        abort(500, 'Failed to fetch the file from Cloudinary storage.');
    }

    $contents = $response->body();
} catch (\Exception $e) {
    Log::error('Cloudinary download failed: ' . $e->getMessage());
    abort(500, 'Connection to storage timed out.');
}
  return response($contents, 200, [
        'Content-Type'        => 'text/csv',
        'Content-Disposition' => 'attachment; filename="' . pathinfo($file->original_name, PATHINFO_FILENAME) . '.csv"',
    ]);
}


public function uploadGeneric(Request $request)
{
    $request->validate([
        'file' => 'required|file|max:20480', 
    ]);

    try {
        $file = $request->file('file');
        
        $fileUrl = $this->cloudinaryService->uploadFile(
            $file, 
            'medki_documents' 
        );

        $uploadedFile = UploadFile::create([
            // 'user_id'           => auth()->id(),
            'user_id' => Auth::id(),
            'deck_id'           => null, // nullable
            'original_name'     => $file->getClientOriginalName(),
            'original_file_url' => $fileUrl,
            'extension'         => $file->getClientOriginalExtension(),
            'status'            => 'uploaded',
        ]);

        return response()->json([
            'message' => 'File uploaded and secured successfully.',
            'file'    => $uploadedFile
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to upload file to Cloudinary.',
            'error'   => $e->getMessage()
        ], 500);
    }
}

public function registerDocument(Request $request)
{
    $request->validate([
        'file_url' => 'required|url',
        'file_name' => 'required|string',
        'file_size' => 'required|integer',
    ]);

    $uploadedFile = UploadFile::create([
        'user_id'           => Auth::id(),
        'deck_id'           => null,
        'original_name'     => $request->input('file_name'),
        'original_file_url' => $request->input('file_url'),
        'extension'         => pathinfo($request->input('file_name'), PATHINFO_EXTENSION),
        'status'            => 'uploaded',
        'file_size'         => $request->input('file_size'),
    ]);

    return response()->json([
        'message' => 'File registered successfully.',
        'file'    => $uploadedFile
    ], 201);
}
}

