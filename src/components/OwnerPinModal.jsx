
import React, { useState } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { signInOwner } from '../services/ownerAuth';
import { recordUserLogin } from '../services/userService';

export default function OwnerPinModal({ lang, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await signInOwner(email.trim(), password);
      if (user?.id) {
        recordUserLogin({
          id: user.id,
          role: 'owner'
        }).catch((err) => console.warn('[OwnerPinModal] Error recording owner login:', err));
      }
      onLoginSuccess(user);
    } catch (error) {
      setErrorMsg(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '380px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="#ea580c" />
            <h3 className="modal-title">Owner Login</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            padding: '10px 0',
          }}
        >
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="username"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Owner email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Owner password"
            />
          </label>

          {errorMsg && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="submit-btn"
            style={{ background: '#ea580c' }}
            disabled={loading}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Signing in...' : 'Login to Owner Panel'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
