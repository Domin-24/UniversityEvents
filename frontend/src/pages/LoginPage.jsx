import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // เพิ่ม State สำหรับเปิด/ปิดรหัสผ่าน

  // UX: หากผู้ใช้ถูก Redirect มาจากหน้าอื่นที่ต้อง Login ก่อน ให้จำหน้านั้นไว้
  const from = location.state?.from?.pathname || '/dashboard';

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    // UX: ลบข้อความแจ้งเตือน Error ทันทีที่ผู้ใช้เริ่มพิมพ์ใหม่
    if (error) setError(''); 
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', form);
      login(response.data.data);
     
      navigate(from, { replace: true });
    } catch (err) {
   
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  
  const isFormValid = form.email.trim() !== '' && form.password.trim() !== '';

  return (
    <div className="page-shell flex-center">
      <div className="auth-card fade-in">
        
        <div className="auth-header text-center mb-6">
          <h1>ยินดีต้อนรับกลับมา</h1>
          <p className="text-muted">เข้าสู่ระบบเพื่อเข้าถึงกิจกรรมและบัญชีของคุณ</p>
        </div>

        {error && (
          <div className="banner error-banner mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group mb-4">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@university.ac.th"
              value={form.email}
              onChange={onChange}
              disabled={loading}
              required
              autoComplete="email"
              autoFocus 
            />
          </div>

          <div className="form-group mb-6">
            <div className="flex-between label-row">
              <label htmlFor="password">รหัสผ่าน</label>
             
              <Link to="/forgot-password" className="text-link text-sm" tabIndex="-1">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            
            <div className="input-wrapper relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                disabled={loading}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M3 4l17 17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.58 10.58A2 2 0 0013.42 13.42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.88 5.09A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 8-0.73 2.06-1.98 3.82-3.55 5.09"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.61 6.61C4.62 8 3.2 9.86 2.5 12c1.73 4.89 6 8 11 8 2.02 0 3.9-.51 5.53-1.39"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M2.5 12C4.23 7.11 8.5 4 13.5 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8S4.23 16.89 2.5 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="13.5" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
                <span className="sr-only">{showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-button full-width" 
            disabled={loading || !isFormValid}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="auth-footer mt-6 text-center text-sm text-muted">
          <p>
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <Link to="/register" className="text-link font-medium">
              สมัครสมาชิกที่นี่
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default LoginPage;