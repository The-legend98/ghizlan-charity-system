import { z } from 'zod';

export const requestSchema = z.object({
  full_name:       z.string().min(3, 'الاسم مطلوب'),
  phone:           z.string().min(9, 'رقم الهاتف غير صحيح'),
  age:             z.coerce.number().min(1).max(120),
  gender:          z.enum(['male', 'female']),
  family_members:  z.coerce.number().min(1),
  children_count:  z.coerce.number().min(0).optional(),
  monthly_income:  z.coerce.number().min(0).optional(),
  housing_status:  z.enum(['owned', 'rented', 'other']),
  region:          z.string().min(2, 'المنطقة مطلوبة'),
  address:         z.string().optional(),
  assistance_type: z.enum(['medical', 'education', 'financial']),
  description:     z.string().min(20, 'الوصف يجب أن يكون ٢٠ حرف على الأقل'),
  email: z.string().email('إيميل غير صحيح').optional().or(z.literal('')),

});

export type RequestForm = z.infer<typeof requestSchema>;