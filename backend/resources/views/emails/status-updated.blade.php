<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>تحديث حالة الطلب</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF5FB;font-family:Arial,sans-serif;direction:rtl;text-align:right;">

@php
  $statusConfig = [
    'new'        => ['label' => 'جديد',           'color' => '#1B6CA8', 'bg' => '#EEF5FB', 'light' => '#DBEAFE'],
    'reviewing'  => ['label' => 'قيد المراجعة',   'color' => '#D97706', 'bg' => '#FEF3C7', 'light' => '#FDE68A'],
    'needs_info' => ['label' => 'يحتاج معلومات',  'color' => '#7C3AED', 'bg' => '#EDE9FE', 'light' => '#DDD6FE'],
    'approved'   => ['label' => 'مقبول',          'color' => '#059669', 'bg' => '#D1FAE5', 'light' => '#A7F3D0'],
    'rejected'   => ['label' => 'مرفوض',          'color' => '#DC2626', 'bg' => '#FEE2E2', 'light' => '#FECACA'],
  ];
  $cfg = $statusConfig[$newStatus] ?? $statusConfig['new'];
@endphp

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF5FB;padding:32px 16px;" dir="rtl">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(27,108,168,0.12);" dir="rtl">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,{{ $cfg['color'] }} 0%,{{ $cfg['color'] }}CC 100%);padding:44px 32px 36px;text-align:center;" align="center">

            <!-- Logo Circle -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
              <tr>
               <td align="center" style="width:80px;height:80px;">
                  <img src="{{ $logoUrl }}"
                    alt="غزلان الخير"
                    width="80" height="80"
                    style="width:80px;height:80px;object-fit:contain;display:block;border-radius:50%;background:white;padding:6px;"/>
                </td>
              </tr>
            </table>

            <!-- Status Badge -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
              <tr>
                <td style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:100px;padding:5px 16px;">
                  <span style="font-size:12px;color:rgba(255,255,255,0.9);font-weight:600;font-family:Arial,sans-serif;">تحديث حالة الطلب</span>
                </td>
              </tr>
            </table>

            <h1 style="color:white;font-size:22px;font-weight:800;margin:0 0 6px 0;font-family:Arial,sans-serif;">تم تحديث حالة طلبك</h1>
            <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;font-family:Arial,sans-serif;">مؤسسة غزلان الخير الإنسانية</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;" dir="rtl">

            <!-- Greeting -->
            <p style="font-size:16px;color:#111827;margin:0 0 10px 0;font-weight:700;font-family:Arial,sans-serif;text-align:right;">السلام عليكم {{ $fullName }}،</p>
            <p style="font-size:14px;color:#6B7280;line-height:1.8;margin:0 0 28px 0;font-family:Arial,sans-serif;text-align:right;">
              نود إعلامك بأنه تم تحديث حالة طلبك لدى مؤسسة غزلان الخير الإنسانية.
            </p>

            <!-- Status Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:{{ $cfg['bg'] }};border:1.5px solid {{ $cfg['light'] }};border-radius:14px;padding:22px 24px;text-align:center;" align="center">
                  <p style="font-size:11px;color:#9CA3AF;margin:0 0 10px 0;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">الحالة الجديدة لطلبك</p>
                  <p style="font-size:24px;font-weight:900;color:{{ $cfg['color'] }};margin:0 0 6px 0;font-family:Arial,sans-serif;">{{ $cfg['label'] }}</p>
                </td>
              </tr>
            </table>

            <!-- Ref Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;padding:16px 24px;text-align:center;" align="center">
                  <p style="font-size:11px;color:#9CA3AF;margin:0 0 6px 0;font-family:Arial,sans-serif;">رقم طلبك المرجعي</p>
                  <p style="font-size:22px;font-weight:900;color:#1B6CA8;letter-spacing:2px;margin:0;font-family:Arial,sans-serif;">{{ $refNumber }}</p>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
            </table>

            @if($note)
            <!-- Note Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px 18px;border-right:4px solid #D97706;" dir="rtl">
                  <p style="font-size:12px;color:#92400E;margin:0 0 6px 0;font-weight:700;font-family:Arial,sans-serif;text-align:right;">ملاحظة من الفريق</p>
                  <p style="font-size:13px;color:#78350F;margin:0;line-height:1.7;font-family:Arial,sans-serif;text-align:right;">{{ $note }}</p>
                </td>
              </tr>
            </table>
            @endif

            <!-- Status Message -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#F8FAFC;border-radius:12px;padding:16px 18px;border-right:4px solid {{ $cfg['color'] }};" dir="rtl">
                  <p style="font-size:13px;color:#374151;margin:0;line-height:1.8;font-family:Arial,sans-serif;text-align:right;">
                    @if($newStatus === 'approved')
                      تهانينا! تم قبول طلبك. سيتواصل معك فريقنا قريباً لترتيب تقديم المساعدة المطلوبة.
                    @elseif($newStatus === 'rejected')
                      نأسف، لم نتمكن من قبول طلبك في الوقت الحالي. يمكنك التواصل معنا لمزيد من المعلومات أو إعادة التقديم لاحقاً.
                    @elseif($newStatus === 'needs_info')
                      نحتاج معلومات إضافية لاستكمال مراجعة طلبك. سيتواصل معك أحد موظفينا على رقم هاتفك المسجّل.
                    @elseif($newStatus === 'reviewing')
                      طلبك قيد المراجعة حالياً من قِبل فريقنا المختص. سنتواصل معك قريباً.
                    @endif
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
              <tr>
                <td align="center">
                  <a href="{{ config('app.frontend_url') }}/track?query={{ $refNumber }}"
                     style="display:inline-block;background:linear-gradient(135deg,#1B6CA8,#4AACCD);color:white;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:0.3px;">
                    تتبع حالة طلبي
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #F1F5F9;" align="center">
            <p style="font-size:13px;font-weight:800;color:#1B6CA8;margin:0 0 2px 0;font-family:Arial,sans-serif;">مؤسسة غزلان الخير الإنسانية</p>
            <p style="font-size:11px;color:#9CA3AF;letter-spacing:0.5px;margin:0 0 10px 0;font-family:Arial,sans-serif;">Ghozlan Alkhair Foundation</p>
            <p style="font-size:11px;color:#D1D5DB;margin:0;font-family:Arial,sans-serif;">هذا البريد تم إرساله تلقائياً — يُرجى عدم الرد عليه</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>