import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Aluno, API_BASE_URL } from '../types';
import { RefreshButton } from '../components/RefreshButton';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Presenca {
  id: number;
  alunoId: number;
  celulaId: number;
  data: string;
  presente: boolean;
  horasFeitas: number;
}

export function Acompanhamento() {
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const { data: alunos, fetchData: fetchAlunos } = useFetch<Aluno[]>();
  const [modulosPresencas, setModulosPresencas] = useState<{
    [moduloId: number]: Presenca[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAlunoChange = async (alunoId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const aluno = alunos?.find(a => a.id === alunoId) || null;
      setSelectedAluno(aluno);

      if (aluno) {
        const novasPresencas: typeof modulosPresencas = {};
        
        // Carregar presenças para todos os módulos do aluno
        for (const alunoModulo of aluno.alunoModulos || []) {
          const presencas = await fetchPresencas(aluno.id, alunoModulo.moduloId);
          novasPresencas[alunoModulo.moduloId] = presencas;
        }

        setModulosPresencas(novasPresencas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      setError('Erro ao carregar dados do aluno. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresencaChange = async (moduloId: number, celulaId: number, presente: boolean) => {
    if (!selectedAluno) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos/${selectedAluno.id}/presencas`, {
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
      const presencas = await fetchPresencas(selectedAluno.id, moduloId);
      setModulosPresencas(prev => ({
        ...prev,
        [moduloId]: presencas
      }));
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      setError('Erro ao salvar presença. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

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

      <div>
        <label htmlFor="aluno" className="block text-sm font-medium text-gray-700">
          Selecione o Aluno
        </label>
        <select
          id="aluno"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          onChange={(e) => handleAlunoChange(Number(e.target.value))}
          value={selectedAluno?.id || ''}
          disabled={isLoading || isSaving}
        >
          <option value="">Selecione um aluno</option>
          {alunos?.map((aluno) => (
            <option key={aluno.id} value={aluno.id}>
              {aluno.nome}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : selectedAluno && (
        <div className="space-y-8">
          {selectedAluno.curso?.modulos?.filter(modulo =>
            selectedAluno.alunoModulos?.some(am => am.moduloId === modulo.id)
          ).map((modulo) => {
            const alunoModulo = selectedAluno.alunoModulos?.find(am => am.moduloId === modulo.id);
            const presencas = modulosPresencas[modulo.id] || [];

            return (
              <div key={modulo.id} className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{modulo.nome}</h2>
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
      )}
    </div>
  );
} 