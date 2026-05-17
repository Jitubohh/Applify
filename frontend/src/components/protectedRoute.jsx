import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import Loading from './loading';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="rounded-2xl border border-black/10 bg-white/80 shadow-lg px-5 py-4 text-[#2C2F2E]">
        <Loading
          messages={[
            'Verifying your session...',
            'Checking access permissions...',
            'Opening your workspace...'
          ]}
        />
      </div>
    </div>
  );

  return children;
}

export default ProtectedRoute;