import React, { useState } from "react";
import axios from "axios";
import "./styles.css"; 
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/login", { email, password });
      const { token } = response.data;

      // Decode token to get role
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("token", token);
      localStorage.setItem("role", payload.role);
      console.log(response.data.token);
      if (response.data.message === "Login successful") {
        alert("Login successful!");
        window.location.href = "/profile";
        //localStorage.setItem("user", email);
        setError("");
      } else {
        setError("Invalid credentials!");
      }
    } catch (error) {
      console.log("Error logging in", error);
    }
  };

  return (
    <div className="container1">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
        If you are not Registered <Link to='/registration'>Registration</Link>
      </form>
    </div>
  );
};

export default Login;
