import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { signIn, completeNewPassword } from "../services/auth";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  background: #fdf8f3;
`;

/* Left — large photo panel */
const PhotoPanel = styled.div`
  flex: 1.4;
  background: #d0c8be;
  overflow: hidden;
  display: none;

  @media (min-width: 768px) { display: block; }

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  .ph {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 80px; color: #b0a898;
  }
`;

/* Right — form panel */
const FormPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  background: #fff;
  min-width: 320px;

  @media (max-width: 768px) { padding: 48px 28px; }
`;

const Logo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #111;
  margin-bottom: 8px;
  text-align: center;
`;

const Tagline = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #a89e92;
  margin-bottom: 52px;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 300px;
`;

const Field = styled.div`
  margin-bottom: 28px;
  border-bottom: 1px solid ${props => props.focused ? "#111" : "#e0d8d0"};
  padding-bottom: 8px;
  transition: border-color 0.2s;

  label {
    display: block;
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #a89e92;
    margin-bottom: 8px;
  }

  input {
    width: 100%;
    background: none;
    border: none;
    outline: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 300;
    color: #111;
    padding: 4px 0;
    letter-spacing: 0.02em;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: #111;
  border: none;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  padding: 16px;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.25s;
  &:hover:not(:disabled) { background: #333; }
  &:disabled { background: #aaa; cursor: not-allowed; }
`;

const ErrorMsg = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #c0392b;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 0.04em;
`;

/* Focusable field wrapper */
const FocusField = ({ label, type, value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field focused={focused}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
      />
    </Field>
  );
};

const LoginPage = ({ onLogin }) => {
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [pendingUser,     setPendingUser]     = useState(null);
  const [loginBg,         setLoginBg]         = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/login-bg`)
      .then(r => r.json())
      .then(d => { if (d.url) setLoginBg(d.url); })
      .catch(() => {});
  }, []);

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
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
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
      <Page>
        <PhotoPanel>
        {loginBg ? <img src={loginBg} alt="" /> : <div className="ph">▣</div>}
      </PhotoPanel>
        <FormPanel>
          <Logo>Shivani Photography</Logo>
          <Tagline>Set New Password</Tagline>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Form onSubmit={handleNewPassword}>
            <FocusField label="New Password" type="password" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            <FocusField label="Confirm Password" type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Setting..." : "Set Password"}
            </SubmitBtn>
          </Form>
        </FormPanel>
      </Page>
    );
  }

  return (
    <Page>
      <PhotoPanel>
        {loginBg ? <img src={loginBg} alt="" /> : <div className="ph">▣</div>}
      </PhotoPanel>
      <FormPanel>
        <Logo>Shivani Photography</Logo>
        <Tagline>Portfolio</Tagline>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Form onSubmit={handleLogin}>
          <FocusField label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          <FocusField label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <SubmitBtn type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </SubmitBtn>
        </Form>
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
