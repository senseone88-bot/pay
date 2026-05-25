import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("請輸入帳號密碼");
      return;
    }
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("token", "demo-token");
      navigate("/");
    } else {
      setError("帳號或密碼錯誤 (admin / admin123)");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CreditCard size={28} color="white" />
          </div>
        </div>
        <h1>TW Pay</h1>
        <p>台灣電子支付管理平台</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>帳號</label>
            <input
              type="text"
              className="form-control"
              placeholder="請輸入帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>密碼</label>
            <input
              type="password"
              className="form-control"
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "8px 12px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "var(--radius)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
          >
            登入系統
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 12,
            color: "var(--gray-400)",
          }}
        >
          示範帳號: admin / admin123
        </div>
      </div>
    </div>
  );
}
