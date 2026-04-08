<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewRequestSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $requestId,
        public string $fullName,
        public string $refNumber,
        public string $assistanceType,
        public string $region,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('requests'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new.request';
    }
}