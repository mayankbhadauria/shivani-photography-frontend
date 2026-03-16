import React, { useState } from "react";
import styled from "styled-components";
import { signIn, completeNewPassword } from "../services/auth";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 8px;
    font-size: 1.8rem;
  }

  p.subtitle {
    text-align: center;
    color: #888;
    margin-bottom: 30px;
    font-size: 14px;
  }
`;

const Field = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 6px;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;
    box-sizing: border-box;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 13px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // for new password challenge

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await signIn(email, password);
      onLogin(session);
    } catch (err) {
      if (err.code === "NewPasswordRequired") {
        setPendingUser(err.user);
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const session = await completeNewPassword(pendingUser, newPassword);
      onLogin(session);
    } catch (err) {
      setError(err.message || "Failed to set new password.");
    } finally {
      setLoading(false);
    }
  };

  if (pendingUser) {
    return (
      <Container>
        <Card>
          <h1>Set New Password</h1>
          <p className="subtitle">You must set a new password to continue.</p>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <form onSubmit={handleNewPassword}>
            <Field>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number"
                required
              />
            </Field>
            <Field>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </Field>
            <Button type="submit" disabled={loading}>
              {loading ? "Setting..." : "Set Password"}
            </Button>
          </form>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <h1>Shivyank</h1>
        <p className="subtitle">Photography Portfolio</p>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <form onSubmit={handleLogin}>
          <Field>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </Field>
          <Field>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default LoginPage;
