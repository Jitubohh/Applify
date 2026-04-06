import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import axios from 'axios';
import { LayoutDashboard, FileText, History, Settings, LogOut, ChevronRight } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

function Avatar({ email }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : '??';
  return (
    <div className="w-9 h-9 rounded-full bg-[#4A7C59] flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : score >= 40 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-50 text-red-400';
  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${color}`}>
      {score}%
    </span>
  );
}

function ResumePage() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('resume');
  const [selectedResume, setSelectedResume] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else {
        setUser(session.user);
        fetchResumes(session.access_token);
      }
    });
  }, []);

  const fetchResumes = async (token) => {
    try {
      const res = await axios.get(`${API}/resume/my-resumes`, {
        headers: { Authorization: `Bearer ${token}`}
      });
    setResumes(res.data.data);
    } catch (err) {
      console.error('Failed to fetch resumes');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume', label: 'My Resumes', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen flex bg-[#F0F2F5] text-[#2C2F2E]">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6 px-4 fixed h-full">
        <h1 className="text-2xl font-bold text-[#2C2F2E] px-2 mb-8">Applify</h1>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveNav(id); navigate(`/${id}`); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition w-full text-left
                ${activeNav === id
                  ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                  : 'text-[#9C9A9A] hover:bg-gray-100 hover:text-[#2C2F2E]'
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9C9A9A] hover:bg-red-50 hover:text-red-500 transition w-full text-left"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end">
          {user && <Avatar email={user.email} />}
        </header>

        <main className="p-8 flex-1">
          <h2 className="text-xl font-semibold text-[#2C2F2E] mb-6">My Resumes</h2>

          {loading ? (
            <p className="text-[#9C9A9A] text-sm">Loading...</p>
          ) : resumes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-[#9C9A9A] text-sm">No resumes yet. Upload a resume to get started.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {resumes.map((item) => (
                <div
                  key={item.id}
                  onClick={setSelectedResume()}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between hover:border-[#4A7C59] transition cursor-pointer"
                >
                  <div className="flex-1 pr-6">
                    <p className="text-sm text-[#2C2F2E] font-medium line-clamp-2 mb-2">
                      {item.pdf_path.split('/').pop()}
                    </p>
                    <p className="text-xs text-[#9C9A9A]">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ResumePage;