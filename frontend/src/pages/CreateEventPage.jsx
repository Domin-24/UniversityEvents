import { Navigate, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

// Helper functions (คงไว้เหมือนเดิม)
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
    // UX: เคลียร์ข้อความแจ้งเตือนทันทีเมื่อผู้ใช้เริ่มแก้ไขข้อมูล
    if (error) setError('');
    if (statusMessage) setStatusMessage('');
  };

  const onDateTimeChange = (setter) => (event) => {
    setter(event.target.value);
    if (error) setError('');
    if (statusMessage) setStatusMessage('');
  };

  const onCreateEvent = async (event) => {
    event.preventDefault();
    setCreateLoading(true);
    setError('');
    setStatusMessage('');

    try {
      const composedDateTime = new Date(`${eventDatePart}T${eventTimePart}`);
      
      // Validation ฝั่ง Frontend
      if (Number.isNaN(composedDateTime.getTime())) {
        setError('กรุณาระบุวันและเวลาให้ถูกต้อง');
        setCreateLoading(false);
        return;
      }

      if (composedDateTime.getTime() <= Date.now()) {
        setError('ไม่สามารถสร้างกิจกรรมย้อนหลังได้ กรุณาเลือกเวลาที่มากกว่าเวลาปัจจุบัน');
        setCreateLoading(false);
        return;
      }

      const response = await apiClient.post('/events', {
        ...eventForm,
        eventDate: composedDateTime.toISOString(),
      });

      setStatusMessage(response.data?.message || 'สร้างกิจกรรมสำเร็จ! 🎉');
      
      // Reset Form
      setEventForm({
        title: '',
        description: '',
        location: '',
        maxParticipants: 50,
      });
      const resetDateTime = getInitialDateTime();
      setEventDatePart(resetDateTime.date);
      setEventTimePart(resetDateTime.time);
      
      // UX: หากสร้างสำเร็จ อาจจะรอกระพริบตาแล้วพากลับหน้า Dashboard เลย
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างกิจกรรมได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setCreateLoading(false);
    }
  };

  const selectedDateTimeText = useMemo(() => {
    const composedDateTime = new Date(`${eventDatePart}T${eventTimePart}`);
    if (Number.isNaN(composedDateTime.getTime())) return '-';

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
    if (error) setError('');
  };

  if (!canCreateEvents) {
    return <Navigate to="/dashboard" replace />;
  }

  // UX: ป้องกันการกดปุ่มสร้างหากข้อมูลสำคัญยังไม่ครบ
  const isFormValid = eventForm.title.trim() !== '' && 
                      eventForm.location.trim() !== '' && 
                      eventForm.maxParticipants > 0;

  return (
    <div className="page-shell flex-center pb-10">
      <div className="dashboard-layout w-full max-w-3xl fade-in">
        
        <div className="flex-between items-center mb-6">
          <div>
            <p className="text-sm text-muted font-medium uppercase tracking-wide">จัดการกิจกรรม</p>
            <h1 className="mt-1">สร้างกิจกรรมใหม่ </h1>
          </div>
        </div>

        <section className="dashboard-card bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          
          <p className="text-muted mb-6">กรอกข้อมูลให้ครบถ้วน ระบบจะกำหนดสถานะตามสิทธิ์ผู้สร้างอัตโนมัติ</p>

          {error && (
            <div className="banner error-banner mb-6" role="alert">
              {error}
            </div>
          )}
          {statusMessage && (
            <div className="banner success-banner mb-6" role="alert">
              {statusMessage}
            </div>
          )}

          <form onSubmit={onCreateEvent} className="space-y-6">
            
            {/* ส่วนที่ 1: ข้อมูลพื้นฐาน */}
            <div className="form-section">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">1. ข้อมูลทั่วไป</h3>
              <div className="form-group mb-4">
                <label htmlFor="title">ชื่อกิจกรรม <span className="text-danger">*</span></label>
                <input 
                  id="title" 
                  name="title" 
                  placeholder="เช่น สัมมนาเทคโนโลยี AI 2026"
                  value={eventForm.title} 
                  onChange={onEventFormChange} 
                  disabled={createLoading || statusMessage !== ''}
                  required 
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">รายละเอียดกิจกรรม</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="อธิบายสั้นๆ ว่ากิจกรรมนี้เกี่ยวกับอะไร..."
                  value={eventForm.description}
                  onChange={onEventFormChange}
                  disabled={createLoading || statusMessage !== ''}
                  rows={4}
                  className="resize-y"
                />
              </div>
            </div>

            {/* ส่วนที่ 2: วันเวลาและสถานที่ */}
            <div className="form-section mt-8">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">2. เวลาและสถานที่</h3>
              
              <div className="form-group mb-4">
                <label htmlFor="eventDate">วันและเวลาเริ่มกิจกรรม <span className="text-danger">*</span></label>
                
                {/* ปุ่มตัวช่วยเลือกเวลาแบบรวดเร็ว (Quick Actions) */}
                <div className="datetime-quick-actions flex flex-wrap gap-2 mb-3">
                  <button type="button" className="chip-button" onClick={() => applySuggestedTime(0, '09:00')}>
                    วันนี้ 09:00 น.
                  </button>
                  <button type="button" className="chip-button" onClick={() => applySuggestedTime(0, '13:00')}>
                    วันนี้ 13:00 น.
                  </button>
                  <button type="button" className="chip-button" onClick={() => applySuggestedTime(1, '09:00')}>
                    พรุ่งนี้ 09:00 น.
                  </button>
                </div>

                <div className="datetime-row grid grid-cols-2 gap-4">
                  <input
                    id="eventDate"
                    type="date"
                    value={eventDatePart}
                    min={currentDatePart}
                    onChange={onDateTimeChange(setEventDatePart)}
                    disabled={createLoading || statusMessage !== ''}
                    required
                  />
                  <input
                    id="eventTime"
                    type="time"
                    value={eventTimePart}
                    min={eventDatePart === currentDatePart ? currentTimePart : undefined}
                    onChange={onDateTimeChange(setEventTimePart)}
                    disabled={createLoading || statusMessage !== ''}
                    required
                  />
                </div>
                <p className="text-sm text-primary mt-2 bg-blue-50 p-2 rounded-md">
                  🗓 กำหนดไว้: <strong>{selectedDateTimeText} น.</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="location">สถานที่จัดกิจกรรม <span className="text-danger">*</span></label>
                  <input 
                    id="location" 
                    name="location" 
                    placeholder="เช่น ห้องประชุม 101 หรือ Zoom Link"
                    value={eventForm.location} 
                    onChange={onEventFormChange} 
                    disabled={createLoading || statusMessage !== ''}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxParticipants">รับสมัครสูงสุด (คน) <span className="text-danger">*</span></label>
                  <input
                    id="maxParticipants"
                    type="number"
                    min={1}
                    name="maxParticipants"
                    value={eventForm.maxParticipants}
                    onChange={onEventFormChange}
                    disabled={createLoading || statusMessage !== ''}
                    required
                  />
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* ส่วน Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button 
                type="button" 
                className="secondary-button flex-1" 
                onClick={() => navigate('/dashboard')}
                disabled={createLoading}
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="primary-button flex-1"
                disabled={createLoading || !isFormValid || statusMessage !== ''}
              >
                {createLoading ? 'กำลังบันทึกข้อมูล...' : 'สร้างกิจกรรม'}
              </button>
            </div>

          </form>
        </section>
      </div>
    </div>
  );
}

export default CreateEventPage;