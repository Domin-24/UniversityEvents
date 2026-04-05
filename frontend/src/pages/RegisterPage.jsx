import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // UX: State สำหรับเปิด/ปิดดูรหัสผ่าน

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    // UX: เคลียร์ข้อความแจ้งเตือนทันทีที่ผู้ใช้เริ่มพิมพ์แก้ไข
    if (error) setError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Double check ฝั่ง Frontend ก่อนยิง API
    if (form.password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', form);
      login(response.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // UX: ตรวจสอบความครบถ้วนของข้อมูลเพื่อใช้ Disable ปุ่ม Submit
  const isFormValid = form.name.trim() !== '' && 
                      form.email.trim() !== '' && 
                      form.password.length >= 8;

  return (
    <div className="page-shell flex-center">
      <div className="auth-card fade-in">
        
        <div className="auth-header text-center mb-6">
          <h1>สร้างบัญชีใหม่</h1>
          <p className="text-muted">เข้าร่วมเพื่อเริ่มต้นใช้งานระบบจัดการกิจกรรม</p>
        </div>

        {error && (
          <div className="banner error-banner mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group mb-4">
            <label htmlFor="name">ชื่อ-นามสกุล</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="เช่น สมชาย ใจดี"
              value={form.name}
              onChange={onChange}
              disabled={loading}
              required
              autoFocus // UX: โฟกัสช่องแรกทันทีเมื่อเปิดหน้า
            />
          </div>

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
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password">
              รหัสผ่าน <span className="text-sm text-muted font-normal">(อย่างน้อย 8 ตัวอักษร)</span>
            </label>
            <div className="input-wrapper relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                disabled={loading}
                minLength={8}
                required
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
            {/* UX: Progress หรือตัวบอกสถานะเล็กๆ ว่ารหัสผ่านครบ 8 ตัวหรือยัง */}
            {form.password.length > 0 && form.password.length < 8 && (
              <p className="text-sm text-danger mt-1">
                พิมพ์อีก {8 - form.password.length} ตัวอักษร
              </p>
            )}
          </div>

          <div className="form-group mb-6">
            <label htmlFor="role">คุณคือใคร?</label>
            <select
              id="role"
              name="role"
              className="full-width custom-select"
              value={form.role}
              onChange={onChange}
              disabled={loading}
            >
              <option value="STUDENT">นิสิต / นักศึกษา</option>
              <option value="LECTURER">อาจารย์ / บุคลากร (ผู้จัดกิจกรรม)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="primary-button full-width" 
            disabled={loading || !isFormValid}
          >
            {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="auth-footer mt-6 text-center text-sm text-muted">
          <p>
            มีบัญชีอยู่แล้วใช่ไหม?{' '}
            <Link to="/login" className="text-link font-medium">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default RegisterPage;