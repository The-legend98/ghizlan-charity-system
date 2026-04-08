'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const inputClass = "w-full h-10 border-2 rounded-xl px-3 text-sm text-gray-900 bg-white focus:outline-none transition-all";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotsUsers" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#1B6CA8" opacity="0.10"/>
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#dotsUsers)"/>
      <circle cx="1150" cy="80"  r="160" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="1150" cy="80"  r="100" fill="none" stroke="#4AACCD" strokeWidth="0.6" opacity="0.15"/>
      <circle cx="60"   cy="720" r="120" fill="none" stroke="#1B6CA8" strokeWidth="0.6" opacity="0.12"/>
      <line x1="900" y1="0"   x2="1200" y2="300" stroke="#4AACCD" strokeWidth="0.5" opacity="0.12"/>
      <line x1="0"   y1="550" x2="250"  y2="800" stroke="#C9A84C" strokeWidth="0.5" opacity="0.12"/>
    </svg>
  </div>
);

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [users, setUsers]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'employee' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const [resetModal, setResetModal]   = useState<{ show: boolean; userId: number | null; name: string }>({ show: false, userId: null, name: '' });
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting]     = useState(false);
  const [resetError, setResetError]   = useState('');

  const [deleteModal, setDeleteModal] = useState<{ show: boolean; userId: number | null; name: string }>({ show: false, userId: null, name: '' });
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token    = localStorage.getItem('token');
    if (!token || !userData) { router.push('/dashboard/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'manager') { router.push('/dashboard/requests'); return; }
    setUser(parsed);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      router.push('/dashboard/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password) { setError('جميع الحقول مطلوبة'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'employee' });
      setShowForm(false);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try { await api.patch(`/users/${userId}`, { is_active: !isActive }); await fetchUsers(); }
    catch { alert('حدث خطأ'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) { setResetError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setResetting(true); setResetError('');
    try {
      await api.patch(`/users/${resetModal.userId}/password`, { password: newPassword });
      setResetModal({ show: false, userId: null, name: '' });
      setNewPassword('');
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'حدث خطأ');
    } finally { setResetting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteModal.userId}`);
      setDeleteModal({ show: false, userId: null, name: '' });
      await fetchUsers();
    } catch { alert('حدث خطأ'); }
    finally { setDeleting(false); }
  };

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/dashboard/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF5FB' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY }}></div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#EEF5FB', position: 'relative' }} dir="rtl">
      <BgPattern />

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/manager')}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <div className="text-sm font-bold text-gray-900">إدارة الموظفين</div>
              <div className="text-xs" style={{ color: PRIMARY_L }}>مؤسسة غزلان الخير</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowForm(!showForm)}
              className="text-xs px-4 py-2 rounded-xl text-white font-semibold transition-all"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
              + إضافة موظف
            </button>
            <button onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all border border-red-100">
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* Add Form */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-5"
            style={{ background: 'white', border: `2px solid ${PRIMARY}30`, boxShadow: `0 4px 20px ${PRIMARY}15` }}>
            <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>+</div>
              إضافة موظف جديد
            </h3>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4 text-xs text-red-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClass}>الاسم الكامل <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="اسم الموظف"
                  className={inputClass} style={{ borderColor: `${PRIMARY}30` }}/>
              </div>
              <div>
                <label className={labelClass}>البريد الإلكتروني <span className="text-red-400">*</span></label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@ghozlan.org" type="email"
                  className={inputClass} style={{ borderColor: `${PRIMARY}30` }}/>
              </div>
              <div>
                <label className={labelClass}>كلمة المرور <span className="text-red-400">*</span></label>
                <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="8 أحرف على الأقل" type="password"
                  className={inputClass} style={{ borderColor: `${PRIMARY}30` }}/>
              </div>
              <div>
                <label className={labelClass}>الدور</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className={inputClass} style={{ borderColor: `${PRIMARY}30` }}>
                  <option value="employee">موظف</option>
                  <option value="manager">مدير</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddUser} disabled={saving}
                className="h-10 px-6 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})` }}>
                {saving ? 'جاري الحفظ...' : 'إضافة الموظف'}
              </button>
              <button onClick={() => { setShowForm(false); setError(''); }}
                className="h-10 px-6 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'إجمالي المستخدمين', value: users.length,                                   color: PRIMARY,   borderColor: PRIMARY },
            { label: 'نشطون',             value: users.filter(u => u.is_active).length,          color: '#059669', borderColor: '#059669' },
            { label: 'مديرون',            value: users.filter(u => u.role === 'manager').length,  color: GOLD,      borderColor: GOLD },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{ background: 'white', border: `1px solid ${stat.borderColor}20`, borderTop: `3px solid ${stat.borderColor}`, boxShadow: `0 2px 12px ${stat.color}10` }}>
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08` }}>
          <div className="grid grid-cols-5 px-5 py-3 border-b" style={{ background: '#F8FAFC', borderColor: `${PRIMARY}10` }}>
            {['المستخدم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'إجراءات'].map(h => (
              <div key={h} className="text-xs font-semibold text-gray-500">{h}</div>
            ))}
          </div>

          {users.map(u => (
            <div key={u.id} className="grid grid-cols-5 px-5 py-4 border-b items-center transition-all"
              style={{ borderColor: `${PRIMARY}08` }}
              onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}04`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    background: u.role === 'manager'
                      ? `linear-gradient(135deg, ${GOLD}, #E8C96A)`
                      : `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
                    opacity: u.is_active ? 1 : 0.4
                  }}>
                  {u.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900" style={{ opacity: u.is_active ? 1 : 0.5 }}>{u.name}</div>
                  {u.id === user?.id && <div className="text-xs font-medium" style={{ color: PRIMARY_L }}>أنت</div>}
                </div>
              </div>
              <div className="text-sm text-gray-500" style={{ opacity: u.is_active ? 1 : 0.5 }}>{u.email}</div>
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: u.role === 'manager' ? `${GOLD}20` : `${PRIMARY}10`, color: u.role === 'manager' ? GOLD : PRIMARY }}>
                  {u.role === 'manager' ? 'مدير' : 'موظف'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: u.is_active ? '#D1FAE5' : '#F3F4F6', color: u.is_active ? '#059669' : '#9CA3AF' }}>
                  {u.is_active ? 'نشط' : 'معطّل'}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {u.id !== user?.id && (
                  <>
                    <button onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all"
                      style={{ background: u.is_active ? '#FEE2E2' : '#D1FAE5', color: u.is_active ? '#DC2626' : '#059669', borderColor: u.is_active ? '#FECACA' : '#A7F3D0' }}>
                      {u.is_active ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button onClick={() => { setResetModal({ show: true, userId: u.id, name: u.name }); setNewPassword(''); setResetError(''); }}
                      className="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all"
                      style={{ background: '#EDE9FE', color: '#7C3AED', borderColor: '#DDD6FE' }}>
                      كلمة المرور
                    </button>
                    <button onClick={() => setDeleteModal({ show: true, userId: u.id, name: u.name })}
                      className="text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all"
                      style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}>
                      حذف
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }} dir="rtl">
          <div className="rounded-2xl shadow-2xl p-6 w-full max-w-sm" style={{ background: 'white', border: `2px solid #7C3AED30` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#EDE9FE' }}>
              <svg className="w-6 h-6" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">تغيير كلمة المرور</h3>
            <p className="text-xs text-gray-400 text-center mb-5">{resetModal.name}</p>
            {resetError && <p className="text-xs text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg">{resetError}</p>}
            <div className="mb-4">
              <label className={labelClass}>كلمة المرور الجديدة</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                className={inputClass} style={{ borderColor: '#DDD6FE' }}/>
            </div>
            <div className="flex gap-3">
              <button onClick={handleResetPassword} disabled={resetting}
                className="flex-1 h-10 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #9F67FA)' }}>
                {resetting ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
              </button>
              <button onClick={() => setResetModal({ show: false, userId: null, name: '' })}
                className="flex-1 h-10 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }} dir="rtl">
          <div className="rounded-2xl shadow-2xl p-6 w-full max-w-sm" style={{ background: 'white', border: '2px solid #FECACA' }}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">حذف المستخدم</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              هل أنت متأكد من حذف <strong>{deleteModal.name}</strong>؟ هاد الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 h-10 text-white rounded-xl text-sm font-semibold disabled:opacity-60 bg-red-600 hover:bg-red-700 transition-all">
                {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
              <button onClick={() => setDeleteModal({ show: false, userId: null, name: '' })}
                className="flex-1 h-10 text-gray-600 rounded-xl text-sm border-2 border-gray-200 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}