import React, { useCallback, useEffect, useState } from 'react';
import * as api from './api.js';

function useLocalToken() {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('cv_token') || ''; } catch { return ''; }
  });
  const save = (t) => {
    setToken(t);
    try { t ? localStorage.setItem('cv_token', t) : localStorage.removeItem('cv_token'); } catch { /* ignore */ }
  };
  return [token, save];
}

function AuthPanel({ onAuthed }) {
  const [email, setEmail] = useState('demo@cloudvault.dev');
  const [password, setPassword] = useState('demopassword');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { token, user } = await fn(email, password);
      onAuthed(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Log in' : 'Register'}</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
      <button disabled={busy} type="submit">{busy ? '...' : mode === 'login' ? 'Log in' : 'Register'}</button>
      <p className="muted">
        {mode === 'login' ? 'No account?' : 'Have an account?'}{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'Register' : 'Log in'}
        </a>
      </p>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

function Uploader({ token, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      await api.uploadFile(token, file);
      onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  return (
    <div className="card">
      <h2>Upload a file</h2>
      <input type="file" onChange={onChange} disabled={busy} />
      {busy && <p className="muted">Uploading…</p>}
      {error && <p className="error">{error}</p>}
      <p className="muted">Tip: upload an image to see a thumbnail generated asynchronously.</p>
    </div>
  );
}

function FileList({ token, files, onDownload }) {
  return (
    <div className="card">
      <h2>Your files ({files.length})</h2>
      {files.length === 0 && <p className="muted">No files yet — upload one above.</p>}
      <ul className="files">
        {files.map((f) => (
          <li key={f.id}>
            <div className="thumb">
              {f.thumbnailUrl
                ? <img src={f.thumbnailUrl} alt={f.filename} />
                : <span className="noimg">{f.hasThumbnail ? '…' : '—'}</span>}
            </div>
            <div className="meta">
              <strong>{f.filename}</strong>
              <span className="muted">{f.contentType} · {(f.size / 1024).toFixed(1)} KB</span>
            </div>
            <button onClick={() => onDownload(f.id)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notifications({ items }) {
  return (
    <div className="card">
      <h2>Notifications ({items.length})</h2>
      {items.length === 0 && <p className="muted">Nothing yet.</p>}
      <ul className="notifs">
        {items.map((n) => (
          <li key={n.id}>
            <span className={`tag tag-${n.type.replace('.', '-')}`}>{n.type}</span>
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useLocalToken();
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const [f, n] = await Promise.all([api.listFiles(token), api.listNotifications(token)]);
      setFiles(f.files || []);
      setNotifs(n.notifications || []);
    } catch (err) {
      // Token likely expired — drop it.
      if (String(err.message).includes('401') || /unauthorized/i.test(err.message)) {
        setToken(''); setUser(null);
      }
    }
  }, [token, setToken]);

  useEffect(() => {
    if (!token) return;
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [token, refresh]);

  const onDownload = async (id) => {
    const file = await api.getFile(token, id);
    if (file.downloadUrl) window.open(file.downloadUrl, '_blank');
  };

  const logout = () => { setToken(''); setUser(null); setFiles([]); setNotifs([]); };

  return (
    <div className="app">
      <header>
        <h1>☁️ CloudVault</h1>
        {token && (
          <div className="session">
            <span className="muted">{user?.email || 'signed in'}</span>
            <button onClick={logout}>Log out</button>
          </div>
        )}
      </header>

      {!token ? (
        <AuthPanel onAuthed={(t, u) => { setToken(t); setUser(u); }} />
      ) : (
        <div className="grid">
          <Uploader token={token} onUploaded={refresh} />
          <Notifications items={notifs} />
          <FileList token={token} files={files} onDownload={onDownload} />
        </div>
      )}

      <footer className="muted">
        CloudVault DevOps starter · browser → gateway → services → Postgres / Redis / S3
      </footer>
    </div>
  );
}
