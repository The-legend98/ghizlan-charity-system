'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const PRIMARY   = '#1B6CA8';
const PRIMARY_L = '#4AACCD';
const GOLD      = '#C9A84C';

const BgPattern = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
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
    if (!token || !userData) { router.push('/login'); return; }
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
      router.push('/login');
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
    router.push('/login');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 42,
    border: `1.5px solid ${PRIMARY}30`,
    borderRadius: 10, padding: '0 12px',
    fontSize: 13, color: '#111827',
    background: 'white', outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11,
    fontWeight: 600, color: '#4B5563', marginBottom: 6,
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF5FB' }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${PRIMARY}30`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#EEF5FB', position: 'relative' }}>
      <BgPattern />

      {/* ══ NAVBAR ══ */}
      <nav style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PRIMARY}20`, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* يسار */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button onClick={() => router.push('/dashboard/manager')}
            style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${PRIMARY}20`, background: `${PRIMARY}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}12`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${PRIMARY}06`; }}>
            <svg width="15" height="15" fill="none" stroke={PRIMARY} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <img src="/g-logo.png" alt="غزلان الخير"
            style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>إدارة الموظفين</div>
            <div style={{ fontSize: 8, color: PRIMARY_L, letterSpacing: '1px', textTransform: 'uppercase' as const, fontWeight: 500 }}>Ghozlan Alkhair</div>
          </div>
        </div>

        {/* يمين */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 14px', borderRadius: 10, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, whiteSpace: 'nowrap' as const }}>
            <svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            <span className="hidden sm:inline">إضافة موظف</span>
            <span className="sm:hidden">إضافة</span>
          </button>

          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', whiteSpace: 'nowrap' as const }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 48px', position: 'relative', zIndex: 1 }}>

        {/* ══ Add Form ══ */}
        {showForm && (
          <div style={{
            background: 'white', borderRadius: 20, border: `2px solid ${PRIMARY}25`,
            boxShadow: `0 4px 24px ${PRIMARY}12`, padding: '20px 16px', marginBottom: 16,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>+</div>
              إضافة موظف جديد
            </h3>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>الاسم الكامل <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الموظف" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>البريد الإلكتروني <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@ghozlan.org" type="email" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>كلمة المرور <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="8 أحرف على الأقل" type="password" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>الدور</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
                  <option value="employee">موظف</option>
                  <option value="manager">مدير</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleAddUser} disabled={saving} style={{
                height: 40, padding: '0 20px', color: 'white', borderRadius: 10,
                fontSize: 13, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
              }}>{saving ? 'جاري الحفظ...' : 'إضافة الموظف'}</button>
              <button onClick={() => { setShowForm(false); setError(''); }} style={{
                height: 40, padding: '0 20px', color: '#6B7280', borderRadius: 10,
                fontSize: 13, border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        )}

        {/* ══ Stats ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'إجمالي المستخدمين', value: users.length,                                  color: PRIMARY,   top: PRIMARY },
            { label: 'نشطون',             value: users.filter(u => u.is_active).length,         color: '#059669', top: '#059669' },
            { label: 'مديرون',            value: users.filter(u => u.role === 'manager').length, color: GOLD,      top: GOLD },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: 16, padding: '16px 12px', textAlign: 'center',
              border: `1px solid ${stat.color}18`, borderTop: `3px solid ${stat.color}`,
              boxShadow: `0 2px 12px ${stat.color}10`,
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ══ Desktop Table ══ */}
        <div className="desktop-table" style={{ background: 'white', borderRadius: 20, border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 16px ${PRIMARY}08`, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 2fr', padding: '12px 20px', background: '#F8FAFC', borderBottom: `1px solid ${PRIMARY}10` }}>
            {['المستخدم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'إجراءات'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {users.map((u, idx) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 2fr',
              padding: '14px 20px', alignItems: 'center',
              borderBottom: idx < users.length - 1 ? `1px solid ${PRIMARY}08` : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}04`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* المستخدم */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 13, fontWeight: 700,
                  background: u.role === 'manager' ? `linear-gradient(135deg, ${GOLD}, #E8C96A)` : `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
                  opacity: u.is_active ? 1 : 0.4,
                }}>{u.name?.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', opacity: u.is_active ? 1 : 0.5 }}>{u.name}</div>
                  {u.id === user?.id && <div style={{ fontSize: 10, color: PRIMARY_L, fontWeight: 600 }}>أنت</div>}
                </div>
              </div>

              {/* البريد */}
              <div style={{ fontSize: 12, color: '#6B7280', opacity: u.is_active ? 1 : 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 8 }}>{u.email}</div>

              {/* الدور */}
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
                  background: u.role === 'manager' ? `${GOLD}20` : `${PRIMARY}10`,
                  color: u.role === 'manager' ? GOLD : PRIMARY,
                }}>{u.role === 'manager' ? 'مدير' : 'موظف'}</span>
              </div>

              {/* الحالة */}
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
                  background: u.is_active ? '#D1FAE5' : '#F3F4F6',
                  color: u.is_active ? '#059669' : '#9CA3AF',
                }}>{u.is_active ? 'نشط' : 'معطّل'}</span>
              </div>

              {/* الإجراءات */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                {u.id !== user?.id ? (
                  <>
                    <button onClick={() => handleToggleStatus(u.id, u.is_active)} style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 600,
                      border: `1px solid ${u.is_active ? '#FECACA' : '#A7F3D0'}`,
                      background: u.is_active ? '#FEE2E2' : '#D1FAE5',
                      color: u.is_active ? '#DC2626' : '#059669',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>{u.is_active ? 'تعطيل' : 'تفعيل'}</button>

                    <button onClick={() => { setResetModal({ show: true, userId: u.id, name: u.name }); setNewPassword(''); setResetError(''); }} style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 600,
                      border: '1px solid #DDD6FE', background: '#EDE9FE', color: '#7C3AED',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>كلمة المرور</button>

                    <button onClick={() => setDeleteModal({ show: true, userId: u.id, name: u.name })} style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 600,
                      border: '1px solid #FECACA', background: '#FEE2E2', color: '#DC2626',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>حذف</button>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ══ Mobile Cards ══ */}
        <div className="mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: 12 }}>
          {users.map(u => (
            <div key={u.id} style={{ background: 'white', borderRadius: 16, border: `1px solid ${PRIMARY}15`, boxShadow: `0 2px 12px ${PRIMARY}08`, padding: '16px', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 16, fontWeight: 700,
                  background: u.role === 'manager' ? `linear-gradient(135deg, ${GOLD}, #E8C96A)` : `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_L})`,
                  opacity: u.is_active ? 1 : 0.5,
                }}>{u.name?.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: u.role === 'manager' ? `${GOLD}20` : `${PRIMARY}10`, color: u.role === 'manager' ? GOLD : PRIMARY }}>
                    {u.role === 'manager' ? 'مدير' : 'موظف'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: u.is_active ? '#D1FAE5' : '#F3F4F6', color: u.is_active ? '#059669' : '#9CA3AF' }}>
                    {u.is_active ? 'نشط' : 'معطّل'}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              {u.id !== user?.id && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid #F3F4F6`, paddingTop: 12 }}>
                  <button onClick={() => handleToggleStatus(u.id, u.is_active)} style={{
                    flex: 1, minWidth: 80, fontSize: 12, padding: '8px 0', borderRadius: 10, fontWeight: 600,
                    border: `1px solid ${u.is_active ? '#FECACA' : '#A7F3D0'}`,
                    background: u.is_active ? '#FEE2E2' : '#D1FAE5',
                    color: u.is_active ? '#DC2626' : '#059669', cursor: 'pointer',
                  }}>{u.is_active ? 'تعطيل' : 'تفعيل'}</button>

                  <button onClick={() => { setResetModal({ show: true, userId: u.id, name: u.name }); setNewPassword(''); setResetError(''); }} style={{
                    flex: 1, minWidth: 80, fontSize: 12, padding: '8px 0', borderRadius: 10, fontWeight: 600,
                    border: '1px solid #DDD6FE', background: '#EDE9FE', color: '#7C3AED', cursor: 'pointer',
                  }}>كلمة المرور</button>

                  <button onClick={() => setDeleteModal({ show: true, userId: u.id, name: u.name })} style={{
                    flex: 1, minWidth: 80, fontSize: 12, padding: '8px 0', borderRadius: 10, fontWeight: 600,
                    border: '1px solid #FECACA', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer',
                  }}>حذف</button>
                </div>
              )}
              {u.id === user?.id && (
                <div style={{ borderTop: `1px solid #F3F4F6`, paddingTop: 10, fontSize: 11, color: PRIMARY_L, fontWeight: 600 }}>أنت</div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* ══ Reset Password Modal ══ */}
      {resetModal.show && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)' }} dir="rtl">
          <div style={{ background: 'white', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360, border: '2px solid #DDD6FE', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 4 }}>تغيير كلمة المرور</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 }}>{resetModal.name}</p>
            {resetError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#DC2626' }}>{resetError}</div>}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>كلمة المرور الجديدة</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="8 أحرف على الأقل" style={{ ...inputStyle, borderColor: '#DDD6FE' }}/>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleResetPassword} disabled={resetting} style={{
                flex: 1, height: 42, color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.6 : 1,
                background: 'linear-gradient(135deg, #7C3AED, #9F67FA)',
              }}>{resetting ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}</button>
              <button onClick={() => setResetModal({ show: false, userId: null, name: '' })} style={{
                flex: 1, height: 42, color: '#6B7280', borderRadius: 10, fontSize: 13,
                border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Modal ══ */}
      {deleteModal.show && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)' }} dir="rtl">
          <div style={{ background: 'white', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360, border: '2px solid #FECACA', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 6 }}>حذف المستخدم</h3>
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
              هل أنت متأكد من حذف <strong style={{ color: '#111827' }}>{deleteModal.name}</strong>؟<br/>
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, height: 42, color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
                background: '#DC2626',
              }}>{deleting ? 'جاري الحذف...' : 'نعم، احذف'}</button>
              <button onClick={() => setDeleteModal({ show: false, userId: null, name: '' })} style={{
                flex: 1, height: 42, color: '#6B7280', borderRadius: 10, fontSize: 13,
                border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: ${PRIMARY}60 !important; box-shadow: 0 0 0 3px ${PRIMARY}12; }
        @media (max-width: 640px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}