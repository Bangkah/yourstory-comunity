<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Web routes - Inertia pages
Route::get('/', function () {
    return Inertia::render('Home');
});

Route::get('/stories', function () {
    return Inertia::render('Stories');
});

Route::get('/login', function () {
    return Inertia::render('Login');
});

Route::get('/register', function () {
    return Inertia::render('Register');
});
