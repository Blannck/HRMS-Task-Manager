<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Media Library Configuration
    |--------------------------------------------------------------------------
    */

    'disk_name' => env('MEDIA_DISK', 'public'),

    'max_file_size' => 1024 * 1024 * 10, // 10MB

    'media_model' => \Spatie\MediaLibrary\MediaCollections\Models\Media::class,

    'url_generator' => \Spatie\MediaLibrary\Support\UrlGenerator::class,

    'path_generator' => \Spatie\MediaLibrary\PathGenerator\DefaultPathGenerator::class,

];
