<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تأكيد استلام الطلب</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F0F7FF; direction: rtl; }
  .wrapper { max-width: 580px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(27,108,168,0.1); }
  .header { background: linear-gradient(135deg, #1B6CA8, #4AACCD); padding: 40px 32px; text-align: center; }
  .header-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
  .header h1 { color: white; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .header p { color: rgba(255,255,255,0.85); font-size: 14px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #1a1a1a; margin-bottom: 12px; font-weight: 600; }
  .message { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
  .ref-box { background: #F0F7FF; border: 2px solid #1B6CA8; border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 24px; }
  .ref-label { font-size: 12px; color: #666; margin-bottom: 6px; }
  .ref-number { font-size: 28px; font-weight: 700; color: #1B6CA8; letter-spacing: 2px; }
  .details-box { background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .details-box h3 { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #888; }
  .detail-value { color: #333; font-weight: 500; }
  .steps { margin-bottom: 24px; }
  .steps h3 { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; }
  .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .step-num { width: 24px; height: 24px; background: #1B6CA8; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
  .step-text { font-size: 13px; color: #555; line-height: 1.6; }
  .cta { text-align: center; margin-bottom: 24px; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #1B6CA8, #4AACCD); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 600; }
  .footer { background: #f5f5f5; padding: 20px 32px; text-align: center; border-top: 1px solid #eee; }
  .footer p { font-size: 12px; color: #888; line-height: 1.8; }
  .footer .org { font-weight: 600; color: #1B6CA8; }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="header-icon">
      <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <h1>تم استلام طلبك بنجاح!</h1>
    <p>مؤسسة غزلان الخير الإنسانية</p>
  </div>

  <div class="body">

    <p class="greeting">السلام عليكم {{ $fullName }}،</p>
    <p class="message">
      يسعدنا إعلامك بأنه تم استلام طلبك بنجاح وسيتم مراجعته من قِبل فريق مؤسسة غزلان الخير في أقرب وقت ممكن.
    </p>

    <div class="ref-box">
      <div class="ref-label">رقم طلبك المرجعي</div>
      <div class="ref-number">{{ $refNumber }}</div>
      <div style="font-size:11px;color:#888;margin-top:6px">احتفظ بهذا الرقم لمتابعة طلبك</div>
    </div>

    <div class="details-box">
      <h3>تفاصيل الطلب</h3>
      <div class="detail-row">
        <span class="detail-label">الاسم</span>
        <span class="detail-value">{{ $fullName }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">نوع المساعدة</span>
        <span class="detail-value">
          @if($assistanceType === 'medical') علاج طبي
          @elseif($assistanceType === 'education') تعليم
          @else دعم معيشي
          @endif
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">حالة الطلب</span>
        <span class="detail-value" style="color:#1B6CA8">جديد — قيد الانتظار</span>
      </div>
    </div>

    <div class="steps">
      <h3>ماذا يحدث بعد ذلك؟</h3>
      <div class="step">
        <div class="step-num">١</div>
        <div class="step-text">سيتم مراجعة طلبك خلال <strong>٣-٧ أيام عمل</strong></div>
      </div>
      <div class="step">
        <div class="step-num">٢</div>
        <div class="step-text">سيتواصل معك أحد موظفينا على <strong>رقم هاتفك المسجّل</strong></div>
      </div>
      <div class="step">
        <div class="step-num">٣</div>
        <div class="step-text">يمكنك متابعة حالة طلبك في أي وقت عبر الموقع برقمك المرجعي</div>
      </div>
    </div>

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