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
    <div className="min-h-screen flex bg-[#1A1A1A]">
      <div>
            <img src={loginImage} alt="Login" className="rounded-3xl"/>
      </div>

      <div className="w-full max-w-md px-4 mt-10">

        {/* Brand */}
         <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#F5F0E8] tracking-tight">Applify</h1>
            <p className="text-[#9C9A9A] mt-2 text-sm">
              Your AI-powered resume intelligence agent
            </p>
          </div>

          <div className="bg-[#3D4140] border border-[#9C9A9A]/20 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-[#F5F0E8] mb-6">Welcome back</h2>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9C9A9A] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#9C9A9A]/30 rounded-lg px-4 py-2.5 text-[#F5F0E8] bg-[#2C2F2E] placeholder-[#9C9A9A]/50 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9C9A9A] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#9C9A9A]/30 rounded-lg px-4 py-2.5 text-[#F5F0E8] bg-[#2C2F2E] placeholder-[#9C9A9A]/50 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white font-semibold py-2.5 rounded-lg transition mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-sm text-[#9C9A9A] mt-6 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#F5F0E8] hover:underline">
                Create one
              </Link>
            </p>
          </div>

      </div>
    </div>
  );
}

export default Login;