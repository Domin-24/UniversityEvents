import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function parseEventDate(value) {
  if (!value) return null;
  const normalizedValue = typeof value === 'string' && value.includes(' ') && !value.includes('T')
    ? value.replace(' ', 'T')
    : value;
  const parsedDate = new Date(normalizedValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Role Permissions
  const canManageEvents = ['LECTURER', 'ADMIN'].includes(user?.role);
  const canCreateEvent = ['LECTURER', 'ADMIN', 'STUDENT'].includes(user?.role);

  // States
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [dashboardError, setDashboardError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState('EXPLORE');
  const [myEventsFilter, setMyEventsFilter] = useState('PENDING');
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState({});
  const [participantsByEvent, setParticipantsByEvent] = useState({});
  const [activeParticipantsEventId, setActiveParticipantsEventId] = useState(null);
  const [loadingParticipantsEventId, setLoadingParticipantsEventId] = useState(null);

  // Memos for Data Filtering
  const activeRegistrationIds = useMemo(
    () => new Set(registrations.filter((item) => item.status === 'REGISTERED').map((item) => item.eventId)),
    [registrations],
  );

  const visibleEvents = useMemo(() => {
    const now = Date.now();
    return events.filter((item) => {
      const eventDate = parseEventDate(item.eventDate);
      return eventDate && eventDate.getTime() > now;
    });
  }, [events]);

  const pendingMyEvents = useMemo(() => myEvents.filter((item) => item.approvalStatus === 'PENDING'), [myEvents]);
  const publishedMyEvents = useMemo(() => myEvents.filter((item) => item.approvalStatus === 'APPROVED'), [myEvents]);
  const filteredMyEvents = useMemo(
    () => (myEventsFilter === 'PENDING' ? pendingMyEvents : publishedMyEvents),
    [myEventsFilter, pendingMyEvents, publishedMyEvents],
  );

  // Mappings
  const roleLabelMap = { STUDENT: 'นิสิต', LECTURER: 'อาจารย์', ADMIN: 'ผู้ดูแลระบบ' };
  const statusLabelMap = {
    OPEN: 'เปิดรับสมัคร', FULL: 'เต็ม', CLOSED: 'ปิดรับสมัคร',
    CANCELLED: 'ยกเลิกแล้ว', REGISTERED: 'ลงทะเบียนแล้ว',
    PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ',
  };

  // Fetch Data
  const loadDashboardData = useCallback(async () => {
    setDashboardError('');
    setLoading(true);
    try {
      const requests = [
        apiClient.get('/events'),
        apiClient.get('/events/registrations/me'),
        apiClient.get('/events/mine'),
      ];
      if (canManageEvents) requests.push(apiClient.get('/approvals/pending'));

      const [eventsResponse, registrationsResponse, myEventsResponse, approvalsResponse] = await Promise.all(requests);

      setEvents(eventsResponse.data.data || []);
      setRegistrations(registrationsResponse.data.data || []);
      setMyEvents(myEventsResponse.data.data || []);
      if (canManageEvents) setPendingEvents(approvalsResponse?.data?.data || []);
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, [canManageEvents]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Actions
  const onRegister = async (eventId) => {
    setActiveEventId(eventId);
    try {
      await apiClient.post(`/events/${eventId}/register`);
      setStatusMessage('ลงทะเบียนเข้าร่วมกิจกรรมสำเร็จแล้ว');
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      setActiveEventId(null);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const onCancelRegistration = async (eventId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการลงทะเบียนกิจกรรมนี้?')) return;
    setActiveEventId(eventId);
    try {
      await apiClient.patch(`/events/${eventId}/cancel-registration`);
      setStatusMessage('ยกเลิกการลงทะเบียนเรียบร้อยแล้ว');
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'ยกเลิกการลงทะเบียนไม่สำเร็จ');
    } finally {
      setActiveEventId(null);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const onReviewEvent = async (eventId, status) => {
    setActiveReviewId(eventId);
    try {
      await apiClient.patch(`/approvals/${eventId}`, {
        status,
        remark: reviewRemarks[eventId] || '',
      });
      setStatusMessage(status === 'APPROVED' ? 'อนุมัติกิจกรรมสำเร็จ' : 'ปฏิเสธกิจกรรมแล้ว');
      setReviewRemarks((prev) => ({ ...prev, [eventId]: '' }));
      await loadDashboardData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'ไม่สามารถอัปเดตสถานะกิจกรรมได้');
    } finally {
      setActiveReviewId(null);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const onToggleParticipants = async (eventId) => {
    if (activeParticipantsEventId === eventId) {
      setActiveParticipantsEventId(null);
      return;
    }
    setActiveParticipantsEventId(eventId);
    if (participantsByEvent[eventId]) return;

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
    if (!parsedDate) return '-';
    return parsedDate.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  };

  // UI Structure Helpers
  const tabs = [
    { id: 'EXPLORE', label: `กิจกรรมทั้งหมด (${visibleEvents.length})` },
    { id: 'MY_REGISTRATIONS', label: `การลงทะเบียนของฉัน (${registrations.length})` },
    ...(canCreateEvent ? [{ id: 'MY_CREATED', label: 'จัดการกิจกรรมที่ฉันสร้าง' }] : []),
    ...(canManageEvents ? [{ id: 'APPROVALS', label: `รอการอนุมัติ (${pendingEvents.length})` }] : [])
  ];

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        
        {/* --- Hero Profile Section --- */}
        <section className="dashboard-card dashboard-hero">
          <div className="hero-header-flex">
            <div>
              <p className="eyebrow">ระบบจัดการกิจกรรมมหาวิทยาลัย</p>
              <h1>ยินดีต้อนรับ, {user?.name}</h1>
              <p className="text-muted">ตรวจสอบสถานะ สมัครเข้าร่วม และจัดการกิจกรรมของคุณได้ที่นี่</p>
            </div>
            <div className="hero-actions">
              {canCreateEvent && (
                <button type="button" className="primary-button" onClick={() => navigate('/events/new')}>
                  + สร้างกิจกรรมใหม่
                </button>
              )}
              <button type="button" className="ghost-button" onClick={logout}>ออกจากระบบ</button>
            </div>
          </div>

          <div className="info-grid compact-grid mt-4">
            <div className="user-badge">
              <span>สถานะ: </span>
              <strong>{roleLabelMap[user?.role] || user?.role}</strong>
            </div>
            <div><span>อีเมล: </span><strong>{user?.email}</strong></div>
          </div>
        </section>

        {/* --- Global Notifications --- */}
        {dashboardError && <div className="banner error-banner">{dashboardError}</div>}
        {statusMessage && <div className="banner success-banner">{statusMessage}</div>}

        {/* --- Navigation Tabs --- */}
        <div className="dashboard-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- Tab Content: EXPLORE --- */}
        {activeTab === 'EXPLORE' && (
          <section className="dashboard-card section-card fade-in">
             <div className="section-header-row">
                <h2>กิจกรรมที่เปิดให้เข้าร่วม</h2>
                <button type="button" className="icon-button" onClick={() => void loadDashboardData()} title="รีเฟรชข้อมูล">
                   อัปเดต
                </button>
             </div>
            
            {loading ? <div className="loading-state">กำลังโหลดข้อมูลกิจกรรม...</div> : null}
            {!loading && visibleEvents.length === 0 ? (
              <div className="empty-state">ยังไม่มีกิจกรรมใหม่ที่เปิดรับสมัครในขณะนี้</div>
            ) : (
              <div className="event-grid">
                {/* ... (Loop visibleEvents แบบเดิมของคุณได้เลย แต่ย้ายมาอยู่ตรงนี้) ... */}
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
                        <div><span>วันเวลา</span><strong>{formatDateTime(item.eventDate)}</strong></div>
                        <div><span>สถานที่</span><strong>{item.location}</strong></div>
                        <div><span>ผู้จัด</span><strong>{item.organizerName}</strong></div>
                        <div><span>จำนวนรับ</span><strong>{item.registeredCount}/{item.maxParticipants} คน</strong></div>
                      </div>
                      <div className="event-card-actions">
                        {isRegistered ? (
                          <button
                            type="button"
                            className="danger-button outline"
                            disabled={activeEventId === item.eventId}
                            onClick={() => void onCancelRegistration(item.eventId)}
                          >
                            {activeEventId === item.eventId ? 'กำลังยกเลิก...' : 'ยกเลิกการลงทะเบียน'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="primary-button"
                            disabled={activeEventId === item.eventId || isEventFull || isRegistrationClosed}
                            onClick={() => void onRegister(item.eventId)}
                          >
                            {activeEventId === item.eventId ? 'กำลังทำรายการ...' : isRegistrationClosed ? 'หมดเวลาลงทะเบียน' : isEventFull ? 'กิจกรรมเต็มแล้ว' : 'ลงทะเบียนเข้าร่วม'}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* --- Tab Content: MY REGISTRATIONS --- */}
        {activeTab === 'MY_REGISTRATIONS' && (
          <section className="dashboard-card section-card fade-in">
            <h2>ประวัติการลงทะเบียน</h2>
            {registrations.length === 0 ? (
              <div className="empty-state">คุณยังไม่มีประวัติการลงทะเบียนกิจกรรม</div>
            ) : (
              <div className="stack-list">
                {registrations.map((item) => (
                  <div key={item.registrationId} className="stack-item flex-between">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="text-muted">{formatDateTime(item.eventDate)} • {item.location}</p>
                    </div>
                    <span className={`status-pill ${item.status.toLowerCase()}`}>
                      {statusLabelMap[item.status] || item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- Tab Content: MY CREATED EVENTS --- */}
        {activeTab === 'MY_CREATED' && canCreateEvent && (
          <section className="dashboard-card section-card fade-in">
            <h2>จัดการกิจกรรม</h2>
            
            <div className="segmented-control">
              <button
                className={myEventsFilter === 'PENDING' ? 'active' : ''}
                onClick={() => setMyEventsFilter('PENDING')}
              >
                รอการอนุมัติ ({pendingMyEvents.length})
              </button>
              <button
                className={myEventsFilter === 'APPROVED' ? 'active' : ''}
                onClick={() => setMyEventsFilter('APPROVED')}
              >
                เผยแพร่แล้ว ({publishedMyEvents.length})
              </button>
            </div>

            {filteredMyEvents.length === 0 ? (
              <div className="empty-state">ไม่มีกิจกรรมในหมวดหมู่นี้</div>
            ) : (
              <div className="stack-list mt-4">
                {filteredMyEvents.map((item) => {
                  const isParticipantsOpen = activeParticipantsEventId === item.eventId;
                  const participants = participantsByEvent[item.eventId] || [];

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
                        <div><span>วันเวลา</span><strong>{formatDateTime(item.eventDate)}</strong></div>
                        <div><span>สถานที่</span><strong>{item.location}</strong></div>
                        <div><span>สถานะกิจกรรม</span><strong>{statusLabelMap[item.eventStatus] || item.eventStatus}</strong></div>
                        <div><span>จำนวนผู้ลงทะเบียน</span><strong>{item.registeredCount}/{item.maxParticipants} คน</strong></div>
                      </div>

                      {item.approvalStatus === 'APPROVED' && (
                        <div className="event-card-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => void onToggleParticipants(item.eventId)}
                            disabled={loadingParticipantsEventId === item.eventId}
                          >
                            {loadingParticipantsEventId === item.eventId
                              ? 'กำลังโหลดรายชื่อ...'
                              : isParticipantsOpen
                                ? 'ซ่อนผู้เข้าร่วม'
                                : 'ดูผู้เข้าร่วม'}
                          </button>
                        </div>
                      )}

                      {isParticipantsOpen && item.approvalStatus === 'APPROVED' && (
                        participants.length === 0 ? (
                          <div className="empty-state">ยังไม่มีผู้ลงทะเบียนกิจกรรมนี้</div>
                        ) : (
                          <div className="stack-list">
                            {participants.map((participant) => (
                              <div key={participant.registrationId} className="stack-item flex-between">
                                <div>
                                  <strong>{participant.name}</strong>
                                  <p className="text-muted">{participant.email}</p>
                                </div>
                                <span className="status-pill registered">ลงทะเบียนแล้ว</span>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* --- Tab Content: APPROVALS --- */}
        {activeTab === 'APPROVALS' && canManageEvents && (
          <section className="dashboard-card section-card fade-in">
            <h2>คำร้องขอจัดกิจกรรมที่รอการอนุมัติ</h2>
            
            {pendingEvents.length === 0 ? (
              <div className="empty-state success-state">
               เยี่ยมมาก! ไม่มีกิจกรรมค้างอนุมัติในขณะนี้
              </div>
            ) : (
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
                      <div><span>ผู้เสนอ</span><strong>{item.organizerName}</strong></div>
                      <div><span>อีเมล</span><strong>{item.organizerEmail}</strong></div>
                      <div><span>วันเวลา</span><strong>{formatDateTime(item.eventDate)}</strong></div>
                      <div><span>สถานที่</span><strong>{item.location}</strong></div>
                      <div><span>จำนวนรับ</span><strong>{item.maxParticipants} คน</strong></div>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`approval-remark-${item.eventId}`}>หมายเหตุ (ถ้ามี)</label>
                      <textarea
                        id={`approval-remark-${item.eventId}`}
                        value={reviewRemarks[item.eventId] || ''}
                        onChange={(event) => {
                          setReviewRemarks((prev) => ({
                            ...prev,
                            [item.eventId]: event.target.value,
                          }));
                        }}
                        rows={3}
                        placeholder="เช่น ต้องการข้อมูลสถานที่เพิ่มเติม"
                      />
                    </div>

                    <div className="split-actions">
                      <button
                        type="button"
                        className="danger-button"
                        disabled={activeReviewId === item.eventId}
                        onClick={() => void onReviewEvent(item.eventId, 'REJECTED')}
                      >
                        {activeReviewId === item.eventId ? 'กำลังบันทึก...' : 'ไม่อนุมัติ'}
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={activeReviewId === item.eventId}
                        onClick={() => void onReviewEvent(item.eventId, 'APPROVED')}
                      >
                        {activeReviewId === item.eventId ? 'กำลังบันทึก...' : 'อนุมัติกิจกรรม'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;