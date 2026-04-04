<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Resolve the Laravel base path for both local development and Sakura-style uploads.
$basePathCandidates = [
    dirname(__DIR__),
    dirname(__DIR__) . '/app-unfold',
];

$basePath = null;
foreach ($basePathCandidates as $candidate) {
    if (file_exists($candidate . '/bootstrap/app.php')) {
        $basePath = $candidate;
        break;
    }
}

if ($basePath === null) {
    http_response_code(500);
    echo 'Laravel base path could not be resolved.';
    exit;
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $basePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $basePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $basePath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
