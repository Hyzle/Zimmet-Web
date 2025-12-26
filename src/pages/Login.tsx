import { FormEvent, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/users' : '/app/my-assets'} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Giriş Yap</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border rounded p-2 bg-transparent"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <input
            className="w-full border rounded p-2 bg-transparent"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={loading} className="w-full bg-blue-600 disabled:opacity-60 text-white rounded p-2">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Not: Demo için admin girişi yapmak isterseniz e-posta "admin*@..." ile başlayabilir.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
