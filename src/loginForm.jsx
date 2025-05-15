import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sau này bạn sẽ gọi API ở đây
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    
    try {
      // Giả lập gọi API đăng nhập:
      // const response = await axios.post('/api/login', { email, password });
      // onLogin(response.data);

      console.log("Đăng nhập với:", { email, password });

      // Gọi hàm callback sau khi đăng nhập thành công
      onLogin?.({ email, role: "staff" }); // giả sử mặc định là nhân viên
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-white">
      <div className="row shadow rounded overflow-hidden w-75" style={{ maxWidth: "1000px" }}>
        {/* Left: Form */}
        <div className="col-md-6 p-5">
          <h2 className="fw-bold mb-1">Đăng nhập</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email hoặc tên đăng nhập</label>
              <input
                type="email"
                className="form-control"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="alert alert-danger py-1">{error}</div>}

            <div className="mb-3 text-end">
              <a href="#" className="text-primary text-decoration-none">Bạn quên mật khẩu?</a>
            </div>
            <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
          </form>

          <hr className="my-4" />
        </div>

        {/* Right: Image */}
        <div className="col-md-6 bg-light d-flex justify-content-center align-items-center p-4">
          <img
            src="https://cdn.undraw.co/illustration/creative-woman_su2h.svg"
            alt="Event Login Illustration"
            className="img-fluid"
            style={{ maxHeight: "350px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
