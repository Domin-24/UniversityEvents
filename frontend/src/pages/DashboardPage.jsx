import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user, logout } = useAuth();
  const canManageEvents = ['LECTURER', 'ADMIN'].includes(user?.role);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [dashboardError, setDashboardError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState({});
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    maxParticipants: 50,
  });

  const activeRegistrationIds = useMemo(
    () => new Set(registrations.filter((item) => item.status === 'REGISTERED').map((item) => item.eventId)),
    [registrations],
  );

  const roleLabelMap = {
    STUDENT: 'นิสิต',
    LECTURER: 'อาจารย์',
    ADMIN: 'ผู้ดูแลระบบ',
  };

  const statusLabelMap = {
    OPEN: 'เปิดรับสมัคร',
    FULL: 'เต็ม',
    CLOSED: 'ปิดรับสมัคร',
    CANCELLED: 'ยกเลิกกิจกรรม',
    REGISTERED: 'ลงทะเบียนแล้ว',
    PENDING: 'รออนุมัติ',
    APPROVED: 'อนุมัติแล้ว',
    REJECTED: 'ไม่อนุมัติ',
  };

  const loadDashboardData = useCallback(async () => {
    setDashboardError('');

    try {
      const requests = [
        apiClient.get('/events'),
        apiClient.get('/events/registrations/me'),
      ];

      if (canManageEvents) {
        requests.push(apiClient.get('/approvals/pending'));
      }

      const [eventsResponse, registrationsResponse, approvalsResponse] = await Promise.all(requests);

      setEvents(eventsResponse.data.data || []);
      setRegistrations(registrationsResponse.data.data || []);
      setPendingEvents(approvalsResponse?.data?.data || []);
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'โหลดข้อมูลแดชบอร์ดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [canManageEvents]);

  useEffect(() => {
    setLoading(true);
    void loadDashboardData();
  }, [loadDashboardData]);

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
    setDashboardError('');
    setStatusMessage('');

    try {
      await apiClient.post('/events', {
        ...eventForm,
        eventDate: new Date(eventForm.eventDate).toISOString(),
      });

      setStatusMessage('สร้างกิจกรรมสำเร็จ และส่งเข้าสถานะรออนุมัติแล้ว');
      setEventForm({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        maxParticipants: 50,
      });
      setLoading(true);
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'สร้างกิจกรรมไม่สำเร็จ');
    } finally {
      setCreateLoading(false);
    }
  };

  const onRegister = async (eventId) => {
    setActiveEventId(eventId);
    setDashboardError('');
    setStatusMessage('');

    try {
      await apiClient.post(`/events/${eventId}/register`);
      setStatusMessage('ลงทะเบียนเข้าร่วมกิจกรรมสำเร็จ');
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'ลงทะเบียนกิจกรรมไม่สำเร็จ');
    } finally {
      setActiveEventId(null);
    }
  };

  const onCancelRegistration = async (eventId) => {
    setActiveEventId(eventId);
    setDashboardError('');
    setStatusMessage('');

    try {
      await apiClient.patch(`/events/${eventId}/cancel-registration`);
      setStatusMessage('ยกเลิกการลงทะเบียนสำเร็จ');
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'ยกเลิกการลงทะเบียนไม่สำเร็จ');
    } finally {
      setActiveEventId(null);
    }
  };

  const onReviewEvent = async (eventId, status) => {
    setActiveReviewId(eventId);
    setDashboardError('');
    setStatusMessage('');

    try {
      await apiClient.patch(`/approvals/${eventId}`, {
        status,
        remark: reviewRemarks[eventId] || '',
      });

      setStatusMessage(
        status === 'APPROVED' ? 'อนุมัติกิจกรรมสำเร็จ' : 'ปฏิเสธกิจกรรมสำเร็จ',
      );
      setReviewRemarks((prev) => ({ ...prev, [eventId]: '' }));
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'อัปเดตสถานะกิจกรรมไม่สำเร็จ');
    } finally {
      setActiveReviewId(null);
    }
  };

  const formatDateTime = (value) => new Date(value).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const registrationHistory = registrations.slice(0, 5);

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <section className="dashboard-card dashboard-hero">
          <div>
            <p className="eyebrow">ระบบกิจกรรมมหาวิทยาลัย</p>
            <h1>ศูนย์กลางจัดการกิจกรรมมหาวิทยาลัย</h1>
            <p>ดูรายการกิจกรรม สมัครเข้าร่วม สร้างกิจกรรม และตรวจสอบสถานะได้จากหน้านี้</p>
          </div>

          <div className="info-grid compact-grid">
            <div>
              <span>ชื่อ</span>
              <strong>{user?.name}</strong>
            </div>
            <div>
              <span>อีเมล</span>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <span>บทบาท</span>
              <strong>{roleLabelMap[user?.role] || user?.role}</strong>
            </div>
          </div>

          <div className="hero-actions">
            <button type="button" className="secondary-button" onClick={() => void loadDashboardData()}>
              รีเฟรชข้อมูล
            </button>
            <button type="button" onClick={logout}>ออกจากระบบ</button>
          </div>
        </section>

        {dashboardError && <p className="error banner">{dashboardError}</p>}
        {statusMessage && <p className="success banner">{statusMessage}</p>}

        <section className="dashboard-card section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">กิจกรรมที่อนุมัติแล้ว</p>
              <h2>กิจกรรมที่เปิดให้เข้าร่วม</h2>
            </div>
            <span className="summary-chip">{events.length} รายการ</span>
          </div>

          {loading ? <p>กำลังโหลดข้อมูล...</p> : null}

          {!loading && events.length === 0 ? <p>ยังไม่มีกิจกรรมที่ผ่านการอนุมัติ</p> : null}

          <div className="event-grid">
            {events.map((item) => {
              const isRegistered = activeRegistrationIds.has(item.eventId);
              const isEventFull = item.eventStatus === 'FULL' || Number(item.remainingSlots) === 0;

              return (
                <article key={item.eventId} className="event-card">
                  <div className="event-card-top">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                    </div>
                    <span className={`status-pill ${item.eventStatus.toLowerCase()}`}>
                      {statusLabelMap[item.eventStatus] || item.eventStatus}
                    </span>
                  </div>

                  <div className="meta-grid">
                    <div>
                      <span>วันเวลา</span>
                      <strong>{formatDateTime(item.eventDate)}</strong>
                    </div>
                    <div>
                      <span>สถานที่</span>
                      <strong>{item.location}</strong>
                    </div>
                    <div>
                      <span>ผู้จัด</span>
                      <strong>{item.organizerName}</strong>
                    </div>
                    <div>
                      <span>จำนวน</span>
                      <strong>{item.registeredCount}/{item.maxParticipants}</strong>
                    </div>
                  </div>

                  <div className="event-card-actions">
                    {isRegistered ? (
                      <button
                        type="button"
                        className="danger-button"
                        disabled={activeEventId === item.eventId}
                        onClick={() => void onCancelRegistration(item.eventId)}
                      >
                        {activeEventId === item.eventId ? 'กำลังยกเลิก...' : 'ยกเลิกการลงทะเบียน'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={activeEventId === item.eventId || isEventFull}
                        onClick={() => void onRegister(item.eventId)}
                      >
                        {activeEventId === item.eventId
                          ? 'กำลังลงทะเบียน...'
                          : isEventFull
                            ? 'กิจกรรมเต็มแล้ว'
                            : 'ลงทะเบียนเข้าร่วม'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="dashboard-columns">
          <section className="dashboard-card section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">กิจกรรมของฉัน</p>
                <h2>รายการลงทะเบียนของฉัน</h2>
              </div>
              <span className="summary-chip">{registrations.length} รายการ</span>
            </div>

            {registrationHistory.length === 0 ? <p>ยังไม่มีประวัติการลงทะเบียนกิจกรรม</p> : null}

            <div className="stack-list">
              {registrationHistory.map((item) => (
                <div key={item.registrationId} className="stack-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{formatDateTime(item.eventDate)} • {item.location}</p>
                  </div>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {statusLabelMap[item.status] || item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {canManageEvents ? (
            <section className="dashboard-card section-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">สร้างกิจกรรม</p>
                  <h2>สร้างกิจกรรมใหม่</h2>
                </div>
              </div>

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
                <input
                  id="eventDate"
                  type="datetime-local"
                  name="eventDate"
                  value={eventForm.eventDate}
                  onChange={onEventFormChange}
                  required
                />

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

                <button type="submit" disabled={createLoading}>
                  {createLoading ? 'กำลังสร้างกิจกรรม...' : 'สร้างกิจกรรม'}
                </button>
              </form>
            </section>
          ) : null}
        </div>

        {canManageEvents ? (
          <section className="dashboard-card section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">คิวรออนุมัติ</p>
                <h2>กิจกรรมที่รออนุมัติ</h2>
              </div>
              <span className="summary-chip">{pendingEvents.length} รายการ</span>
            </div>

            {pendingEvents.length === 0 ? <p>ไม่มีกิจกรรมที่รออนุมัติ</p> : null}

            <div className="stack-list">
              {pendingEvents.map((item) => (
                <article key={item.eventId} className="approval-card">
                  <div className="approval-card-top">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                    </div>
                    <span className="status-pill pending">รออนุมัติ</span>
                  </div>

                  <div className="meta-grid">
                    <div>
                      <span>วันเวลา</span>
                      <strong>{formatDateTime(item.eventDate)}</strong>
                    </div>
                    <div>
                      <span>สถานที่</span>
                      <strong>{item.location}</strong>
                    </div>
                    <div>
                      <span>ผู้สร้าง</span>
                      <strong>{item.organizerName}</strong>
                    </div>
                    <div>
                      <span>อีเมล</span>
                      <strong>{item.organizerEmail}</strong>
                    </div>
                  </div>

                  <label htmlFor={`remark-${item.eventId}`}>หมายเหตุ</label>
                  <textarea
                    id={`remark-${item.eventId}`}
                    rows={3}
                    value={reviewRemarks[item.eventId] || ''}
                    onChange={(event) => {
                      const { value } = event.target;
                      setReviewRemarks((prev) => ({ ...prev, [item.eventId]: value }));
                    }}
                  />

                  <div className="event-card-actions split-actions">
                    <button
                      type="button"
                      disabled={activeReviewId === item.eventId}
                      onClick={() => void onReviewEvent(item.eventId, 'APPROVED')}
                    >
                      {activeReviewId === item.eventId ? 'กำลังบันทึก...' : 'อนุมัติ'}
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      disabled={activeReviewId === item.eventId}
                      onClick={() => void onReviewEvent(item.eventId, 'REJECTED')}
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardPage;
