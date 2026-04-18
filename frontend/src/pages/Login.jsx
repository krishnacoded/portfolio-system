import { useState } from "react";
import { login } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(email, password);

      // ✅ store token
      localStorage.setItem("access_token", data.access_token);

      alert("Login successful 🔓");

      // ✅ redirect to admin
      navigate("/admin");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;