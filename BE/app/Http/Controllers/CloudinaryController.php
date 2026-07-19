<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CloudinaryController extends Controller
{
    public function generateSignature(Request $request)
    {
        try {
            $timestamp = time();
            
            $paramsToSign = [
                'folder'    => 'medki_documents',
                'timestamp' => $timestamp,
            ];

            $apiSecret = config('services.cloudinary.api_secret') ?? config('cloudinary.api_secret') ?? env('CLOUDINARY_API_SECRET');
            $apiKey    = config('services.cloudinary.api_key') ?? config('cloudinary.api_key') ?? env('CLOUDINARY_API_KEY');
            $cloudName = config('services.cloudinary.cloud_name') ?? config('cloudinary.cloud_name') ?? env('CLOUDINARY_CLOUD_NAME');

            if (!$apiSecret || !$apiKey || !$cloudName) {
                Log::error('Cloudinary Configuration Error: Keys are missing in .env');
                return response()->json(['error' => 'Cloudinary credentials missing.'], 500);
            }

            ksort($paramsToSign);

            $queryString = [];
            foreach ($paramsToSign as $key => $value) {
                $queryString[] = "{$key}={$value}";
            }
            $stringToSign = implode('&', $queryString);

            $stringToSignWithSecret = $stringToSign . $apiSecret;

            $signature = sha1($stringToSignWithSecret);

            return response()->json([
                'signature'  => $signature,
                'timestamp'  => $timestamp,
                'cloud_name' => $cloudName,
                'api_key'    => $apiKey,
            ]);

        } catch (\Exception $e) {
            Log::error('Signature Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Internal server error during signing.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}