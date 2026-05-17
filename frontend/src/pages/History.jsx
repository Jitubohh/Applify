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
import Loading from '../components/loading';
import logo from '../assets/logo.svg';

const API = 'http://127.0.0.1:8000';

function ScoreBadge({ score }) {
  const color =
    score >= 70
      ? 'bg-app-brand/10 text-app-brand'
      : score >= 40
      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
      : 'bg-red-50 dark:bg-red-900/20 text-red-400';

  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${color}`}>
      {score}%
    </span>
  );
}

function ScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="120" height="120">
      <circle cx="60" cy="60" r={radius} stroke="#E5E7EB" strokeWidth="10" fill="none" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        className="text-app-brand"
        stroke="currentColor"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-lg font-bold fill-app-text dark:fill-app-ivory">
        {score}%
      </text>
    </svg>
  );
}

function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('history');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else fetchAnalyses(session.access_token);
    });
  }, []);

  const fetchAnalyses = async (token) => {
    try {
      const res = await axios.get(`${API}/analysis/my-analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analyses', err);
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
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-app-page dark:bg-app-dark text-app-text dark:text-app-ivory">
      <aside className="w-full md:w-64 bg-white dark:bg-app-panel border-b md:border-b-0 md:border-r border-gray-200 dark:border-app-muted/30 flex md:flex-col py-4 md:py-6 px-4 md:fixed md:h-full relative">
        <div className="md:hidden w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Applify" className="w-8 h-8" />
            <h1 className="text-xl font-bold">Applify</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="p-2 rounded-lg text-app-muted hover:bg-gray-100 dark:hover:bg-app-input hover:text-app-text dark:hover:text-app-ivory transition"
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

        <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-white dark:bg-app-panel border-b border-gray-200 dark:border-app-muted/30 shadow-sm z-20 p-3`}>
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
                    : 'text-app-muted hover:bg-gray-100 dark:hover:bg-app-input hover:text-app-text dark:hover:text-app-ivory'
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2 mb-8">
          <img src={logo} alt="Applify" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-app-text dark:text-app-ivory">Applify</h1>
        </div>

        <nav className="hidden md:flex md:flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveNav(id);
                navigate(`/${id}`);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap
                ${activeNav === id
                  ? 'bg-app-brand/10 text-app-brand'
                  : 'text-app-muted hover:bg-gray-100 dark:hover:bg-app-input hover:text-app-text dark:hover:text-app-ivory'
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="hidden md:flex ml-2 md:ml-0 items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-app-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition whitespace-nowrap"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="md:ml-64 flex-1 flex flex-col">
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {!selectedAnalysis ? (
            <>
              <h2 className="text-xl font-semibold text-app-text dark:text-app-ivory mb-6">Analysis History</h2>

              {loading ? (
                <Loading
                  messages={[
                    'Loading your analysis history...',
                    'Fetching previous resume reviews...',
                    'Rebuilding your history timeline...'
                  ]}
                  className="text-gray-400 dark:text-app-muted"
                />
              ) : analyses.length === 0 ? (
                <p className="text-app-muted">No analyses yet.</p>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {analyses.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAnalysis(item.analysis_json)}
                      className="bg-white dark:bg-app-panel p-6 rounded-xl shadow-sm flex justify-between cursor-pointer hover:border-app-brand border border-gray-200 dark:border-app-muted/30 transition"
                    >
                      <div>
                        <p className="text-sm text-app-text dark:text-app-ivory mb-2">{item.job_description.slice(0, 100)}...</p>
                        <p className="text-xs text-gray-400 dark:text-app-muted">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <ScoreBadge score={Math.round(item.analysis_json?.match_score || 0)} />
                        <ChevronRight size={16} className="text-gray-400 dark:text-app-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setSelectedAnalysis(null)} className="mb-6 text-sm text-app-brand">
                ← Back to History
              </button>

              <div className="bg-white dark:bg-app-panel p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-app-muted/30 flex flex-col items-center mb-6">
                <ScoreCircle score={Math.round(selectedAnalysis.match_score || 0)} />
                <p className="text-sm text-gray-500 dark:text-app-muted mt-4 text-center">{selectedAnalysis.overall_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-app-panel p-6 rounded-xl shadow-sm border border-gray-200 dark:border-app-muted/30">
                  <h3 className="text-green-600 mb-3">Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.matched_skills?.map((s, i) => (
                      <span key={i} className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-app-panel p-6 rounded-xl shadow-sm border border-gray-200 dark:border-app-muted/30">
                  <h3 className="text-red-400 dark:text-red-300 mb-3">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.missing_skills?.map((s, i) => (
                      <span key={i} className="text-xs bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-300 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-app-panel p-6 rounded-xl shadow-sm border border-gray-200 dark:border-app-muted/30 mb-6">
                <h3 className="mb-3 text-app-text dark:text-app-ivory">Suggestions</h3>
                <ul className="space-y-2 text-sm text-app-muted">
                  {selectedAnalysis.improvement_suggestions?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-app-panel p-6 rounded-xl shadow-sm border border-gray-200 dark:border-app-muted/30">
                <h3 className="mb-3 text-app-text dark:text-app-ivory">Suggested Projects</h3>
                <ul className="space-y-2 text-sm text-app-muted">
                  {selectedAnalysis.suggested_projects?.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HistoryPage;