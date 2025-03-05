import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, AuthResponse, API_BASE_URL } from '../types';

interface AuthContextData {
  usuario: Usuario | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('@SysSolda:token');
    const storedUser = localStorage.getItem('@SysSolda:user');

    if (storedToken && storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const signIn = async (email: string, senha: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data: AuthResponse = await response.json();

      localStorage.setItem('@SysSolda:token', data.token);
      localStorage.setItem('@SysSolda:user', JSON.stringify(data.usuario));

      setUsuario(data.usuario);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('@SysSolda:token');
    localStorage.removeItem('@SysSolda:user');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        signIn,
        signOut,
        isAuthenticated: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
} 