import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/api/employees";

// Define initial tasks as an array with required properties
const initialTasks = [
 
];

// Sub-tasks for each task
const subTasksMap = {
  
};

function TaskBoardBootstrap3() {
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

  // New pending state variables for backend operations:
  const [pendingAddTask, setPendingAddTask] = useState(null);
  const [pendingUpdateNote, setPendingUpdateNote] = useState(null);
  const [pendingDeleteEmployee, setPendingDeleteEmployee] = useState(null);

  // Initial data load & periodic refresh using fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        setTasksData(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const confirmStateUpdate = () => {
    setTasksData(prev =>
      prev.map(task =>
        task.id === stateModal.taskId ? { ...task, completed: !task.completed } : task
      )
    );
    setStateModal({ show: false, taskId: null });
  };

  const cancelStateUpdate = () => {
    setStateModal({ show: false, taskId: null });
  };

  // Modify confirmNoteUpdate: set pendingUpdateNote instead of using axios
  const confirmNoteUpdate = () => {
    setPendingUpdateNote({ id: noteModal.taskId, note: noteModal.note });
    setNoteModal({ show: false, taskId: null, note: "" });
  };

  // useEffect to PUT pendingUpdateNote using fetch
  useEffect(() => {
    if (pendingUpdateNote) {
      fetch(`${API_BASE}/${pendingUpdateNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: pendingUpdateNote.note })
      })
        .then(res => res.json())
        .then(updated => {
          setTasksData(prev =>
            prev.map(task =>
              task.id === pendingUpdateNote.id ? { ...task, note: pendingUpdateNote.note } : task
            )
          );
          setPendingUpdateNote(null);
        })
        .catch(err => {
          console.error("Error updating note:", err);
          setPendingUpdateNote(null);
        });
    }
  }, [pendingUpdateNote]);

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

  // Modify confirmAddTask: set pendingAddTask instead of using axios
  const confirmAddTask = () => {
    const taskToAdd = { ...newTask, subTasks: newTaskSubTasks };
    setPendingAddTask(taskToAdd);
    setNewTask({ title: "", date: "", completed: false, note: "", subTasks: [] });
    setNewTaskSubTasks([]);
    setShowAddTaskModal(false);
  };

  // useEffect to POST pendingAddTask using fetch
  useEffect(() => {
    if (pendingAddTask) {
      fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingAddTask)
      })
        .then(res => res.json())
        .then(added => {
          setTasksData(prev => [...prev, added]);
          setPendingAddTask(null);
        })
        .catch(err => {
          alert("Lỗi khi thêm nhân viên");
          setPendingAddTask(null);
        });
    }
  }, [pendingAddTask]);

  const cancelAddTask = () => {
    setNewTask({ title: "", date: "", completed: false, note: "", subTasks: [] });
    setNewTaskSubTasks([]);
    setShowAddTaskModal(false);
  };

  const openAddSubTaskModal = (taskId) => {
    setCurrentTaskIdForSubTask(taskId);
    setShowAddSubTaskModal(true);
  };

  const confirmAddSubTask = () => {
    setTasksData(prev =>
      prev.map(task => {
        if (task.id === currentTaskIdForSubTask) {
          const existingSubs = task.subTasks ? task.subTasks : [];
          return { ...task, subTasks: [...existingSubs, newSubTask] };
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

  // Modify handleDeleteEmployee: set pendingDeleteEmployee instead of using axios
  const handleDeleteEmployee = (id) => {
    setPendingDeleteEmployee(id);
  };

  // useEffect to DELETE pendingDeleteEmployee using fetch
  useEffect(() => {
    if (pendingDeleteEmployee) {
      fetch(`${API_BASE}/${pendingDeleteEmployee}`, {
        method: "DELETE"
      })
        .then(() => {
          setTasksData(prev => prev.filter(task => task.id !== pendingDeleteEmployee));
          setPendingDeleteEmployee(null);
        })
        .catch(err => {
          alert("Lỗi khi xóa nhân viên");
          setPendingDeleteEmployee(null);
        });
    }
  }, [pendingDeleteEmployee]);

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
          <li>Quản lý công việc</li>
          <li><strong>Quản lý nhân sự</strong></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-3 bg-light overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input type="text" className="form-control border-start-0" placeholder="Tìm kiếm nhân viên..." />
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

          {/* Employee List */}
          <button className="btn btn-primary btn-sm ms-2" onClick={openAddTaskModal}>
            Thêm nhân viên mới
          </button>
          <div className="border p-3 rounded bg-white">
            <ul className="list-unstyled">
              {tasksData.map(task => (
                <li key={task.id} className="mb-3 border-bottom pb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{task.title}</strong>
                      <span className="text-muted ms-2">(Ngày vào làm: {task.date})</span>
                    </div>
                    <div>
                      <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteEmployee(task.id)}>
                        Xóa nhân viên
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openAddSubTaskModal(task.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Employee Additional Info */}
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

                          </li>
                          {expandedSubTasks[key] && (
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

          {/* Employee Activity Log Section */}
          {eventsData.length > 0 && (
            <div className="mt-4 border p-3 rounded bg-white">
              <h5>Nhật ký hoạt động của nhân viên</h5>
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



      {/* Note Modal */}
      {noteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm ghi chú nhân viên</h5>
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
            <h5>Thêm nhật ký nhân viên mới</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tiêu đề"
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
                placeholder="Phòng ban"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Ghi chú"
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
            <h5>Thêm nhân viên mới</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tên nhân viên"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Ngày vào làm (DD/MM/YYYY)"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <h6>Thông tin bổ sung:</h6>
              {newTaskSubTasks.map((sub, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Họ Tên"
                    value={sub.name}
                    onChange={(e) => handleSubTaskChange(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Mã Nhân Viên"
                    value={sub.assignee}
                    onChange={(e) => handleSubTaskChange(index, "assignee", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ghi chú"
                    value={sub.time}
                    onChange={(e) => handleSubTaskChange(index, "time", e.target.value)}
                  />
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addSubTaskRow}>
                Thêm thông tin bổ sung
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
            <h5>Thêm thông tin bổ sung</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Loại thông tin"
                value={newSubTask.name}
                onChange={(e) => setNewSubTask({ ...newSubTask, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Giá trị"
                value={newSubTask.assignee}
                onChange={(e) => setNewSubTask({ ...newSubTask, assignee: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Ghi chú"
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

export default TaskBoardBootstrap3;
