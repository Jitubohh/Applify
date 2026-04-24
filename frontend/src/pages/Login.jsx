import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../services/supabase';
import loginImage from '../assets/loginImage.png';

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
    <div className="min-h-screen bg-app-dark flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-1/2">
        <img src={loginImage} alt="Login" className="h-screen w-full object-cover rounded-r-3xl" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-app-brand tracking-tight">Applify</h1>
            <p className="text-app-muted mt-2 text-sm">
              Your AI-powered resume intelligence agent
            </p>
          </div>

          <div className="bg-app-panel border border-app-muted/20 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-app-ivory mb-6">Welcome back</h2>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app-muted mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-app-muted/30 rounded-lg px-4 py-2.5 text-app-ivory bg-app-input placeholder-app-muted/50 focus:outline-none focus:ring-2 focus:ring-app-brand transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-muted mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-app-muted/30 rounded-lg px-4 py-2.5 text-app-ivory bg-app-input placeholder-app-muted/50 focus:outline-none focus:ring-2 focus:ring-app-brand transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-app-brand hover:bg-app-brand-hover text-white font-semibold py-2.5 rounded-lg transition mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-sm text-app-muted mt-6 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-app-ivory hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;