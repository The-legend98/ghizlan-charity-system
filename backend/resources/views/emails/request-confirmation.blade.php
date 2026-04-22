السلام عليكم {{ $fullName }}،

تم استلام طلبك بنجاح.

رقم طلبك المرجعي: {{ $refNumber }}
نوع المساعدة: @if($assistanceType === 'medical') علاج طبي @elseif($assistanceType === 'education') تعليم @else دعم معيشي @endif

سيتم مراجعة طلبك خلال ٣-٧ أيام عمل من قِبل فريقنا المختص.
سيتواصل معك أحد موظفينا على رقم هاتفك المسجّل.

لمتابعة حالة طلبك:
{{ config('app.frontend_url') }}/track?query={{ $refNumber }}

مؤسسة غزلان الخير الإنسانية
Ghozlan Alkhair Foundation
هذا البريد تم إرساله تلقائياً — يُرجى عدم الرد عليه