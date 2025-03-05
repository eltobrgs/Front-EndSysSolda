export const API_BASE_URL = 'https://back-endsyssolda.onrender.com';

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  role: string;
}

export interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  usaOculos: boolean;
  destroCanhoto: 'DESTRO' | 'CANHOTO';
  idade: number;
  cursoId: number;
  curso?: Curso;
  alunoModulos?: AlunoModulo[];
  createdAt: string;
  updatedAt: string;
}

export interface Curso {
  id: number;
  nome: string;
  descricao: string;
  cargaHorariaTotal: number;
  preRequisitos?: string;
  materialNecessario?: string;
  modulos?: Modulo[];
  alunos?: Aluno[];
  createdAt: string;
  updatedAt: string;
}

export interface Modulo {
  id: number;
  nome: string;
  descricao: string;
  cursoId: number;
  aulas?: Aula[];
  createdAt: string;
  updatedAt: string;
}

export interface Aula {
  id: number;
  nome: string;
  descricao: string;
  cargaHoraria: number;
  siglaTecnica: string;
  moduloId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlunoModulo {
  id: number;
  alunoId: number;
  moduloId: number;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  dataInicio?: string | null;
  dataTermino?: string | null;
  modulo?: Modulo;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
} 