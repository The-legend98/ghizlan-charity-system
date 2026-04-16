<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
   public function boot(): void
{
    if (config('app.env') === 'production') {
        \URL::forceScheme('https');
    }

     \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
        return config('app.frontend_url') . '/dashboard/reset-password?token=' . $token . '&email=' . urlencode($user->email);
    });
}
}
