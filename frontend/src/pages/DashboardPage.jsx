import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function parseEventDate(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = typeof value === 'string' && value.includes(' ') && !value.includes('T')
    ? value.replace(' ', 'T')
    : value;

  const parsedDate = new Date(normalizedValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const canManageEvents = ['LECTURER', 'ADMIN'].includes(user?.role);
  const canCreateEvent = ['LECTURER', 'ADMIN', 'STUDENT'].includes(user?.role);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [myEventsFilter, setMyEventsFilter] = useState('PENDING');
  const [participantsByEvent, setParticipantsByEvent] = useState({});
  const [activeParticipantsEventId, setActiveParticipantsEventId] = useState(null);
  const [loadingParticipantsEventId, setLoadingParticipantsEventId] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState({});

  const activeRegistrationIds = useMemo(
    () => new Set(registrations.filter((item) => item.status === 'REGISTERED').map((item) => item.eventId)),
    [registrations],
  );

  const visibleEvents = useMemo(
    () => {
      const now = Date.now();
      return events.filter((item) => {
        const eventDate = parseEventDate(item.eventDate);
        return eventDate && eventDate.getTime() > now;
      });
    },
    [events],
  );

  const pendingMyEvents = useMemo(
    () => myEvents.filter((item) => item.approvalStatus === 'PENDING'),
    [myEvents],
  );

  const publishedMyEvents = useMemo(
    () => myEvents.filter((item) => item.approvalStatus === 'APPROVED'),
    [myEvents],
  );

  const filteredMyEvents = useMemo(
    () => (myEventsFilter === 'PENDING' ? pendingMyEvents : publishedMyEvents),
    [myEventsFilter, pendingMyEvents, publishedMyEvents],
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
        apiClient.get('/events/mine'),
      ];

      if (canManageEvents) {
        requests.push(apiClient.get('/approvals/pending'));
      }

      const [eventsResponse, registrationsResponse, myEventsResponse, approvalsResponse] = await Promise.all(requests);

      setEvents(eventsResponse.data.data || []);
      setRegistrations(registrationsResponse.data.data || []);
      setMyEvents(myEventsResponse.data.data || []);
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

  const onToggleParticipants = async (eventId) => {
    if (activeParticipantsEventId === eventId) {
      setActiveParticipantsEventId(null);
      return;
    }

    setDashboardError('');
    setActiveParticipantsEventId(eventId);

    if (participantsByEvent[eventId]) {
      return;
    }

    setLoadingParticipantsEventId(eventId);

    try {
      const response = await apiClient.get(`/events/${eventId}/participants`);
      setParticipantsByEvent((prev) => ({
        ...prev,
        [eventId]: response.data?.data?.participants || [],
      }));
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'โหลดรายชื่อผู้เข้าร่วมไม่สำเร็จ');
    } finally {
      setLoadingParticipantsEventId(null);
    }
  };

  const formatDateTime = (value) => {
    const parsedDate = parseEventDate(value);
    if (!parsedDate) {
      return '-';
    }

    return parsedDate.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

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
            {canCreateEvent ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/events/new')}
              >
                สร้างกิจกรรมใหม่
              </button>
            ) : null}
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
              <span className="summary-chip">{visibleEvents.length} รายการ</span>
          </div>

          {loading ? <p>กำลังโหลดข้อมูล...</p> : null}

          {!loading && visibleEvents.length === 0 ? <p>ยังไม่มีกิจกรรมที่ผ่านการอนุมัติ</p> : null}

          <div className="event-grid">
            {visibleEvents.map((item) => {
              const isRegistered = activeRegistrationIds.has(item.eventId);
              const parsedEventDate = parseEventDate(item.eventDate);
              const isRegistrationClosed = !parsedEventDate || parsedEventDate.getTime() <= Date.now();
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
                        disabled={activeEventId === item.eventId || isEventFull || isRegistrationClosed}
                        onClick={() => void onRegister(item.eventId)}
                      >
                        {activeEventId === item.eventId
                          ? 'กำลังลงทะเบียน...'
                          : isRegistrationClosed
                            ? 'หมดเวลาลงทะเบียน'
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

        <section className="dashboard-card section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">กิจกรรมที่ฉันสร้าง</p>
              <h2>จัดการกิจกรรมของฉัน</h2>
            </div>
            <span className="summary-chip">{myEvents.length} รายการ</span>
          </div>

          <div className="event-card-actions split-actions">
            <button
              type="button"
              className={myEventsFilter === 'PENDING' ? '' : 'secondary-button'}
              onClick={() => setMyEventsFilter('PENDING')}
            >
              กิจกรรมฉัน (รออนุมัติ) {pendingMyEvents.length}
            </button>
            <button
              type="button"
              className={myEventsFilter === 'APPROVED' ? '' : 'secondary-button'}
              onClick={() => setMyEventsFilter('APPROVED')}
            >
              กิจกรรมเผยแพร่แล้ว {publishedMyEvents.length}
            </button>
          </div>

          {filteredMyEvents.length === 0 ? <p>ไม่พบกิจกรรมในหมวดที่เลือก</p> : null}

          <div className="stack-list">
            {filteredMyEvents.map((item) => {
              const participants = participantsByEvent[item.eventId] || [];
              const isParticipantsOpen = activeParticipantsEventId === item.eventId;
              const isParticipantsLoading = loadingParticipantsEventId === item.eventId;

              return (
                <article key={item.eventId} className="approval-card">
                  <div className="approval-card-top">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                    </div>
                    <span className={`status-pill ${item.approvalStatus.toLowerCase()}`}>
                      {statusLabelMap[item.approvalStatus] || item.approvalStatus}
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
                      <span>สถานะกิจกรรม</span>
                      <strong>{statusLabelMap[item.eventStatus] || item.eventStatus}</strong>
                    </div>
                    <div>
                      <span>ผู้เข้าร่วม</span>
                      <strong>{item.registeredCount}/{item.maxParticipants}</strong>
                    </div>
                  </div>

                  <div className="event-card-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={isParticipantsLoading}
                      onClick={() => void onToggleParticipants(item.eventId)}
                    >
                      {isParticipantsLoading
                        ? 'กำลังโหลดรายชื่อ...'
                        : isParticipantsOpen
                          ? 'ซ่อนรายชื่อผู้เข้าร่วม'
                          : 'ดูรายชื่อผู้เข้าร่วม'}
                    </button>
                  </div>

                  {isParticipantsOpen ? (
                    <div className="stack-list">
                      {participants.length === 0 ? <p>ยังไม่มีผู้เข้าร่วมกิจกรรมนี้</p> : null}
                      {participants.map((participant) => (
                        <div key={participant.registrationId} className="stack-item">
                          <div>
                            <strong>{participant.name}</strong>
                            <p>{participant.email}</p>
                          </div>
                          <span className="status-pill registered">
                            ลงทะเบียน {formatDateTime(participant.registerDate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

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
