import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../services/supabase';
import logo from '../assets/logo.svg';
import Loading from '../components/loading';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src={logo} alt="Applify" className="mx-auto w-16 h-16 mb-3" />
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Applify</h1>
          <p className="text-gray-600 mt-2 text-sm">Your AI-powered resume intelligence agent</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome back</h2>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-app-brand transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-app-brand transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-brand hover:bg-app-brand-hover text-white font-semibold py-2.5 rounded-lg transition mt-2 inline-flex items-center justify-center"
            >
              {loading ? (
                <Loading compact messages={["Signing you in...", "Checking credentials...", "Opening your dashboard..."]} />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Google sign-in removed per user request */}

          <p className="text-sm text-gray-600 mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-gray-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;