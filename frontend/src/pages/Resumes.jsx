import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import axios from 'axios';
import {
  LayoutDashboard,
  FileText,
  History,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const API = 'http://127.0.0.1:8000';

function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('resume');
  const [selectedResume, setSelectedResume] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else fetchResumes(session.access_token);
    });
  }, []);

  const fetchResumes = async (token) => {
    try {
      const res = await axios.get(`${API}/resume/my-resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(res.data.data);
    } catch {
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
    <div className="min-h-screen flex flex-col md:flex-row bg-app-page text-app-text">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col py-4 md:py-6 px-4 md:fixed md:h-full relative">
        <div className="md:hidden w-full flex items-center justify-between">
          <h1 className="text-xl font-bold">Applify</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="p-2 rounded-lg text-app-muted hover:bg-gray-100 hover:text-app-text transition"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-app-muted hover:bg-red-50 hover:text-red-500 transition"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-20 p-3`}>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveNav(id);
                  setMobileNavOpen(false);
                  navigate(`/${id}`);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left
                  ${activeNav === id
                    ? 'bg-app-brand/10 text-app-brand'
                    : 'text-app-muted hover:bg-gray-100 hover:text-app-text'
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <h1 className="hidden md:block text-2xl font-bold text-app-text px-2 mb-8">Applify</h1>

        <nav className="hidden md:flex md:flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveNav(id); navigate(`/${id}`); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition w-full text-left whitespace-nowrap
                ${activeNav === id
                  ? 'bg-app-brand/10 text-app-brand'
                  : 'text-app-muted hover:bg-gray-100 hover:text-app-text'
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="hidden md:flex ml-2 md:ml-0 items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-app-muted hover:bg-red-50 hover:text-red-500 transition w-full text-left whitespace-nowrap"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="md:ml-64 flex-1 flex flex-col">
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          <h2 className="text-xl font-semibold text-app-text mb-6">My Resumes</h2>

          {loading ? (
            <p className="text-app-muted text-sm">Loading...</p>
          ) : resumes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-app-muted text-sm">No resumes yet. Upload a resume to get started.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {resumes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedResume(item)}
                  className={`bg-white rounded-2xl border p-6 shadow-sm flex items-center justify-between transition cursor-pointer ${
                    selectedResume?.id === item.id ? 'border-app-brand' : 'border-gray-200 hover:border-app-brand'
                  }`}
                >
                  <div className="flex-1 pr-6">
                    <p className="text-sm text-app-text font-medium line-clamp-2 mb-2">
                      {item.pdf_path.split('/').pop()}
                    </p>
                    <p className="text-xs text-app-muted">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
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