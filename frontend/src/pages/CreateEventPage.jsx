import { Navigate, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function toDatePart(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimePart(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function getInitialDateTime() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return {
    date: toDatePart(now),
    time: toTimePart(now),
  };
}

function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateEvents = ['LECTURER', 'ADMIN', 'STUDENT'].includes(user?.role);
  const initialDateTime = useMemo(() => getInitialDateTime(), []);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [eventDatePart, setEventDatePart] = useState(initialDateTime.date);
  const [eventTimePart, setEventTimePart] = useState(initialDateTime.time);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    maxParticipants: 50,
  });

  const onEventFormChange = (event) => {
    const { name, value } = event.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: name === 'maxParticipants' ? Number(value) : value,
    }));
  };

  const onCreateEvent = async (event) => {
    event.preventDefault();
    setCreateLoading(true);
    setError('');
    setStatusMessage('');

    try {
      const composedDateTime = new Date(`${eventDatePart}T${eventTimePart}`);
      if (Number.isNaN(composedDateTime.getTime())) {
        setError('กรุณาระบุวันเวลาให้ถูกต้อง');
        return;
      }

      if (composedDateTime.getTime() <= Date.now()) {
        setError('วันเวลาเริ่มกิจกรรมต้องมากกว่าเวลาปัจจุบัน');
        return;
      }

      const response = await apiClient.post('/events', {
        ...eventForm,
        eventDate: composedDateTime.toISOString(),
      });

      setStatusMessage(response.data?.message || 'สร้างกิจกรรมสำเร็จ');
      setEventForm({
        title: '',
        description: '',
        location: '',
        maxParticipants: 50,
      });
      const resetDateTime = getInitialDateTime();
      setEventDatePart(resetDateTime.date);
      setEventTimePart(resetDateTime.time);
    } catch (err) {
      setError(err.response?.data?.message || 'สร้างกิจกรรมไม่สำเร็จ');
    } finally {
      setCreateLoading(false);
    }
  };

  const selectedDateTimeText = useMemo(() => {
    const composedDateTime = new Date(`${eventDatePart}T${eventTimePart}`);
    if (Number.isNaN(composedDateTime.getTime())) {
      return '-';
    }

    return composedDateTime.toLocaleString('th-TH', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }, [eventDatePart, eventTimePart]);

  const now = new Date();
  const currentDatePart = toDatePart(now);
  const currentTimePart = toTimePart(now);

  const applySuggestedTime = (dateOffset, time) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dateOffset);
    setEventDatePart(toDatePart(targetDate));
    setEventTimePart(time);
  };

  if (!canCreateEvents) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-shell">
      <div className="dashboard-layout create-event-layout">
        <section className="dashboard-card section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">จัดการกิจกรรม</p>
              <h1>สร้างกิจกรรมใหม่</h1>
              <p>กรอกข้อมูลให้ครบแล้วส่งสร้างกิจกรรม ระบบจะกำหนดสถานะตามสิทธิ์ผู้สร้างอัตโนมัติ</p>
            </div>
            <button type="button" className="secondary-button" onClick={() => navigate('/dashboard')}>
              กลับหน้าแดชบอร์ด
            </button>
          </div>

          {error && <p className="error banner">{error}</p>}
          {statusMessage && <p className="success banner">{statusMessage}</p>}

          <form className="auth-form" onSubmit={onCreateEvent}>
            <label htmlFor="title">ชื่อกิจกรรม</label>
            <input id="title" name="title" value={eventForm.title} onChange={onEventFormChange} required />

            <label htmlFor="description">รายละเอียด</label>
            <textarea
              id="description"
              name="description"
              value={eventForm.description}
              onChange={onEventFormChange}
              rows={4}
            />

            <label htmlFor="eventDate">วันเวลา</label>
            <div className="datetime-row">
              <input
                id="eventDate"
                type="date"
                value={eventDatePart}
                min={currentDatePart}
                onChange={(event) => setEventDatePart(event.target.value)}
                required
              />
              <input
                id="eventTime"
                type="time"
                value={eventTimePart}
                min={eventDatePart === currentDatePart ? currentTimePart : undefined}
                onChange={(event) => setEventTimePart(event.target.value)}
                required
              />
            </div>
            <div className="datetime-quick-actions">
              <button type="button" className="secondary-button" onClick={() => applySuggestedTime(0, '09:00')}>
                วันนี้ 09:00
              </button>
              <button type="button" className="secondary-button" onClick={() => applySuggestedTime(0, '13:00')}>
                วันนี้ 13:00
              </button>
              <button type="button" className="secondary-button" onClick={() => applySuggestedTime(1, '09:00')}>
                พรุ่งนี้ 09:00
              </button>
            </div>
            <p className="field-help">กำหนดไว้: {selectedDateTimeText}</p>

            <label htmlFor="location">สถานที่</label>
            <input id="location" name="location" value={eventForm.location} onChange={onEventFormChange} required />

            <label htmlFor="maxParticipants">จำนวนผู้เข้าร่วมสูงสุด</label>
            <input
              id="maxParticipants"
              type="number"
              min={1}
              name="maxParticipants"
              value={eventForm.maxParticipants}
              onChange={onEventFormChange}
              required
            />

            <div className="hero-actions">
              <button type="submit" disabled={createLoading}>
                {createLoading ? 'กำลังสร้างกิจกรรม...' : 'สร้างกิจกรรม'}
              </button>
              <button type="button" className="secondary-button" onClick={() => navigate('/dashboard')}>
                ยกเลิก
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default CreateEventPage;
