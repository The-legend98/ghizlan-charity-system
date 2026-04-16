<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>تأكيد استلام الطلب</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF5FB;font-family:Arial,sans-serif;direction:rtl;text-align:right;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF5FB;padding:32px 16px;" dir="rtl">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(27,108,168,0.12);" dir="rtl">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B6CA8 0%,#1558A0 60%,#0D3D72 100%);padding:44px 32px 36px;text-align:center;" align="center">

            <!-- Logo Circle -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
              <tr>
                <td align="center" style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);font-size:30px;font-weight:900;color:white;text-align:center;line-height:72px;">
                  غ
                </td>
              </tr>
            </table>

            <!-- Success Badge -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
              <tr>
                <td style="background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.3);border-radius:100px;padding:5px 16px;">
                  <span style="font-size:12px;color:rgba(255,255,255,0.9);font-weight:600;font-family:Arial,sans-serif;">● تم الاستلام بنجاح</span>
                </td>
              </tr>
            </table>

            <h1 style="color:white;font-size:22px;font-weight:800;margin:0 0 6px 0;font-family:Arial,sans-serif;">طلبك وصلنا!</h1>
            <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;font-family:Arial,sans-serif;">مؤسسة غزلان الخير الإنسانية</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;" dir="rtl">

            <!-- Greeting -->
            <p style="font-size:16px;color:#111827;margin:0 0 10px 0;font-weight:700;font-family:Arial,sans-serif;text-align:right;">السلام عليكم {{ $fullName }}،</p>
            <p style="font-size:14px;color:#6B7280;line-height:1.8;margin:0 0 28px 0;font-family:Arial,sans-serif;text-align:right;">
              يسعدنا إعلامك بأن طلبك وصلنا بنجاح وسيتم مراجعته من قِبل فريقنا المختص في أقرب وقت ممكن.
              نحرص على دراسة كل حالة بعناية لضمان وصول الدعم لمستحقيه.
            </p>

            <!-- Ref Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#EEF5FB,#E0F0FF);border:1.5px solid rgba(27,108,168,0.15);border-radius:14px;padding:22px 24px;text-align:center;" align="center">
                  <p style="font-size:11px;color:#9CA3AF;margin:0 0 8px 0;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">رقم طلبك المرجعي</p>
                  <p style="font-size:30px;font-weight:900;color:#1B6CA8;letter-spacing:3px;margin:0 0 6px 0;font-family:Arial,sans-serif;">{{ $refNumber }}</p>
                  <p style="font-size:11px;color:#9CA3AF;margin:0;font-family:Arial,sans-serif;">احتفظ بهذا الرقم لمتابعة طلبك في أي وقت</p>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr><td style="height:1px;background:#F1F5F9;"></td></tr>
            </table>

            <!-- Details Title -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
              <tr>
                <td style="width:4px;height:18px;background:linear-gradient(to bottom,#1B6CA8,#4AACCD);border-radius:2px;"></td>
                <td style="padding-right:8px;font-size:13px;font-weight:700;color:#374151;font-family:Arial,sans-serif;">تفاصيل الطلب</td>
              </tr>
            </table>

            <!-- Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:12px;border:1px solid #F1F5F9;margin-bottom:24px;overflow:hidden;">
              <tr>
                <td style="padding:11px 16px;border-bottom:1px solid #F1F5F9;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:13px;color:#9CA3AF;font-family:Arial,sans-serif;text-align:right;">الاسم الكامل</td>
                      <td style="font-size:13px;color:#111827;font-weight:600;font-family:Arial,sans-serif;text-align:left;">{{ $fullName }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:11px 16px;border-bottom:1px solid #F1F5F9;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:13px;color:#9CA3AF;font-family:Arial,sans-serif;text-align:right;">نوع المساعدة</td>
                      <td style="font-size:13px;color:#111827;font-weight:600;font-family:Arial,sans-serif;text-align:left;">
                        @if($assistanceType === 'medical') علاج طبي
                        @elseif($assistanceType === 'education') تعليم
                        @else دعم معيشي
                        @endif
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:11px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:13px;color:#9CA3AF;font-family:Arial,sans-serif;text-align:right;">حالة الطلب</td>
                      <td style="text-align:left;">
                        <span style="background:#EEF5FB;color:#1B6CA8;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;font-family:Arial,sans-serif;border:1px solid rgba(27,108,168,0.15);">جديد — قيد الانتظار</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Steps Title -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
              <tr>
                <td style="width:4px;height:18px;background:linear-gradient(to bottom,#1B6CA8,#4AACCD);border-radius:2px;"></td>
                <td style="padding-right:8px;font-size:13px;font-weight:700;color:#374151;font-family:Arial,sans-serif;">ماذا يحدث بعد ذلك؟</td>
              </tr>
            </table>

            <!-- Steps -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <!-- Step 1 -->
              <tr>
                <td style="padding-bottom:14px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                     <td style="width:36px;height:36px;background:#EEF5FB;border-radius:10px;text-align:center;vertical-align:middle;" width="36" align="center">
                        <div style="width:10px;height:10px;border-radius:50%;background:#1B6CA8;margin:0 auto;"></div>
                      </td>
                      <td style="padding-right:14px;vertical-align:top;">
                        <p style="font-size:13px;font-weight:700;color:#111827;margin:0 0 2px 0;font-family:Arial,sans-serif;text-align:right;">مراجعة الطلب</p>
                        <p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.6;font-family:Arial,sans-serif;text-align:right;">سيتم مراجعة طلبك خلال ٣–٧ أيام عمل من قِبل فريقنا المختص</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Step 2 -->
              <tr>
                <td style="padding-bottom:14px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                     <td style="width:36px;height:36px;background:#F0FDF4;border-radius:10px;text-align:center;vertical-align:middle;" width="36" align="center">
                        <div style="width:10px;height:10px;border-radius:50%;background:#059669;margin:0 auto;"></div>
                      </td>
                      <td style="padding-right:14px;vertical-align:top;">
                        <p style="font-size:13px;font-weight:700;color:#111827;margin:0 0 2px 0;font-family:Arial,sans-serif;text-align:right;">التواصل معك</p>
                        <p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.6;font-family:Arial,sans-serif;text-align:right;">سيتواصل معك أحد موظفينا على رقم هاتفك المسجّل لاستكمال الإجراءات</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Step 3 -->
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                     <td style="width:36px;height:36px;background:#FFF7ED;border-radius:10px;text-align:center;vertical-align:middle;" width="36" align="center">
                        <div style="width:10px;height:10px;border-radius:50%;background:#D97706;margin:0 auto;"></div>
                      </td>
                      <td style="padding-right:14px;vertical-align:top;">
                        <p style="font-size:13px;font-weight:700;color:#111827;margin:0 0 2px 0;font-family:Arial,sans-serif;text-align:right;">متابعة طلبك</p>
                        <p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.6;font-family:Arial,sans-serif;text-align:right;">يمكنك متابعة حالة طلبك في أي وقت عبر الموقع برقمك المرجعي</p>
                      </td>
                    </tr>
                  </table>
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