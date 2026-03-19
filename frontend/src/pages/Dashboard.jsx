import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import axios from 'axios';
import {
  LayoutDashboard, FileText, History, Settings, LogOut, Upload, Briefcase, ChevronRight
} from 'lucide-react';
import {ThreeDot} from 'react-loading-indicators'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const API = 'http://127.0.0.1:8000';

function ScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#4A7C59' : score >= 40 ? '#E6A817' : '#C0392B';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 130 130" className='mt-20px'>
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#D1D5DB" strokeWidth="12" />
        <circle
          cx="65" cy="65" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
        />
      </svg>
      <p className="text-3xl font-bold mt-[-87px] text-[#2C2F2E]">{score}%</p>
      <p className="mt-[50px] text-[#9C9A9A] text-sm font-medium">Match Score</p>
    </div>
  );
}

function Avatar({ email }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : '??';
  return (
    <div className="w-9 h-9 rounded-full bg-[#4A7C59] flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload');
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else {
        setUser(session.user);
        fetchResumes(session.access_token);
      };
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
    } catch (err) {
      setError('Resume upload failed. Please try again.');
    }
    setLoading(false);
  };

  const fetchResumes = async (token) => {
    const res = await axios.get(`${API}/resume/my-resumes`, {
        headers: { Authorization: `Bearer ${token}`}
      });
    setResumes(res.data.data);
  }

  const handleAnalysis = async () => {
    if (!jobDescription) return setError('Please enter a job description');
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await axios.post(`${API}/analysis/submit`,
        { resume_id: resumeId, job_description: jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(res.data.data[0].analysis_json);
      setStep('results');
    } catch (err) {
      setError('Analysis failed. Please try again.');
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
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#F0F2F5] text-[#2C2F2E]">

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6 px-4 fixed h-full">
        <h1 className="text-2xl font-bold text-[#2C2F2E] px-2 mb-8">Applify</h1>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
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

      <div className="ml-64 flex-1 flex flex-col">

        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end">
          {user && <Avatar email={user.email} />}
        </header>

        <main className="p-8 flex-1">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {['upload', 'analyze', 'results'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                  ${step === s || (i === 0 && step !== 'upload') || (i === 1 && step === 'results')
                    ? 'bg-[#4A7C59] text-white'
                    : 'bg-gray-200 text-[#9C9A9A]'
                  }`}>
                  {i + 1}
                </div>
                <span className={`text-sm font-medium capitalize ${step === s ? 'text-[#2C2F2E]' : 'text-[#9C9A9A]'}`}>
                  {s === 'upload' ? 'Upload Resume' : s === 'analyze' ? 'Job Description' : 'Results'}
                </span>
                {i < 2 && <ChevronRight size={16} className="text-gray-300 mx-1" />}
              </div>
            ))}
          </div>

          {/* Step 1 - Upload */}
          {step === 'upload' && (
  <div className="grid grid-cols-2 gap-6 max-w-4xl">

    {/* Upload New Resume */}
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#4A7C59]/10 rounded-xl flex items-center justify-center">
          <Upload size={20} className="text-[#4A7C59]" />
        </div>
        <h2 className="text-lg font-semibold">Upload New Resume</h2>
      </div>
      <p className="text-[#9C9A9A] text-sm mb-6">Upload a new resume in PDF format</p>

      <label
        htmlFor="resume-upload"
        className="border-2 border-dashed border-gray-200 hover:border-[#4A7C59] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition mb-6 group"
      >
        <Upload size={28} className="text-gray-300 group-hover:text-[#4A7C59] mb-2 transition" />
        <p className="text-[#9C9A9A] text-sm">Click to upload PDF</p>
        {file && <p className="text-[#4A7C59] text-sm font-medium mt-2">{file.name}</p>}
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
        className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white font-semibold py-2.5 rounded-xl transition"
      >
        {loading ? <ThreeDot variant="brick-stack" color="white" size="small"/> : 'Upload Resume'}
      </button>
    </div>

    {/* Saved Resumes */}
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#4A7C59]/10 rounded-xl flex items-center justify-center">
          <FileText size={20} className="text-[#4A7C59]" />
        </div>
        <h2 className="text-lg font-semibold">Saved Resumes</h2>
      </div>
      <p className="text-[#9C9A9A] text-sm mb-6">Select a previously uploaded resume</p>

      {resumes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center">
          <FileText size={28} className="text-gray-300 mb-2" />
          <p className="text-[#9C9A9A] text-sm">No saved resumes yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {resumes.map((resume) => (
            <button
              key={resume.id}
              onClick={() => { setResumeId(resume.id); setStep('analyze'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-[#4A7C59] hover:bg-[#4A7C59]/5 transition text-left"
            >
              <FileText size={16} className="text-[#4A7C59]" />
              <div>
                <p className="text-sm font-medium text-[#2C2F2E]">
                  {resume.pdf_path.split('/').pop()}
                </p>
                <p className="text-xs text-[#9C9A9A]">
                  {new Date(resume.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>

  </div>
)}

          {/* Step 2 - Job Description */}
          {step === 'analyze' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#4A7C59]/10 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} className="text-[#4A7C59]" />
                  </div>
                  <h2 className="text-lg font-semibold">Paste Job Description</h2>
                </div>
                <p className="text-[#9C9A9A] text-sm mb-6">Paste the job description you want to apply for</p>

                <textarea
                  rows={8}
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[#2C2F2E] bg-[#F0F2F5] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] transition resize-none mb-6 text-sm"
                />

                <button
                  onClick={handleAnalysis}
                  disabled={loading}
                  className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white font-semibold py-2.5 rounded-xl transition"
                >
                  {loading ? <ThreeDot variant="brick-stack" color="white" size="small"/> : 'Analyze Resume'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Results */}
          {step === 'results' && analysis && (
            <div className="grid grid-cols-1 gap-6 max-w-3xl">

              {/* Score Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col items-center">
                <ScoreCircle score={Math.round(analysis.match_score)} />
                <p className="text-[#9C9A9A] text-sm mt-4 text-center max-w-md">{analysis.overall_summary}</p>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-[#4A7C59] mb-4 text-sm">✓ Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills.map((skill, i) => (
                      <span key={i} className="bg-[#4A7C59]/10 text-[#4A7C59] text-xs px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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

              {/* Suggestions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-[#2C2F2E] mb-4 text-sm">Improvement Suggestions</h3>
                <ul className="space-y-3">
                  {analysis.improvement_suggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#9C9A9A]">
                      <span className="text-[#4A7C59] font-bold mt-0.5">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Projects */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-[#2C2F2E] mb-4 text-sm">Suggested Projects to Build</h3>
                <ul className="space-y-3">
                  {analysis.suggested_projects.map((project, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#9C9A9A]">
                      <span className="text-[#4A7C59] font-bold mt-0.5">•</span>
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fit Resume Button */}
              <button className="w-full bg-[#4A7C59] hover:bg-[#3d6849] text-white font-semibold py-3 rounded-xl transition text-base">
                Fit Resume to Job Description
              </button>

              <button
                onClick={() => { setStep('upload'); setAnalysis(null); setFile(null); setJobDescription(''); }}
                className="w-full border border-gray-200 text-[#9C9A9A] hover:text-[#2C2F2E] hover:border-gray-300 font-semibold py-3 rounded-xl transition text-sm"
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