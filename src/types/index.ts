// export const API_BASE_URL =  'http://localhost:3000'; //desenvolvimento
export const API_BASE_URL =  'https://back-endsyssolda.onrender.com'; //produção

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  idade: number;
  usaOculos: boolean;
  destroCanhoto: 'DESTRO' | 'CANHOTO';
  cursoId: number;
  curso?: Curso;
  alunoModulos?: AlunoModulo[];
  presencas?: Presenca[];
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
  cargaHorariaTotal: number;
  cursoId: number;
  curso?: Curso;
  celulas?: Celula[];
  alunoModulos?: AlunoModulo[];
  createdAt: string;
  updatedAt: string;
}

export interface Celula {
  id: number;
  ordem: number;
  siglaTecnica: string;
  moduloId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AlunoModulo {
  id: number;
  alunoId: number;
  moduloId: number;
  status: string;
  dataInicio: string | null;
  dataFim: string | null;
  aluno?: Aluno;
  modulo?: Modulo;
  createdAt: string;
  updatedAt: string;
}

export interface Presenca {
  id: number;
  alunoId: number;
  celulaId: number;
  data: string;
  presente: boolean;
  horasFeitas: number;
  aluno?: Aluno;
  celula?: Celula;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export interface NovoModulo {
  id?: number;
  nome: string;
  descricao: string;
  numeroCelulas?: number;
  siglaTecnica?: string;
  celulas?: Celula[];
  cargaHorariaTotal?: number;
} 