import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import axios from 'axios';
import {
  LayoutDashboard,
  FileText,
  History,
  LogOut,
  ChevronRight
} from 'lucide-react';

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
  const color =
    score >= 70
      ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
      : score >= 40
      ? 'bg-yellow-100 text-yellow-600'
      : 'bg-red-50 text-red-400';

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
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#E5E7EB"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#4A7C59"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="text-lg font-bold fill-[#2C2F2E]"
      >
        {score}%
      </text>
    </svg>
  );
}

function HistoryPage() {
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('history');

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else {
        setUser(session.user);
        fetchAnalyses(session.access_token);
      }
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
    <div className="min-h-screen flex bg-[#F0F2F5] text-[#2C2F2E]">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6 px-4 fixed h-full">
        <h1 className="text-2xl font-bold px-2 mb-8">Applify</h1>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveNav(id);
                navigate(`/${id}`);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${
                  activeNav === id
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#9C9A9A] hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1 flex flex-col">
        <header className="bg-white border-b px-8 py-4 flex justify-end">
          {user && <Avatar email={user.email} />}
        </header>

        <main className="p-8 flex-1">

          {/* SWITCH VIEW */}
          {!selectedAnalysis ? (
            <>
              <h2 className="text-xl font-semibold mb-6">Analysis History</h2>

              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : analyses.length === 0 ? (
                <p>No analyses yet.</p>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {analyses.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {setSelectedAnalysis(item.analysis_json);}
                      }
                      className="bg-white p-6 rounded-xl shadow-sm flex justify-between cursor-pointer hover:border-[#4A7C59] border"
                    >
                      <div>
                        <p className="text-sm mb-2">
                          {item.job_description.slice(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <ScoreBadge
                          score={Math.round(
                            item.analysis_json?.match_score || 0
                          )}
                        />
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* BACK */}
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="mb-6 text-sm text-[#4A7C59]"
              >
                ← Back to History
              </button>

              {/* SCORE */}
              <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center mb-6">
                <ScoreCircle
                  score={Math.round(selectedAnalysis.match_score || 0)}
                />
                <p className="text-sm text-gray-500 mt-4 text-center">
                  {selectedAnalysis.overall_summary}
                </p>
              </div>

              {/* SKILLS */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-green-600 mb-3">Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.matched_skills?.map((s, i) => (
                      <span key={i} className="text-xs bg-green-100 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-red-400 mb-3">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.missing_skills?.map((s, i) => (
                      <span key={i} className="text-xs bg-red-100 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SUGGESTIONS */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="mb-3">Suggestions</h3>
                <ul>
                  {selectedAnalysis.improvement_suggestions?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              {/* PROJECTS */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="mb-3">Suggested Projects</h3>
                <ul>
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