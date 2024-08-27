import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HttpReq } from "../../services/apiService";
import { useEffect, useState } from "react";
import urls from '../../urls.json'
import { AuthResponse } from "../../types/allTypesAndInterfaces";
import styles from './Auth.module.css';
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";

const Auth = () => {
  const nav = useNavigate();
  const { isAuthenticated, setAuthResponse } = useAuth();

  // RENDER STATE
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  // INPUT
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setName] = useState('');

  // MESSAGES 
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);


  const handleLogin = async (email: string, password: string) => {
    await HttpReq(
      urls.login,
      (data) => {
        setAuthResponse(data as AuthResponse);
        setTimeout(() => {
          nav('/')
        }, 100)
      },
      () => { },
      () => { },
      () => { },
      (e) => {
        console.log(e);
      },
      "post",
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

  useEffect(() => {
    if (isAuthenticated) nav('/')
  }, [])


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
    <div className="w-full h-full border-l">
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
    </div>
  );

};

export default Auth;
