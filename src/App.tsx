import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Alunos } from './pages/Alunos';
import { Cursos } from './pages/Cursos';
import { Acompanhamento } from './pages/Acompanhamento';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/alunos"
            element={
              <PrivateRoute>
                <Alunos />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos"
            element={
              <PrivateRoute>
                <Cursos />
              </PrivateRoute>
            }
          />
          <Route
            path="/acompanhamento"
            element={
              <PrivateRoute>
                <Acompanhamento />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
