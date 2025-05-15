import React, { useState, useEffect } from "react";

const initialEmployees = [
  { id: 1, title: "Nguyễn Văn A", date: "22/04/2024", completed: false, note: "" },
  { id: 2, title: "Trần Thị B", date: "23/04/2024", completed: false, note: "" },
  { id: 3, title: "Lê Thị C", date: "25/04/2024", completed: false, note: "" },
  { id: 4, title: "Phạm Văn D", date: "01/05/2024", completed: true, note: "" },
  { id: 5, title: "Đỗ Văn F", date: "15/04/2024", completed: true, note: "" }
];

const API_EVENTS = "http://localhost:3000/api/events";
const API_EMPLOYEES = "http://localhost:3000/api/quanly";

function TaskBoardBootstrap4() {
  const [eventsData, setEventsData] = useState([]);
  const [detailEventId, setDetailEventId] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    eventScale: "",
    eventLocation: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [newEventSubTasks, setNewEventSubTasks] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showEventInfo, setShowEventInfo] = useState(false);

  const [employeesData, setEmployeesData] = useState([]);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    title: "",
    date: "",
    note: "",
    subTasks: []
  });
  const [newEmployeeSubTasks, setNewEmployeeSubTasks] = useState([]);
  const [expandedEmployeeSubTasks, setExpandedEmployeeSubTasks] = useState({});

  const toggleEmployeeSubTask = (empId, subIndex) => {
    const key = `${empId}-${subIndex}`;
    setExpandedEmployeeSubTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [currentSection, setCurrentSection] = useState("");

  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSubTaskDetailModal, setShowSubTaskDetailModal] = useState(false);
  const [selectedSubTask, setSelectedSubTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEvents = await fetch(API_EVENTS);
        const events = await resEvents.json();
        setEventsData(events);
        const resEmployees = await fetch(API_EMPLOYEES);
        const employees = await resEmployees.json();
        setEmployeesData(employees);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const openAddEventModal = () => {
    setShowAddEventModal(true);
  };

  const addSubEventTaskRow = () => {
    setNewEventSubTasks(prev => [...prev, { name: "", status: "pending" }]);
  };

  const handleSubEventTaskChange = (index, field, value) => {
    setNewEventSubTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleSubEventTaskStatus = (index) => {
    setNewEventSubTasks(prev => {
      const updated = [...prev];
      updated[index].status = updated[index].status === "pending" ? "done" : "pending";
      return updated;
    });
  };

  const removeSubEventTask = (index) => {
    setNewEventSubTasks(prev => prev.filter((_, i) => i !== index));
  };

  const confirmAddEvent = async () => {
    try {
      const eventToAdd = { ...newEvent, subTasks: newEventSubTasks };
      const res = await fetch(API_EVENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToAdd)
      });
      const data = await res.json();
      setEventsData(prev => [...prev, data]);
      setNewEvent({ name: "", eventScale: "", eventLocation: "", startDate: "", endDate: "", description: "" });
      setNewEventSubTasks([]);
      setShowAddEventModal(false);
      setNotificationMessage("đã tạo công việc thành công, vui lòng nhấn tra cứu để xem!");
    } catch (err) {
      console.error("Error adding event", err);
    }
  };

  const cancelAddEvent = () => {
    setNewEvent({ name: "", eventScale: "", eventLocation: "", startDate: "", endDate: "", description: "" });
    setNewEventSubTasks([]);
    setShowAddEventModal(false);
  };

  const openAddEmployeeModal = () => {
    setShowAddEmployeeModal(true);
  };

  const addEmployeeSubTaskRow = () => {
    setNewEmployeeSubTasks(prev => [...prev, { name: "", assignee: "", time: "" }]);
  };

  const handleEmployeeSubTaskChange = (index, field, value) => {
    setNewEmployeeSubTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const confirmAddEmployee = async () => {
    try {
      const employeeToAdd = { ...newEmployee, subTasks: newEmployeeSubTasks };
      const res = await fetch(API_EMPLOYEES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeToAdd)
      });
      const data = await res.json();
      setEmployeesData(prev => [...prev, data]);
      setNewEmployee({ title: "", date: "", note: "", subTasks: [] });
      setNewEmployeeSubTasks([]);
      setShowAddEmployeeModal(false);
    } catch (err) {
      console.error("Error adding employee", err);
    }
  };

  const cancelAddEmployee = () => {
    setNewEmployee({ title: "", date: "", note: "", subTasks: [] });
    setNewEmployeeSubTasks([]);
    setShowAddEmployeeModal(false);
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 1050;
        }
        .modal-content {
          background: #fff; padding: 20px; border-radius: 8px;
          max-width: 400px; width: 100%;
          max-height: 80vh; overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .sidebar-item {
          border: 2px solid transparent; border-radius: 5px;
          margin: 5px 0; padding: 5px 10px;
          transition: all 0.3s ease;
        }
        .sidebar-item:hover {
          border: 2px solid #fff;
          background-color: rgba(255,255,255,0.2);
          cursor: pointer;
        }
        .sidebar-item.selected {
          border: 2px solid #fff;
          background-color: rgba(255,255,255,0.2);
        }
      `}</style>

      <div className="d-flex vh-100">
        {/* Sidebar */}
        <div className="bg-success text-white p-3 rounded" style={{ width: '250px' }}>
          <h5 className="sidebar-item" onClick={() => setCurrentSection(currentSection === "employee" ? "" : "employee")}>
            Quản lý nhân sự
          </h5>
          <h5 className="sidebar-item" onClick={() => setCurrentSection(currentSection === "event" ? "" : "event")}>
            Tra cứu sự kiện
          </h5>
          <h5 className="sidebar-item" onClick={openAddEventModal}>Thêm Sự Kiện</h5>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-3 bg-light overflow-auto">
          {/* Search Area */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input type="text" className="form-control border-start-0" placeholder={
                currentSection === "employee" ? "Tìm kiếm nhân sự..." : "Tìm kiếm sự kiện..."
              } />
              <button className="btn btn-secondary ms-2 me-3" style={{ padding: "10px 20px", borderRadius: "5px" }}>
                Tìm
              </button>
            </div>
            {/* Dropdown for account management remains unchanged */}
            <div className="dropdown">
              <button className="btn btn-primary dropdown-toggle d-flex align-items-center rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="avatar" width="32" height="32" className="rounded-circle me-2" />
                <strong>Nguyễn Ngọc Hiếu</strong>
              </button>
              <ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
                <li className="px-3 pt-2 pb-1 text-muted small">Quản lý tài khoản</li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Quản lý tài khoản</a></li>
                <li><a className="dropdown-item text-danger" href="#">Đăng xuất</a></li>
              </ul>
            </div>
          </div>

          {/* Conditional section rendering */}
          {currentSection === "" ? (
            <div className="border p-3 rounded bg-white">
              <h5 className="text-center">Chào mừng đạo diễn</h5>
            </div>
          ) : currentSection === "employee" ? (
            <>
              {/* Employee List */}
              <button className="btn btn-primary btn-sm ms-2" onClick={openAddEmployeeModal}>
                Thêm nhân sự mới
              </button>
              <div className="border p-3 rounded bg-white mt-3">
                <ul className="list-unstyled">
                  {employeesData.map(emp => (
                    <li key={emp.id} className="mb-3 border-bottom pb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{emp.title}</strong>
                          <span className="text-muted ms-2">(Ngày vào làm: {emp.date})</span>
                        </div>
                        <div>
                          <button className="btn btn-danger btn-sm me-2">Xóa nhân sự</button>
                          <button className="btn btn-primary btn-sm">+</button>
                        </div>
                      </div>
                      {/* Employee Additional Info */}
                      <ul className="list-unstyled ms-3 mt-2">
                        {(emp.subTasks || [])?.map((sub, index) => {
                          const key = `${emp.id}-${index}`;
                          return (
                            <React.Fragment key={key}>
                              <li className="d-flex justify-content-between align-items-center mt-2" style={{ cursor: "pointer" }} onClick={() => toggleEmployeeSubTask(emp.id, index)}>
                                <span>{sub.name}</span>
                              </li>
                              {expandedEmployeeSubTasks[`${emp.id}-${index}`] && (
                                <li className="ms-5 mt-1 small text-muted">
                                  <em>Chi tiết:</em> {sub.assignee}, <em>Ghi chú:</em> {sub.time}
                                </li>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : currentSection === "event" && (
            <>
              {/* Display saved events */}
              <div className="mt-3">
                {eventsData.length === 0 ? (
                  <div>Không có sự kiện</div>
                ) : (
                  eventsData.map(ev => (
                    <div key={ev.id} className="card mb-2">
                      <div className="card-body">
                        <h6 className="card-title">{ev.name}</h6>
                        <p className="card-text">Ngày: {ev.startDate} - {ev.endDate}</p>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => {
                            setSelectedEvent(ev);
                            setShowEventDetailModal(true);
                          }}
                        >
                          Xem chi tiết thông tin
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Tạo Sự Kiện</h5>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Tiêu đề" value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Ngày bắt đầu (DD/MM/YYYY)" value={newEvent.startDate}
                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })} />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Ngày kết thúc (DD/MM/YYYY)" value={newEvent.endDate}
                onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })} />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Quy mô sự kiện" value={newEvent.eventScale}
                onChange={(e) => setNewEvent({ ...newEvent, eventScale: e.target.value })} />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Địa điểm tổ chức" value={newEvent.eventLocation}
                onChange={(e) => setNewEvent({ ...newEvent, eventLocation: e.target.value })} />
            </div>
            <div className="mb-3">
              <textarea className="form-control" rows="3" placeholder="Ghi chú" value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
            </div>
            {/* Nested form for event sub tasks */}
            <div className="mb-3">
              <h6>Công việc sự kiện</h6>
              {newEventSubTasks.map((sub, index) => (
                <div key={index} className="mb-2 d-flex align-items-center">
                  <input type="text" className="form-control" placeholder="Tên công việc" value={sub.name}
                    onChange={(e) => handleSubEventTaskChange(index, "name", e.target.value)} />
                  <button type="button" className="btn btn-sm btn-warning mx-1"
                    onClick={() => toggleSubEventTaskStatus(index)}>
                    {sub.status === "pending" ? "Chưa xong" : "Đã xong"}
                  </button>
                  <button type="button" className="btn btn-sm btn-danger"
                    onClick={() => removeSubEventTask(index)}>
                    Xóa
                  </button>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addSubEventTaskRow}>+</button>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelAddEvent}>Hủy</button>
              <button className="btn btn-primary" onClick={confirmAddEvent}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm nhân viên mới</h5>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Tên nhân viên" value={newEmployee.title}
                onChange={(e) => setNewEmployee({ ...newEmployee, title: e.target.value })} />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Ngày vào làm (DD/MM/YYYY)" value={newEmployee.date}
                onChange={(e) => setNewEmployee({ ...newEmployee, date: e.target.value })} />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Ghi chú" value={newEmployee.note}
                onChange={(e) => setNewEmployee({ ...newEmployee, note: e.target.value })} />
            </div>
            {/* Nested form for employee sub tasks */}
            <div className="mb-3">
              <h6>Thông tin bổ sung</h6>
              {newEmployeeSubTasks.map((sub, index) => (
                <div key={index} className="mb-2 d-flex align-items-center">
                  <input type="text" className="form-control" placeholder="Họ Tên" value={sub.name}
                    onChange={(e) => handleEmployeeSubTaskChange(index, "name", e.target.value)} />
                  <input type="text" className="form-control mx-1" placeholder="Mã nhân viên" value={sub.assignee}
                    onChange={(e) => handleEmployeeSubTaskChange(index, "assignee", e.target.value)} />
                  <input type="text" className="form-control" placeholder="Ghi chú" value={sub.time}
                    onChange={(e) => handleEmployeeSubTaskChange(index, "time", e.target.value)} />
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addEmployeeSubTaskRow}>Thêm thông tin bổ sung</button>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelAddEmployee}>Hủy</button>
              <button className="btn btn-primary" onClick={confirmAddEmployee}>Thêm</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ position: "relative" }}>
            {/* New close icon button */}
            <button 
              style={{ position: "absolute", top: "10px", right: "10px" }}
              className="btn btn-danger btn-sm"
              onClick={() => {
                setShowEventDetailModal(false);
                setSelectedEvent(null);
              }}
            >
              X
            </button>
            <h5>Thông tin chi tiết sự kiện</h5>
            <form>
              <div className="mb-3">
                <label className="form-label"><strong>Tiêu đề</strong></label>
                <input type="text" className="form-control" value={selectedEvent.name} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label"><strong>Ngày bắt đầu</strong></label>
                <input type="text" className="form-control" value={selectedEvent.startDate} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label"><strong>Ngày kết thúc</strong></label>
                <input type="text" className="form-control" value={selectedEvent.endDate} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label"><strong>Quy mô sự kiện</strong></label>
                <input type="text" className="form-control" value={selectedEvent.eventScale} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label"><strong>Địa điểm tổ chức</strong></label>
                <input type="text" className="form-control" value={selectedEvent.eventLocation} readOnly />
              </div>
              {selectedEvent.subTasks && selectedEvent.subTasks.length > 0 && (
                <div className="mb-3">
                  <h6>Công việc sự kiện</h6>
                  <ul className="list-group">
                    {selectedEvent.subTasks.map((sub, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{sub.name} ({sub.status})</span>
                        <button
                          type="button"
                          className="btn btn-info btn-sm"
                          onClick={() => {
                            setSelectedSubTask(sub);
                            setShowSubTaskDetailModal(true);
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowEventDetailModal(false); setSelectedEvent(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Task Detail Modal */}
      {showSubTaskDetailModal && selectedSubTask && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ position: "relative" }}>
            {/* New close icon button */}
            <button 
              style={{ position: "absolute", top: "10px", right: "10px" }}
              className="btn btn-danger btn-sm"
              onClick={() => {
                setShowSubTaskDetailModal(false);
                setSelectedSubTask(null);
              }}
            >
              X
            </button>
            <h5>Chi tiết công việc</h5>
            <div className="subtask-details">
              <div className="detail-section">
                <p>
                  <strong>Báo cáo kết quả kinh doanh Q1 (15/04/2024)</strong> 
                </p>
                <p>
                  - Tổng hợp doanh thu
                </p>
                <p>
                  - Viết báo cáo
                </p>
                <p>
                  <strong>Tên nhân viên:</strong> Lưu Thị K, <strong>Thời gian:</strong> 02:30 PM
                </p>
              </div>
              <hr />
              <div className="detail-section">
                <p>
                  <strong>Chuẩn bị sự kiện Hội thảo khách hàng (22/04/2024)</strong>
                </p>
                <p>
                  - Chuẩn bị slide trình bày
                </p>
                <p>
                  - Đặt phòng hội thảo
                </p>
                <p>
                  <strong>Tên nhân viên:</strong> Nguyễn Văn A, <strong>Thời gian:</strong> 10:00 AM
                </p>

              </div>
              <hr />
              <div className="detail-section">
                <p>
                  <strong>Họp với đối tác chiến lược (23/04/2024)</strong>
                </p>
                <p>
                  - Soạn thảo hợp đồng
                </p>
                <p>
                  - Chuẩn bị tài liệu trình bày
                </p>
              </div>
              <hr />
              <div className="detail-section">
                <p>
                  <strong>Tổ chức buổi đào tạo nội bộ (25/04/2024)</strong>
                </p>
                <p>
                  - Thông báo tới nhân viên
                </p>
                <p>
                  - Chuẩn bị tài liệu đào tạo
                </p>
              </div>
              <hr />
              <div className="detail-section">
                <p>
                  <strong>Xây dựng kế hoạch marketing quý 2 (01/05/2024)</strong> - Hoàn thành
                </p>
                <p>
                  Hoàn thành | <strong>Xóa Công Việc</strong> | +
                </p>
                <p>
                  <strong>Thu thập dữ liệu thị trường</strong> | <strong>Xóa</strong>
                </p>
                <p>
                  <strong>Phân tích đối thủ cạnh tranh</strong> | <strong>Xóa</strong>
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowSubTaskDetailModal(false);
                  setSelectedSubTask(null);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskBoardBootstrap4;