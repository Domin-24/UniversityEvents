import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', form);
      login(response.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-card">
        <h1>เข้าสู่ระบบ</h1>
        <p>เข้าถึงกิจกรรมและบัญชีของคุณ</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label htmlFor="email">อีเมล</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />

          <label htmlFor="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="hint">
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
