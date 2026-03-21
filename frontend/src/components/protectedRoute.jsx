import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import {ThreeDot} from 'react-loading-indicators'

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
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
      <ThreeDot variant="brick-stack" color="black" size="small"/>
    </div>
  );

  return children;
}

export default ProtectedRoute;