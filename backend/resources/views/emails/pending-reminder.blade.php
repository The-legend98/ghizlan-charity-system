<x-mail::message>
# تذكير بطلب معلق

مرحباً {{ $employeeName }}،

يوجد طلب لم يتم تحديثه منذ فترة ويحتاج مراجعتك:

<x-mail::panel>
**رقم الطلب:** {{ $refNumber }}

**اسم المقدم:** {{ $fullName }}

**الأيام المتبقية:** {{ $daysLeft }} أيام قبل انتهاء المهلة
</x-mail::panel>

<x-mail::button :url="config('app.url') . '/dashboard/requests'">
مراجعة الطلب الآن
</x-mail::button>

شكراً،<br>
{{ config('app.name') }}
</x-mail::message>