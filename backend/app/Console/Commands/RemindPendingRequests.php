<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class RemindPendingRequests extends Command
{
    protected $signature   = 'requests:remind';
    protected $description = 'تذكير الموظفين بالطلبات المعلقة قبل 7 أيام';

    public function handle()
    {
        // الطلبات التي لم تُحدَّث منذ 5 أيام أو أكثر وحالتها معلقة
        $requests = Request::whereIn('status', ['new', 'reviewing', 'needs_info'])
            ->where('updated_at', '<=', now()->subDays(5))
            ->where('updated_at', '>=', now()->subDays(7))
            ->with('assignedTo')
            ->get();

        foreach ($requests as $req) {
            if (!$req->assignedTo) continue;

           $daysLeft = 7 - (int) $req->updated_at->diffInDays(now());


            // إيميل للموظف
            try {
                Mail::to($req->assignedTo->email)->send(
                    new \App\Mail\PendingRequestReminder(
                        employeeName: $req->assignedTo->name,
                        refNumber:    $req->ref_number,
                        fullName:     $req->full_name,
                        daysLeft:     $daysLeft,
                    )
                );
            } catch (\Exception $e) {
                \Log::error('Reminder mail error: ' . $e->getMessage());
            }

            // إشعار WebSocket للموظف
            try {
                broadcast(new \App\Events\NewRequestSubmitted(
                    requestId:      (string) $req->id,
                    fullName:       $req->full_name,
                    refNumber:      $req->ref_number,
                    assistanceType: $req->assistance_type,
                    region:         $req->region,
                    assignedToId:   $req->assigned_to,
                ));
            } catch (\Exception $e) {}
        }

        $this->info("تم إرسال {$requests->count()} تذكير");
    }
}