import { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Aluno, Curso } from '../types';

export function Dashboard() {
  const { data: alunos, fetchData: fetchAlunos } = useFetch<Aluno[]>();
  const { data: cursos, fetchData: fetchCursos } = useFetch<Curso[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAlunos('/api/alunos'),
          fetchCursos('/api/cursos'),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchAlunos, fetchCursos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card de Alunos */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Alunos</h2>
            <span className="text-2xl font-semibold text-primary-600">
              {alunos?.length || 0}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Total de alunos cadastrados</p>
        </div>

        {/* Card de Cursos */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Cursos</h2>
            <span className="text-2xl font-semibold text-primary-600">
              {cursos?.length || 0}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Total de cursos disponíveis</p>
        </div>

        {/* Card de Módulos */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Módulos</h2>
            <span className="text-2xl font-semibold text-primary-600">
              {cursos?.reduce((acc, curso) => acc + (curso.modulos?.length || 0), 0) || 0}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Total de módulos ativos</p>
        </div>
      </div>

      {/* Lista de Alunos Recentes */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Alunos Recentes</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Curso</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alunos?.slice(0, 5).map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.curso?.nome}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        aluno.alunoModulos?.some(
                          (am) => am.status === 'CONCLUIDO'
                        )
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {aluno.alunoModulos?.some(
                        (am) => am.status === 'CONCLUIDO'
                      )
                        ? 'Concluído'
                        : 'Em andamento'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Cursos */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cursos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursos?.map((curso) => (
            <div
              key={curso.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-gray-900">{curso.nome}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {curso.modulos?.length || 0} módulos
              </p>
              <p className="text-sm text-gray-500">
                {curso.cargaHorariaTotal}h de carga horária
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 