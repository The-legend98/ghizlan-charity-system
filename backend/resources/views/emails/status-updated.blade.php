<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تحديث حالة الطلب</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F0F7FF; direction: rtl; }
  .wrapper { max-width: 580px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(27,108,168,0.1); }
  .header { padding: 40px 32px; text-align: center; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: white; }
  .header p { color: rgba(255,255,255,0.85); font-size: 14px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #1a1a1a; margin-bottom: 12px; font-weight: 600; }
  .message { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
  .status-box { border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 24px; }
  .status-label { font-size: 12px; color: #666; margin-bottom: 8px; }
  .status-value { font-size: 22px; font-weight: 700; }
  .ref-box { background: #F0F7FF; border: 1px solid #1B6CA820; border-radius: 12px; padding: 16px 24px; text-align: center; margin-bottom: 24px; }
  .ref-label { font-size: 12px; color: #666; margin-bottom: 4px; }
  .ref-number { font-size: 20px; font-weight: 700; color: #1B6CA8; }
  .note-box { background: #FEF3C7; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
  .note-label { font-size: 12px; color: #92400E; margin-bottom: 4px; font-weight: 600; }
  .note-text { font-size: 13px; color: #78350F; line-height: 1.6; }
  .cta { text-align: center; margin-bottom: 24px; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #1B6CA8, #4AACCD); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600; }
  .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; border-top: 1px solid #eee; }
  .footer p { font-size: 12px; color: #888; line-height: 1.8; }
  .footer .org { font-weight: 600; color: #1B6CA8; }
</style>
</head>
<body>
<div class="wrapper">

  @php
    $statusConfig = [
      'new'        => ['label' => 'جديد',            'color' => '#1B6CA8', 'bg' => '#EBF4FA'],
      'reviewing'  => ['label' => 'قيد المراجعة',    'color' => '#D97706', 'bg' => '#FEF3C7'],
      'needs_info' => ['label' => 'يحتاج معلومات',   'color' => '#7C3AED', 'bg' => '#EDE9FE'],
      'approved'   => ['label' => 'مقبول',           'color' => '#059669', 'bg' => '#D1FAE5'],
      'rejected'   => ['label' => 'مرفوض',           'color' => '#DC2626', 'bg' => '#FEE2E2'],
    ];
    $config = $statusConfig[$newStatus] ?? $statusConfig['new'];
  @endphp

  <div class="header" style="background: linear-gradient(135deg, {{ $config['color'] }}, {{ $config['color'] }}CC)">
    <div style="font-size: 40px; margin-bottom: 12px;">
      @if($newStatus === 'approved') ✅
      @elseif($newStatus === 'rejected') ❌
      @elseif($newStatus === 'reviewing') 🔍
      @elseif($newStatus === 'needs_info') 📋
      @else 📌
      @endif
    </div>
    <h1>تم تحديث حالة طلبك</h1>
    <p>مؤسسة غزلان الخير الإنسانية</p>
  </div>

  <div class="body">
    <p class="greeting">السلام عليكم {{ $fullName }}،</p>
    <p class="message">نود إعلامك بأنه تم تحديث حالة طلبك لدى مؤسسة غزلان الخير.</p>

    <div class="status-box" style="background: {{ $config['bg'] }}">
      <div class="status-label">الحالة الجديدة</div>
      <div class="status-value" style="color: {{ $config['color'] }}">{{ $config['label'] }}</div>
    </div>

    <div class="ref-box">
      <div class="ref-label">رقم طلبك المرجعي</div>
      <div class="ref-number">{{ $refNumber }}</div>
    </div>

    @if($note)
    <div class="note-box">
      <div class="note-label">ملاحظة من الفريق:</div>
      <div class="note-text">{{ $note }}</div>
    </div>
    @endif

    <p class="message">
      @if($newStatus === 'approved')
        تهانينا! تم قبول طلبك. سيتواصل معك فريقنا قريباً لترتيب تقديم المساعدة.
      @elseif($newStatus === 'rejected')
        نأسف، لم نتمكن من قبول طلبك في الوقت الحالي. يمكنك التواصل معنا لمزيد من المعلومات.
      @elseif($newStatus === 'needs_info')
        نحتاج معلومات إضافية لاستكمال مراجعة طلبك. سيتواصل معك أحد موظفينا على رقم هاتفك.
      @elseif($newStatus === 'reviewing')
        طلبك قيد المراجعة حالياً من قِبل فريقنا. سنتواصل معك قريباً.
      @endif
    </p>

    <div class="cta">
      <a href="http://localhost:3000/track?query={{ $refNumber }}" class="cta-btn">
        تتبع حالة طلبي ←
      </a>
    </div>
  </div>

  <div class="footer">
    <p class="org">مؤسسة غزلان الخير الإنسانية</p>
    <p>Ghozlan Alkhair Foundation</p>
    <p style="margin-top:8px">هذا البريد تم إرساله تلقائياً — يُرجى عدم الرد عليه</p>
  </div>

</div>
</body>
</html>