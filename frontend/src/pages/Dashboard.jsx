import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import axios from 'axios';
import {
  LayoutDashboard, FileText, History, LogOut, Upload, Briefcase, ChevronRight, ArrowLeft, Menu, X, Sun, Moon
} from 'lucide-react';
import { ThreeDot } from 'react-loading-indicators';
import { useDarkMode } from '../hooks/DarkMode';

const API = 'http://127.0.0.1:8000';

function ScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#4A7C59' : score >= 40 ? '#E6A817' : '#C0392B';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 130 130" className="mt-5">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#D1D5DB" strokeWidth="12" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
        />
      </svg>
      <p className="text-3xl font-bold mt-[-87px] text-app-text dark:text-app-ivory">{score}%</p>
      <p className="mt-[50px] text-app-muted text-sm font-medium">Match Score</p>
    </div>
  );
}

function Avatar({ email }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : '??';
  return (
    <div className="w-9 h-9 rounded-full bg-app-brand flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  );
}

function Dashboard() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const handleResumeUpload = async () => {
    if (!file) return setError('Please select a PDF file');
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/resume/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setResumeId(res.data.data[0].id);
      setStep('analyze');
    } catch {
      setError('Resume upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async (token) => {
    const res = await axios.get(`${API}/resume/my-resumes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setResumes(res.data.data);
  };

  const handleResumeUpgrade = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.post(
        `${API}/upgrade/fit-resume`,
        { resume_id: resumeId, analysis_id: analysisId },
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fitted_resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Resume upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    if (!jobDescription) return setError('Please enter a job description');
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API}/analysis/submit`,
        { resume_id: resumeId, job_description: jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(res.data.data[0].analysis_json);
      setAnalysisId(res.data.data[0].id);
      setStep('results');
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen flex flex-col md:flex-row bg-app-page dark:bg-app-dark text-app-text dark:text-app-ivory">
      <aside className="w-full md:w-64 bg-white dark:bg-app-panel border-b md:border-b-0 md:border-r border-gray-200 dark:border-app-muted/30 flex md:flex-col py-4 md:py-6 px-4 md:fixed md:h-full relative">
        {/* Mobile top bar */}
        <div className="md:hidden w-full flex items-center justify-between">
          <h1 className="text-xl font-bold">Applify</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="p-2 rounded-lg text-app-muted hover:bg-gray-100 dark:hover:bg-app-input hover:text-app-text dark:hover:text-app-ivory transition"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile logout icon only */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-app-muted hover:bg-red-50 hover:text-red-500 transition"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
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

        {/* Desktop nav */}
        <h1 className="hidden md:block text-2xl font-bold px-2 mb-8 text-app-text dark:text-app-ivory">Applify</h1>

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
          className="hidden md:flex ml-2 md:ml-0 items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-app-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition whitespace-nowrap"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="md:ml-64 flex-1 flex flex-col">
        <header className="bg-white dark:bg-app-panel border-b border-gray-200 dark:border-app-muted/30 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-end gap-4">
          <button
            onClick={toggleDarkMode}
            className="text-[#9C9A9A] hover:text-[#2C2F2E] dark:hover:text-white transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && <Avatar email={user.email} />}
        </header>

        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-8">
            {['upload', 'analyze', 'results'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                    ${step === s || (i === 0 && step !== 'upload') || (i === 1 && step === 'results')
                      ? 'bg-app-brand text-white'
                      : 'bg-gray-200 dark:bg-app-input text-app-muted'
                    }`}
                >
                  {i + 1}
                </div>
                <span className={`text-sm font-medium capitalize ${step === s ? 'text-app-text dark:text-app-ivory' : 'text-app-muted'}`}>
                  {s === 'upload' ? 'Upload Resume' : s === 'analyze' ? 'Job Description' : 'Results'}
                </span>
                {i < 2 && <ChevronRight size={16} className="text-gray-300 dark:text-app-muted mx-1" />}
              </div>
            ))}
          </div>

          {step === 'upload' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
              <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-app-brand/10 rounded-xl flex items-center justify-center">
                    <Upload size={20} className="text-app-brand" />
                  </div>
                  <h2 className="text-lg font-semibold">Upload New Resume</h2>
                </div>
                <p className="text-app-muted text-sm mb-6">Upload a new resume in PDF format</p>

                <label
                  htmlFor="resume-upload"
                  className="border-2 border-dashed border-gray-200 dark:border-app-muted/30 hover:border-app-brand rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition mb-6 group"
                >
                  <Upload size={28} className="text-gray-300 dark:text-app-muted group-hover:text-app-brand mb-2 transition" />
                  <p className="text-app-muted text-sm">Click to upload PDF</p>
                  {file && <p className="text-app-brand text-sm font-medium mt-2">{file.name}</p>}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="resume-upload"
                  />
                </label>

                <button
                  onClick={handleResumeUpload}
                  disabled={loading}
                  className="w-full bg-app-brand hover:bg-app-brand-hover text-white font-semibold py-2.5 rounded-xl transition"
                >
                  {loading ? <ThreeDot variant="brick-stack" color="white" size="small" /> : 'Upload Resume'}
                </button>
              </div>

              <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-app-brand/10 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-app-brand" />
                  </div>
                  <h2 className="text-lg font-semibold">Saved Resumes</h2>
                </div>
                <p className="text-app-muted text-sm mb-6">Select a previously uploaded resume</p>

                {resumes.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-app-muted/30 rounded-xl p-8 flex flex-col items-center justify-center">
                    <FileText size={28} className="text-gray-300 dark:text-app-muted mb-2" />
                    <p className="text-app-muted text-sm">No saved resumes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        onClick={() => { setResumeId(resume.id); setStep('analyze'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-app-muted/30 hover:border-app-brand hover:bg-app-brand/5 transition text-left"
                      >
                        <FileText size={16} className="text-app-brand" />
                        <div>
                          <p className="text-sm font-medium text-app-text dark:text-app-ivory">{resume.pdf_path.split('/').pop()}</p>
                          <p className="text-xs text-app-muted">{new Date(resume.created_at).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'analyze' && (
            <div className="max-w-2xl">
              <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setStep('upload')} className="text-app-muted hover:text-app-text dark:hover:text-app-ivory transition">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-app-brand/10 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} className="text-app-brand" />
                  </div>
                  <h2 className="text-lg font-semibold">Paste Job Description</h2>
                </div>
                <p className="text-app-muted text-sm mb-6">Paste the job description you want to apply for</p>

                <textarea
                  rows={8}
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full border border-gray-200 dark:border-app-muted/30 rounded-xl px-4 py-3 text-app-text dark:text-app-ivory bg-app-page dark:bg-app-input placeholder-gray-300 dark:placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-brand transition resize-none mb-6 text-sm"
                />

                <button
                  onClick={handleAnalysis}
                  disabled={loading}
                  className="w-full bg-app-brand hover:bg-app-brand-hover text-white font-semibold py-2.5 rounded-xl transition"
                >
                  {loading ? <ThreeDot variant="brick-stack" color="white" size="small" /> : 'Analyze Resume'}
                </button>
              </div>
            </div>
          )}

          {step === 'results' && analysis && (
            <div className="grid grid-cols-1 gap-6 max-w-3xl">
              <div className="flex justify-end mb-2">
                <button onClick={() => setStep('analyze')} className="text-app-muted hover:text-app-text dark:hover:text-app-ivory transition">
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-8 shadow-sm flex flex-col items-center">
                <ScoreCircle score={Math.round(analysis.match_score)} />
                <p className="text-app-muted text-sm mt-4 text-center max-w-md">{analysis.overall_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 shadow-sm">
                  <h3 className="font-semibold text-app-brand mb-4 text-sm">✓ Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills.map((skill, i) => (
                      <span key={i} className="bg-app-brand/10 text-app-brand text-xs px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 shadow-sm">
                  <h3 className="font-semibold text-red-400 mb-4 text-sm">✗ Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.map((skill, i) => (
                      <span key={i} className="bg-red-50 text-red-400 text-xs px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 shadow-sm">
                <h3 className="font-semibold text-app-text dark:text-app-ivory mb-4 text-sm">Improvement Suggestions</h3>
                <ul className="space-y-3">
                  {analysis.improvement_suggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-3 text-sm text-app-muted">
                      <span className="text-app-brand font-bold mt-0.5">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-app-panel rounded-2xl border border-gray-200 dark:border-app-muted/30 p-6 shadow-sm">
                <h3 className="font-semibold text-app-text dark:text-app-ivory mb-4 text-sm">Suggested Projects to Build</h3>
                <ul className="space-y-3">
                  {analysis.suggested_projects.map((project, i) => (
                    <li key={i} className="flex gap-3 text-sm text-app-muted">
                      <span className="text-app-brand font-bold mt-0.5">•</span>
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="w-full bg-app-brand hover:bg-app-brand-hover text-white font-semibold py-3 rounded-xl transition text-base"
                onClick={handleResumeUpgrade}
                disabled={loading}
              >
                {loading ? <ThreeDot variant="brick-stack" color="white" size="small" /> : 'Fit Resume to Job Description'}
              </button>

              <button
                className="w-full border border-gray-200 dark:border-app-muted/30 text-app-muted hover:text-app-text dark:hover:text-app-ivory hover:border-gray-300 dark:hover:border-app-muted font-semibold py-3 rounded-xl transition text-sm"
                onClick={() => {
                  setStep('upload');
                  setAnalysis(null);
                  setFile(null);
                  setJobDescription('');
                  setResumeId(null);
                  setAnalysisId(null);
                }}
              >
                Analyze Another Resume
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;