<?php

use App\Http\Controllers\RoomApiController;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], '/', [RoomApiController::class, 'handle']);
