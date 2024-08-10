// src/components/Auth/Auth.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HttpReq } from '../../services/apiService';
import urls from '../../urls.json';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUndo } from 'react-icons/fa';
import styles from './Auth.module.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setName] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { authResponse, setAuthResponse } = useAuth();

  useEffect(() => {
    if (authResponse && 'error' in authResponse) {
      const errorMessage = authResponse.error.message;
      const colonIndex = errorMessage.indexOf(':');
      if (colonIndex !== -1) {
        const cleanedMessage = errorMessage.slice(colonIndex + 1).trim();
        setAuthMessage(cleanedMessage);
      } else {
        setAuthMessage(errorMessage);
      }
    } else if (authResponse && 'idToken' in authResponse) {
      navigate('/profile');
    }
  }, [authResponse, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await HttpReq(
      urls.login,
      setAuthResponse,
      setAuthMessage,
      setRequestId,
      setIsLoading,
      setError,
      'post',
      { email, password }
    );
  };

  const handleRegistration = async (email: string, password: string, username: string) => {
    await HttpReq(
      urls.create_user_profile,
      setAuthResponse,
      setAuthMessage,
      setRequestId,
      setIsLoading,
      setError,
      'post',
      { email, password, username }
    );

    // If no error occurred during registration, proceed with login
    if (!error) {
      await handleLogin(email, password);
    }
  };

  const handlePasswordReset = async (email: string) => {
    await HttpReq(
      urls.reset_password,
      setAuthResponse,
      setAuthMessage,
      setRequestId,
      setIsLoading,
      setError,
      'post',
      { email }
    );

    if (!error) {
      setAuthMessage('Password reset email sent. Please check your inbox.');
      setIsPasswordReset(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setError(null);

    if (isPasswordReset) {
      await handlePasswordReset(email);
    } else if (isLogin) {
      await handleLogin(email, password);
    } else {
      await handleRegistration(email, password, username);
    }
  };

  const renderForm = () => {
    if (isPasswordReset) {
      return (
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.authInput}
            />
          </div>
          <button type="submit" className={styles.authButton} disabled={isLoading}>
            Reset Password
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {!isLogin && (
          <div className={styles.inputGroup}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.authInput}
            />
          </div>
        )}
        <div className={styles.inputGroup}>
          <FaEnvelope className={styles.icon} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.authInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <FaLock className={styles.icon} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.authInput}
          />
        </div>
        <button type="submit" className={styles.authButton} disabled={isLoading}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
    );
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>
          {isPasswordReset ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
        </h2>
        {authMessage && <p className={styles.authMessage}>{authMessage}</p>}
        {renderForm()}
        <div className={styles.authOptions}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setIsPasswordReset(false);
            }}
            className={styles.authToggle}
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
          {isLogin && (
            <button
              onClick={() => setIsPasswordReset(!isPasswordReset)}
              className={styles.authToggle}
            >
              {isPasswordReset ? 'Back to Login' : 'Forgot Password?'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;