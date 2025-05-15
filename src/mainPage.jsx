import React, { useState, useEffect } from "react";

function TaskBoardBootstrap1() {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateModal, setStateModal] = useState({ show: false, taskId: null });
  const [noteModal, setNoteModal] = useState({ show: false, taskId: null, note: "" });

  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token"); // Giả sử token lưu sau khi đăng nhập

  // Fetch tasks from backend on mount
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/tasks/assigned`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải công việc");
        const data = await res.json();
        setTasksData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchTasks();
  }, [token]);

  // Update task state
  const confirmStateUpdate = async () => {
    const task = tasksData.find(t => t._id === stateModal.taskId);
    if (!task) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/complete/${task._id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Lỗi cập nhật trạng thái");
      const updated = await res.json();
      setTasksData(prev =>
        prev.map(t =>
          t._id === task._id ? { ...t, completed: updated.completed } : t
        )
      );
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
    setStateModal({ show: false, taskId: null });
  };

  const cancelStateUpdate = () => setStateModal({ show: false, taskId: null });

  // Update note
  const confirmNoteUpdate = async () => {
    const task = tasksData.find(t => t._id === noteModal.taskId);
    if (!task) return;
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ taskId: task._id, content: noteModal.note })
      });
      if (!res.ok) throw new Error("Lỗi thêm ghi chú");
      const note = await res.json();
      setTasksData(prev =>
        prev.map(t =>
          t._id === task._id
            ? { ...t, notes: [...(t.notes || []), note] }
            : t
        )
      );
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
    setNoteModal({ show: false, taskId: null, note: "" });
  };

  const cancelNoteUpdate = () => setNoteModal({ show: false, taskId: null, note: "" });

  return (
    <>
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <div className="bg-success text-white p-3 rounded" style={{ width: '250px' }}>
          <h5>Quản lý công việc Cá Nhân</h5>
          <ul className="list-unstyled mt-3">
            <li><strong>Công việc của tôi</strong></li>
            <ul>
              <li>Tất cả</li>
              <li>Chưa thực hiện</li>
              <li>Hoàn thành</li>
            </ul>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-3 bg-light overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Tìm kiếm công việc..." />
              <button className="btn btn-secondary ms-2">Tìm</button>
            </div>
            <div className="dropdown">
              <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                Tài khoản
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#">Quản lý tài khoản</a></li>
                <li><a className="dropdown-item text-danger" href="#">Đăng xuất</a></li>
              </ul>
            </div>
          </div>

          {/* Task Table */}
          <div className="table-responsive">
            {loading ? (
              <div>Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-danger">Lỗi: {error}</div>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Trạng Thái</th>
                    <th>Tên Nhiệm Vụ</th>
                    <th>Hạn</th>
                    <th>Ghi chú</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksData.map((task) => (
                    <tr key={task._id}>
                      <td>{task.completed ? "✅" : "❌"}</td>
                      <td>{task.title}</td>
                      <td>{new Date(task.deadline).toLocaleDateString()}</td>
                      <td>
                        {(task.notes && task.notes.length > 0)
                          ? task.notes.map((n, i) => <div key={i}>- {n.content}</div>)
                          : <span>Không có ghi chú</span>}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-success me-2"
                          onClick={() => setStateModal({ show: true, taskId: task._id })}>
                          Cập nhật trạng thái
                        </button>
                        <button className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setNoteModal({ show: true, taskId: task._id, note: "" })}>
                          Thêm ghi chú
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

      {/* Note Modal */}
      {noteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Thêm ghi chú</h5>
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Nhập ghi chú..."
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
            ></textarea>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={cancelNoteUpdate}>Hủy</button>
              <button className="btn btn-primary" onClick={confirmNoteUpdate}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskBoardBootstrap1;
