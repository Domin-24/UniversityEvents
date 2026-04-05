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

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

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
      setError(err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-card">
        <h1>สมัครสมาชิก</h1>
        <p>สร้างบัญชีเพื่อใช้งานระบบจัดการกิจกรรม</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label htmlFor="name">ชื่อ</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />

          <label htmlFor="email">อีเมล</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />

          <label htmlFor="password">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            minLength={8}
            required
          />

          <label htmlFor="role">บทบาท</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={onChange}
          >
            <option value="STUDENT">นักศึกษา</option>
            <option value="LECTURER">อาจารย์/ผู้จัดกิจกรรม</option>
          </select>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="hint">
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
