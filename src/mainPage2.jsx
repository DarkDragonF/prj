import React, { useState, useEffect } from "react";

// khởi tạo mẫu ban đầu
const initialTasks = [
  { id: 1, title: "Chuẩn bị sự kiện Hội thảo khách hàng", date: "22/04/2024", completed: false, note: "" },
  { id: 2, title: "Họp với đối tác chiến lược", date: "23/04/2024", completed: false, note: "" },
  { id: 3, title: "Tổ chức buổi đào tạo nội bộ", date: "25/04/2024", completed: false, note: "" },
  { id: 4, title: "Xây dựng kế hoạch marketing quý 2", date: "01/05/2024", completed: true, note: "" },
  { id: 5, title: "Báo cáo kết quả kinh doanh Q1", date: "15/04/2024", completed: true, note: "" }
];

const subTasksMap = {
  1: [
    { name: "Chuẩn bị slide trình bày", assignee: "Nguyễn Văn A", time: "10:00 AM" },
    { name: "Đặt phòng hội thảo", assignee: "Trần Thị B", time: "11:00 AM" }
  ],
  2: [
    { name: "Soạn thảo hợp đồng", assignee: "Lê Thị C", time: "09:00 AM" },
    { name: "Chuẩn bị tài liệu trình bày", assignee: "Phạm Văn D", time: "09:30 AM" }
  ],
  3: [
    { name: "Thông báo tới nhân viên", assignee: "Nguyễn Thị E", time: "08:00 AM" },
    { name: "Chuẩn bị tài liệu đào tạo", assignee: "Đỗ Văn F", time: "08:30 AM" }
  ],
  4: [
    { name: "Thu thập dữ liệu thị trường", assignee: "Trần Văn G", time: "02:00 PM" },
    { name: "Phân tích đối thủ cạnh tranh", assignee: "Ngô Thị H", time: "03:00 PM" }
  ],
  5: [
    { name: "Tổng hợp doanh thu", assignee: "Phan Văn I", time: "01:00 PM" },
    { name: "Viết báo cáo", assignee: "Lưu Thị K", time: "02:30 PM" }
  ]
};

// API endpoint
const API_URL = "http://localhost:3000/api/truongnhom"; // Thay đổi nếu backend chạy port khác

// Hàm giao tiếp backend
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

async function addTask(task) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });
  return res.json();
}

async function updateTask(taskId, updates) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
  return res.json();
}

async function deleteTask(taskId) {
  await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
}

async function addSubTask(taskId, subTask) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/subtasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subTask)
  });
  return res.json();
}

async function deleteSubTask(taskId, subTaskIndex) {
  await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subTaskIndex}`, { method: "DELETE" });
}

function TaskBoardBootstrap2() {
  const [tasksData, setTasksData] = useState(initialTasks);
  const [stateModal, setStateModal] = useState({ show: false, taskId: null });
  const [noteModal, setNoteModal] = useState({ show: false, taskId: null, note: "" });
  const [expandedSubTasks, setExpandedSubTasks] = useState({});
  const [eventsData, setEventsData] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    description: ""
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", date: "", completed: false, note: "", subTasks: [] });
  const [newTaskSubTasks, setNewTaskSubTasks] = useState([]);
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);
  const [currentTaskIdForSubTask, setCurrentTaskIdForSubTask] = useState(null);
  const [newSubTask, setNewSubTask] = useState({ name: "", assignee: "", time: "" });

  // Lấy danh sách công việc từ backend khi load trang
  useEffect(() => {
    fetchTasks()
      .then(data => {
        setTasksData(data);
      })
      .catch(err => {
        console.error("Error fetching tasks:", err);
        // fallback nếu backend chưa sẵn sàng
        setTasksData(initialTasks);
      });
  }, []);

  const confirmStateUpdate = async () => {
    const task = tasksData.find(t => t.id === stateModal.taskId);
    if (task) {
      await updateTask(task.id, { completed: !task.completed });
      setTasksData(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
    }
    setStateModal({ show: false, taskId: null });
  };

  const cancelStateUpdate = () => {
    setStateModal({ show: false, taskId: null });
  };

  const confirmNoteUpdate = async () => {
    const task = tasksData.find(t => t.id === noteModal.taskId);
    if (!task) return;
    await updateTask(noteModal.taskId, { note: noteModal.note });
    setTasksData(prev =>
      prev.map(task =>
        task.id === noteModal.taskId ? { ...task, note: noteModal.note } : task
      )
    );
    setNoteModal({ show: false, taskId: null, note: "" });
  };

  const cancelNoteUpdate = () => {
    setNoteModal({ show: false, taskId: null, note: "" });
  };

  const toggleSubTask = (taskId, subTaskIndex) => {
    const key = `${taskId}-${subTaskIndex}`;
    setExpandedSubTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openAddEventModal = () => {
    setShowAddEventModal(true);
  };

  const confirmAddEvent = () => {
    const eventToAdd = {
      ...newEvent,
      id: Date.now()
    };
    setEventsData(prev => [...prev, eventToAdd]);
    setNewEvent({ name: "", date: "", location: "", description: "" });
    setShowAddEventModal(false);
  };

  const cancelAddEvent = () => {
    setNewEvent({ name: "", date: "", location: "", description: "" });
    setShowAddEventModal(false);
  };

  const openAddTaskModal = () => {
    setShowAddTaskModal(true);
  };

  const addSubTaskRow = () => {
    setNewTaskSubTasks(prev => [...prev, { name: "", assignee: "", time: "" }]);
  };

  const handleSubTaskChange = (index, field, value) => {
    setNewTaskSubTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const confirmAddTask = async () => {
    const taskToAdd = { ...newTask, subTasks: newTaskSubTasks };
    const savedTask = await addTask(taskToAdd);
    setTasksData(prev => [...prev, savedTask]);
    setNewTask({ title: "", date: "", completed: false, note: "", subTasks: [] });
    setNewTaskSubTasks([]);
    setShowAddTaskModal(false);
  };

  const cancelAddTask = () => {
    setNewTask({ title: "", date: "", completed: false, note: "", subTasks: [] });
    setNewTaskSubTasks([]);
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setTasksData(prev => prev.filter(task => task.id !== taskId));
  };

  const openAddSubTaskModal = (taskId) => {
    setCurrentTaskIdForSubTask(taskId);
    setShowAddSubTaskModal(true);
  };

  const confirmAddSubTask = async () => {
    const savedSubTask = await addSubTask(currentTaskIdForSubTask, newSubTask);
    setTasksData(prev =>
      prev.map(task => {
        if (task.id === currentTaskIdForSubTask) {
          const existingSubs = task.subTasks ? task.subTasks : [];
          return { ...task, subTasks: [...existingSubs, savedSubTask] };
        }
        return task;
      })
    );
    setNewSubTask({ name: "", assignee: "", time: "" });
    setCurrentTaskIdForSubTask(null);
    setShowAddSubTaskModal(false);
  };

  const cancelAddSubTask = () => {
    setNewSubTask({ name: "", assignee: "", time: "" });
    setCurrentTaskIdForSubTask(null);
    setShowAddSubTaskModal(false);
  };

  const handleDeleteSubTask = async (taskId, subTaskIndex) => {
    await deleteSubTask(taskId, subTaskIndex);
    setTasksData(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newSubs = [...(task.subTasks || [])];
          newSubs.splice(subTaskIndex, 1);
          return { ...task, subTasks: newSubs };
        }
        return task;
      })
    );
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="d-flex vh-100">
        {/* Sidebar */}
        <div className="bg-success text-white p-3 rounded" style={{ width: '250px' }}>
          <h5>Quản lý công việc nhóm</h5>
          <ul className="list-unstyled mt-3 ">
            <li><strong>Quản lý công việc</strong></li>
            <li>Quản lý nhân sự</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-3 bg-light overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input type="text" className="form-control border-start-0" placeholder="Tìm kiếm công việc..." />
              <button className="btn btn-secondary ms-2 me-3" style={{ padding: "10px 20px", borderRadius: "5px" }}>
                Tìm
              </button>
            </div>
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle d-flex align-items-center rounded-pill"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="avatar"
                  width="32"
                  height="32"
                  className="rounded-circle me-2"
                />
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

          {/* Task List */}
          <button className="btn btn-primary btn-sm ms-2" onClick={openAddTaskModal}>
            Thêm công việc mới
          </button>
          <div className="border p-3 rounded bg-white">
            <ul className="list-unstyled">
              {tasksData.map(task => (
                <li key={task.id} className="mb-3 border-bottom pb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{task.title}</strong>
                      <span className="text-muted ms-2">({task.date})</span>
                      {task.completed && <span className="badge bg-success ms-2">Hoàn thành</span>}
                    </div>
                    <div>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => setStateModal({ show: true, taskId: task.id })}
                      >
                        Hoàn thành
                      </button>
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Xóa Công Việc
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openAddSubTaskModal(task.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtasks */}
                  <ul className="list-unstyled ms-3 mt-2">
                    {(task.subTasks || subTasksMap[task.id])?.map((sub, index) => {
                      const key = `${task.id}-${index}`;
                      return (
                        <React.Fragment key={key}>
                          <li
                            className="d-flex justify-content-between align-items-center mt-2"
                            onClick={() => toggleSubTask(task.id, index)}
                            style={{ cursor: "pointer" }}
                          >
                            <span>{sub.name}</span>
                            <div>
                              <input type="checkbox" className="form-check-input me-2" />
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteSubTask(task.id, index);
                                }}
                              >
                                Xóa
                              </button>
                            </div>
                          </li>
                          {expandedSubTasks[key] && (
                            <li className="ms-5 mt-1 small text-muted">
                              <em>Tên nhân viên:</em> {sub.assignee}, <em>Thời gian:</em> {sub.time}
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

          {/* Events Section */}
          {eventsData.length > 0 && (
            <div className="mt-4 border p-3 rounded bg-white">
              <h5>Danh sách sự kiện</h5>
              <ul className="list-unstyled">
                {eventsData.map(event => (
                  <li key={event.id} className="mb-2">
                    <strong>{event.name}</strong> - {event.date} - {event.location}
                    <p className="mb-1">{event.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* State Modal */}
      {stateModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Xác nhận cập nhật trạng thái</h5>
            <p>Bạn có chắc muốn cập nhật trạng thái công việc không?</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelStateUpdate}>Hủy</button>
              <button className="btn btn-primary" onClick={confirmStateUpdate}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal (optional) */}
      {noteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm ghi chú</h5>
            <textarea
              className="form-control mb-3"
              rows="3"
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              placeholder="Nhập ghi chú..."
            />
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelNoteUpdate}>Hủy</button>
              <button className="btn btn-primary" onClick={confirmNoteUpdate}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm sự kiện mới</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tên sự kiện"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Ngày (DD/MM/YYYY)"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Địa điểm"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Mô tả sự kiện"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              ></textarea>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelAddEvent}>Hủy</button>
              <button className="btn btn-primary" onClick={confirmAddEvent}>Thêm</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm công việc mới</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tiêu đề công việc"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Ngày (DD/MM/YYYY)"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <h6>Các công việc con:</h6>
              {newTaskSubTasks.map((sub, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Tên công việc con"
                    value={sub.name}
                    onChange={(e) => handleSubTaskChange(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Tên nhân viên"
                    value={sub.assignee}
                    onChange={(e) => handleSubTaskChange(index, "assignee", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Thời gian (vd: 10:00 AM)"
                    value={sub.time}
                    onChange={(e) => handleSubTaskChange(index, "time", e.target.value)}
                  />
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addSubTaskRow}>
                Thêm công việc con
              </button>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelAddTask}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={confirmAddTask}>
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add SubTask Modal */}
      {showAddSubTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm công việc con</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tên công việc con"
                value={newSubTask.name}
                onChange={(e) => setNewSubTask({ ...newSubTask, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tên nhân viên"
                value={newSubTask.assignee}
                onChange={(e) => setNewSubTask({ ...newSubTask, assignee: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Thời gian (vd: 10:00 AM)"
                value={newSubTask.time}
                onChange={(e) => setNewSubTask({ ...newSubTask, time: e.target.value })}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelAddSubTask}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={confirmAddSubTask}>
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskBoardBootstrap2;
