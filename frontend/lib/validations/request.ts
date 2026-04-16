import { z } from 'zod';

export const requestSchema = z.object({
  full_name:       z.string().min(3, 'الاسم مطلوب'),
  phone:           z.string().min(9, 'رقم الهاتف غير صحيح'),
  age:             z.preprocess(v => v === '' ? undefined : Number(v), z.number({ invalid_type_error: 'العمر مطلوب' }).min(1).max(120)),
  gender:          z.enum(['male', 'female'], { errorMap: () => ({ message: 'الجنس مطلوب' }) }),
  family_members:  z.preprocess(v => v === '' ? undefined : Number(v), z.number({ invalid_type_error: 'عدد أفراد الأسرة مطلوب' }).min(1)),
  children_count:  z.preprocess(v => v === '' ? undefined : v, z.coerce.number().min(0).optional()),
  national_id:     z.string().optional(),
  income_range:    z.enum(['none','under_1m','1m_2m','2m_4m','over_4m']).optional(),
  housing_status:  z.enum(['owned','rented','other'], { errorMap: () => ({ message: 'وضع السكن مطلوب' }) }), // ✅ أضف
  housing_details: z.string().optional(),
  region:          z.string().min(2, 'المنطقة مطلوبة'),
  address:         z.string().optional(),
  assistance_type: z.enum(['medical', 'education', 'financial'], { errorMap: () => ({ message: 'نوع المساعدة مطلوب' }) }),
  description:     z.string().min(20, 'الوصف يجب أن يكون ٢٠ حرف على الأقل'),
  email:           z.union([z.string().email('إيميل غير صحيح'), z.literal(''), z.undefined()]),
});

export type RequestForm = z.infer<typeof requestSchema>;