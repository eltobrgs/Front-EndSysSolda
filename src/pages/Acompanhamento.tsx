import { useState, useEffect, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Aluno, API_BASE_URL } from '../types';
import { RefreshButton } from '../components/RefreshButton';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FiltroAlunos } from '../components/FiltroAlunos';

interface Presenca {
  id: number;
  alunoId: number;
  celulaId: number;
  data: string;
  presente: boolean;
  horasFeitas: number;
}

interface AlunoPresencas {
  [alunoId: number]: {
    [moduloId: number]: Presenca[];
  };
}

interface Filtros {
  cursoId: number | null;
  moduloId: number | null;
  nomeAluno: string;
}

export function Acompanhamento() {
  const { data: alunos, fetchData: fetchAlunos } = useFetch<Aluno[]>();
  const [alunosPresencas, setAlunosPresencas] = useState<AlunoPresencas>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    cursoId: null,
    moduloId: null,
    nomeAluno: '',
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchAlunos('/api/alunos');
    };
    loadData();
  }, [fetchAlunos]);

  const fetchPresencas = async (alunoId: number, moduloId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/alunos/${alunoId}/modulos/${moduloId}/presencas`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Erro ao carregar presenças');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar presenças:', error);
      throw error;
    }
  };

  useEffect(() => {
    const carregarPresencas = async () => {
      if (!alunos) return;
      
      setIsLoading(true);
      setError(null);
      const novasPresencas: AlunoPresencas = {};

      try {
        for (const aluno of alunos) {
          novasPresencas[aluno.id] = {};
          
          for (const alunoModulo of aluno.alunoModulos || []) {
            const presencas = await fetchPresencas(aluno.id, alunoModulo.moduloId);
            novasPresencas[aluno.id][alunoModulo.moduloId] = presencas;
          }
        }

        setAlunosPresencas(novasPresencas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarPresencas();
  }, [alunos]);

  const handlePresencaChange = async (alunoId: number, moduloId: number, celulaId: number, presente: boolean) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/presencas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
        },
        body: JSON.stringify({
          celulaId,
          presente,
          horasFeitas: presente ? 4 : 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar presença');
      }

      // Atualizar as presenças do módulo
      const presencas = await fetchPresencas(alunoId, moduloId);
      setAlunosPresencas(prev => ({
        ...prev,
        [alunoId]: {
          ...prev[alunoId],
          [moduloId]: presencas
        }
      }));
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      setError('Erro ao salvar presença. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Agrupar alunos por curso com filtros aplicados
  const alunosFiltrados = useMemo(() => {
    if (!alunos) return [];

    return alunos.filter(aluno => {
      // Filtro por nome
      if (filtros.nomeAluno && !aluno.nome.toLowerCase().includes(filtros.nomeAluno.toLowerCase())) {
        return false;
      }

      // Filtro por curso
      if (filtros.cursoId && aluno.cursoId !== filtros.cursoId) {
        return false;
      }

      // Filtro por módulo
      if (filtros.moduloId) {
        return aluno.alunoModulos?.some(am => am.moduloId === filtros.moduloId);
      }

      return true;
    });
  }, [alunos, filtros]);

  const alunosPorCurso = useMemo(() => {
    return alunosFiltrados.reduce((acc, aluno) => {
      const cursoId = aluno.cursoId;
      if (!acc[cursoId]) {
        acc[cursoId] = {
          curso: aluno.curso,
          alunos: []
        };
      }
      acc[cursoId].alunos.push(aluno);
      return acc;
    }, {} as { [cursoId: number]: { curso: any, alunos: Aluno[] } });
  }, [alunosFiltrados]);

  if (!alunos) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-gray-900">Acompanhamento</h1>
          <RefreshButton 
            onClick={() => fetchAlunos('/api/alunos')} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {alunos && (
        <FiltroAlunos
          cursos={Array.from(new Set(alunos.map(a => a.curso))).filter((curso): curso is NonNullable<typeof curso> => curso !== undefined && curso !== null)}
          onFiltroChange={setFiltros}
        />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(alunosPorCurso).map(([cursoId, { curso, alunos }]) => (
            <div key={cursoId} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">{curso.nome}</h2>
              <div className="space-y-8">
                {alunos.map((aluno) => (
                  <div key={aluno.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{aluno.nome}</h3>
                    </div>
                    <div className="space-y-6">
                      {aluno.curso?.modulos
                        ?.filter(modulo => 
                          (!filtros.moduloId || modulo.id === filtros.moduloId) &&
                          aluno.alunoModulos?.some(am => am.moduloId === modulo.id)
                        )
                        .map((modulo) => {
                          const alunoModulo = aluno.alunoModulos?.find(am => am.moduloId === modulo.id);
                          const presencas = alunosPresencas[aluno.id]?.[modulo.id] || [];

                          return (
                            <div key={modulo.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="font-medium">{modulo.nome}</h4>
                                  <p className="text-sm text-gray-500">{modulo.descricao}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <span className={`text-sm font-medium ${
                                      alunoModulo?.status === 'concluido' 
                                        ? 'text-green-600' 
                                        : alunoModulo?.status === 'em_progresso' 
                                          ? 'text-blue-600' 
                                          : 'text-gray-600'
                                    }`}>
                                      {alunoModulo?.status === 'concluido' 
                                        ? 'Concluído' 
                                        : alunoModulo?.status === 'em_progresso' 
                                          ? 'Em Progresso' 
                                          : 'Pendente'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {modulo.celulas?.map((celula) => {
                                  const presenca = presencas.find(p => p.celulaId === celula.id);

                                  return (
                                    <div key={celula.id} className="bg-white p-3 rounded border">
                                      <div className="flex flex-col space-y-2">
                                        <div className="flex justify-between items-start">
                                          <span className="text-sm font-medium">{celula.siglaTecnica}</span>
                                          {presenca && presenca.presente !== null && (
                                            <span className="text-xs text-gray-500">
                                              {presenca.data ? new Date(presenca.data).toLocaleDateString() : ''}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handlePresencaChange(
                                              aluno.id,
                                              modulo.id,
                                              celula.id,
                                              true
                                            )}
                                            disabled={isSaving || presenca?.presente === true}
                                            className={`flex-1 p-2 rounded flex items-center justify-center transition-colors ${
                                              presenca?.presente === true
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                                            } disabled:opacity-50`}
                                            title="Marcar Presença"
                                          >
                                            <CheckIcon className="w-5 h-5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handlePresencaChange(
                                              aluno.id,
                                              modulo.id,
                                              celula.id,
                                              false
                                            )}
                                            disabled={isSaving || presenca?.presente === false}
                                            className={`flex-1 p-2 rounded flex items-center justify-center transition-colors ${
                                              presenca?.presente === false
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                            } disabled:opacity-50`}
                                            title="Marcar Falta"
                                          >
                                            <XMarkIcon className="w-5 h-5" />
                                          </button>
                                        </div>
                                        <div className="text-xs text-center">
                                          {presenca ? (
                                            presenca.presente === null ? (
                                              <span className="text-gray-500">Não registrado</span>
                                            ) : (
                                              <span className={`font-medium ${
                                                presenca.presente ? 'text-green-600' : 'text-red-600'
                                              }`}>
                                                {presenca.presente ? 'Presente' : 'Falta'}
                                              </span>
                                            )
                                          ) : (
                                            <span className="text-gray-500">Não registrado</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 