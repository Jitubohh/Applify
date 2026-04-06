import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';
import ResumePage from './pages/Resumes';
import ProtectedRoute from './components/protectedRoute';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} />
          <Route path='/history' element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>} />
          <Route path='/resume' element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App