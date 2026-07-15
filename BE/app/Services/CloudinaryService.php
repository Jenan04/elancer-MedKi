<?php

namespace App\Services;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
class CloudinaryService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        Configuration::instance([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key'    => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret')
            ],
            'url' => [
                'secure' => true
            ]
            ]);
    }

    /**
     * upload anu file to cloudinary
     * 
     * @param string|\Illuminate\Http\UploadedFile $file
     * @param string $folder the folder in cloudinary
     * @return string secure url of the file
     */
    public function uploadFile($file, string $folder = 'medki_uploads'): string
    {
        $filePath = is_string($file) ? $file : $file->getRealPath();

        $response = (new UploadApi())->upload($filePath, [
            'folder' => $folder,
            'resource_type' => 'auto', 
        ]);

        return $response['secure_url'];
    }

}
