import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Aluno, Curso, API_BASE_URL } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { RefreshButton } from '../components/RefreshButton';

type DestroCanhoto = 'DESTRO' | 'CANHOTO';

export function Alunos() {
  const [showModal, setShowModal] = useState(false);
  const [showProgressoModal, setShowProgressoModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const { data: alunos, fetchData: fetchAlunos } = useFetch<Aluno[]>();
  const { data: cursos, fetchData: fetchCursos } = useFetch<Curso[]>();
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAlunos('/api/alunos'),
          fetchCursos('/api/cursos')
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchAlunos, fetchCursos]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        setIsDeleting(id);
        await fetch(`${API_BASE_URL}/api/alunos/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
          },
        });
        fetchAlunos('/api/alunos');
      } catch (error) {
        console.error('Erro ao excluir aluno:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const calcularProgresso = (aluno: Aluno) => {
    if (!aluno.alunoModulos?.length) return 0;
    const modulosConcluidos = aluno.alunoModulos.filter(
      (am) => am.status === 'CONCLUIDO'
    ).length;
    return Math.round((modulosConcluidos / aluno.alunoModulos.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-semibold text-gray-900">Alunos</h1>
          <RefreshButton 
            onClick={() => {
              setLoading(true);
              Promise.all([
                fetchAlunos('/api/alunos'),
                fetchCursos('/api/cursos')
              ]).finally(() => setLoading(false));
            }} 
            isLoading={loading} 
          />
        </div>
        <button
          onClick={() => {
            setEditingAluno(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Aluno
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">CPF</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Telefone</th>
                <th className="px-4 py-2 text-left">Curso</th>
                <th className="px-4 py-2 text-left">Progresso</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos?.map((aluno) => (
                <tr key={aluno.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{aluno.nome}</td>
                  <td className="px-4 py-2">{aluno.cpf}</td>
                  <td className="px-4 py-2">{aluno.email}</td>
                  <td className="px-4 py-2">{aluno.telefone}</td>
                  <td className="px-4 py-2">{aluno.curso?.nome}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div
                          className="bg-primary-600 h-2.5 rounded-full"
                          style={{ width: `${calcularProgresso(aluno)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {calcularProgresso(aluno)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingAluno(aluno);
                          setShowProgressoModal(true);
                        }}
                        className="p-1 text-primary-600 hover:text-primary-900"
                        title="Atualizar Progresso"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingAluno(aluno);
                          setShowModal(true);
                        }}
                        className="p-1 text-primary-600 hover:text-primary-900"
                        title="Editar Aluno"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(aluno.id)}
                        className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={isDeleting === aluno.id}
                        title="Excluir Aluno"
                      >
                        {isDeleting === aluno.id ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                        <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AlunoModal
          aluno={editingAluno}
          cursos={cursos || []}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchAlunos('/api/alunos');
          }}
        />
      )}

      {showProgressoModal && editingAluno && (
        <ProgressoModal
          aluno={editingAluno}
          onClose={() => setShowProgressoModal(false)}
          onSave={() => {
            setShowProgressoModal(false);
            fetchAlunos('/api/alunos');
          }}
        />
      )}
    </div>
  );
}

interface AlunoModalProps {
  aluno: Aluno | null;
  cursos: Curso[];
  onClose: () => void;
  onSave: () => void;
}

function AlunoModal({ aluno, cursos, onClose, onSave }: AlunoModalProps) {
  const [formData, setFormData] = useState({
    nome: aluno?.nome || '',
    cpf: aluno?.cpf || '',
    email: aluno?.email || '',
    telefone: aluno?.telefone || '',
    usaOculos: aluno?.usaOculos || false,
    idade: aluno?.idade || 18,
    cursoId: aluno?.cursoId || cursos[0]?.id || 0,
    destroCanhoto: (aluno?.destroCanhoto || 'DESTRO') as DestroCanhoto,
  });

  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(
    aluno?.curso || cursos[0] || null
  );

  const [selectedModulos, setSelectedModulos] = useState<{
    moduloId: number;
    selecionado: boolean;
    dataInicio: string;
    dataFim: string;
  }[]>(
    (() => {
      const cursoAtual = aluno?.curso || cursos[0] || null;
      
      if (!cursoAtual) return [];

      const alunoModulosMap = new Map(
        aluno?.alunoModulos?.map(am => [
          am.moduloId,
          {
          selecionado: true,
          dataInicio: am.dataInicio ? new Date(am.dataInicio).toISOString().split('T')[0] : '',
          dataFim: am.dataFim ? new Date(am.dataFim).toISOString().split('T')[0] : '',
          }
        ]) || []
      );

      return cursoAtual.modulos?.map(modulo => {
        const moduloDoAluno = alunoModulosMap.get(modulo.id);
        return {
          moduloId: modulo.id,
          selecionado: !!moduloDoAluno,
          dataInicio: moduloDoAluno?.dataInicio || '',
          dataFim: moduloDoAluno?.dataFim || '',
        };
      }) || [];
    })()
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleCursoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cursoId = Number(e.target.value);
    setFormData({ ...formData, cursoId });
    const novoCurso = cursos.find((c) => c.id === cursoId) || null;
    setSelectedCurso(novoCurso);
    
    // Atualiza a lista de módulos quando o curso muda
    if (novoCurso) {
      setSelectedModulos(
        novoCurso.modulos?.map((modulo) => ({
          moduloId: modulo.id,
          selecionado: false,
          dataInicio: '',
          dataFim: '',
        })) || []
      );
    } else {
      setSelectedModulos([]);
    }
  };

  const handleDestroCanhotoChange = (value: DestroCanhoto) => {
    setFormData(prev => ({
      ...prev,
      destroCanhoto: value
    }));
  };

  const handleModuloChange = (moduloId: number, field: string, value: boolean | string) => {
    setSelectedModulos(
      selectedModulos.map((m) =>
        m.moduloId === moduloId ? { ...m, [field]: value } : m
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const url = aluno
      ? `${API_BASE_URL}/api/alunos/${aluno.id}`
      : `${API_BASE_URL}/api/alunos`;
    const method = aluno ? 'PUT' : 'POST';

    // Filtra apenas os módulos selecionados
    const modulosSelecionados = selectedModulos
      .filter((m) => m.selecionado)
      .map((m) => ({
        moduloId: m.moduloId,
        status: 'PENDENTE',
        dataInicio: m.dataInicio || null,
        dataFim: m.dataFim || null,
      }));

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
        },
        body: JSON.stringify({
          ...formData,
          modulos: modulosSelecionados,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar aluno');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {aluno ? 'Editar Aluno' : 'Novo Aluno'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="label">Nome</label>
              <input
                type="text"
                id="nome"
                className="input"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="cpf" className="label">CPF</label>
              <input
                type="text"
                id="cpf"
                className="input"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                type="email"
                id="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="telefone" className="label">Telefone</label>
              <input
                type="tel"
                id="telefone"
                className="input"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="idade" className="label">Idade</label>
              <input
                type="number"
                id="idade"
                className="input"
                value={formData.idade}
                onChange={(e) => setFormData({ ...formData, idade: Number(e.target.value) })}
                required
                min="16"
              />
            </div>

            <div>
              <label htmlFor="curso" className="label">Curso</label>
              <select
                id="curso"
                className="input"
                value={formData.cursoId}
                onChange={handleCursoChange}
                required
              >
                <option value="">Selecione um curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="usaOculos"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formData.usaOculos}
                onChange={(e) => setFormData({ ...formData, usaOculos: e.target.checked })}
              />
              <label htmlFor="usaOculos" className="ml-2 text-sm text-gray-700">
                Usa Óculos
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="destro"
                  name="destroCanhoto"
                  value="DESTRO"
                  checked={formData.destroCanhoto === 'DESTRO'}
                  onChange={() => handleDestroCanhotoChange('DESTRO')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="destro" className="ml-2 text-sm text-gray-700">
                  Destro
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="canhoto"
                  name="destroCanhoto"
                  value="CANHOTO"
                  checked={formData.destroCanhoto === 'CANHOTO'}
                  onChange={() => handleDestroCanhotoChange('CANHOTO')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="canhoto" className="ml-2 text-sm text-gray-700">
                  Canhoto
                </label>
              </div>
            </div>
          </div>

          {selectedCurso && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Módulos do Curso</h3>
              <p className="text-sm text-gray-600 mb-4">
                Selecione os módulos que o aluno irá cursar e defina as datas de início e término:
              </p>
              <div className="space-y-4">
                {selectedCurso.modulos?.map((modulo) => {
                  const moduloSelecionado = selectedModulos.find(
                    (m) => m.moduloId === modulo.id
                  );
                  
                  return (
                    <div key={modulo.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <input
                            type="checkbox"
                            id={`modulo-${modulo.id}`}
                            checked={moduloSelecionado?.selecionado || false}
                            onChange={(e) =>
                              handleModuloChange(modulo.id, 'selecionado', e.target.checked)
                            }
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                          />
                          <label htmlFor={`modulo-${modulo.id}`} className="font-medium">
                            {modulo.nome}
                          </label>
                        </div>
                        
                        {moduloSelecionado?.selecionado && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                            <div>
                              <label htmlFor={`inicio-${modulo.id}`} className="text-xs text-gray-500">
                                Data de Início
                              </label>
                              <input
                                type="date"
                                id={`inicio-${modulo.id}`}
                                value={moduloSelecionado?.dataInicio || ''}
                                onChange={(e) =>
                                  handleModuloChange(modulo.id, 'dataInicio', e.target.value)
                                }
                                className="input py-1 px-2 text-sm w-full"
                              />
                            </div>
                            <div>
                              <label htmlFor={`termino-${modulo.id}`} className="text-xs text-gray-500">
                                Data de Término
                              </label>
                              <input
                                type="date"
                                id={`termino-${modulo.id}`}
                                value={moduloSelecionado?.dataFim || ''}
                                onChange={(e) =>
                                  handleModuloChange(modulo.id, 'dataFim', e.target.value)
                                }
                                className="input py-1 px-2 text-sm w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600">{modulo.descricao}</p>
                      
                      {moduloSelecionado?.selecionado && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Células do Módulo:</h5>
                          <div className="grid grid-cols-5 gap-2">
                            {modulo.celulas?.map((celula) => (
                              <div
                                key={celula.id}
                                className="p-2 bg-white rounded border border-gray-200 text-center"
                              >
                                <div className="text-sm font-medium">Célula {celula.ordem}</div>
                                <div className="text-xs text-gray-500">{celula.siglaTecnica}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn btn-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProgressoModalProps {
  aluno: Aluno;
  onClose: () => void;
  onSave: () => void;
}

function ProgressoModal({ aluno, onClose, onSave }: ProgressoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modulosStatus, setModulosStatus] = useState<{
    [moduloId: number]: {
    status: string;
    dataInicio: string;
      dataFim: string;
      celulasProgresso: {
        [celulaId: number]: {
          presente: boolean;
          horasFeitas: number;
        };
      };
    };
  }>({});

  const formatarData = (data: string | null | undefined): string => {
    if (!data) return 'Não iniciado';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleCelulaChange = (moduloId: number, celulaId: number, presente: boolean) => {
    setModulosStatus((prev: typeof modulosStatus) => {
      const novoStatus = { ...prev };
      if (!novoStatus[moduloId]) {
        novoStatus[moduloId] = {
          status: 'pendente',
          dataInicio: '',
          dataFim: '',
          celulasProgresso: {}
        };
      }
      
      novoStatus[moduloId].celulasProgresso[celulaId] = {
        presente,
        horasFeitas: presente ? 4 : 0
      };

      // Atualizar status do módulo automaticamente
      const modulo = aluno.curso?.modulos?.find((m) => m.id === moduloId);
      if (modulo) {
        const totalCelulas = modulo.celulas?.length || 0;
        const celulasRegistradas = Object.values(novoStatus[moduloId].celulasProgresso).length;
        const celulasPresentes = Object.values(novoStatus[moduloId].celulasProgresso)
          .filter((c: { presente: boolean }) => c.presente).length;

        if (celulasRegistradas === 0) {
          novoStatus[moduloId].status = 'pendente';
        } else if (celulasPresentes === totalCelulas) {
          novoStatus[moduloId].status = 'concluido';
          if (!novoStatus[moduloId].dataFim) {
            novoStatus[moduloId].dataFim = new Date().toISOString().split('T')[0];
          }
        } else if (celulasPresentes > 0) {
          novoStatus[moduloId].status = 'em_progresso';
          if (!novoStatus[moduloId].dataInicio) {
            novoStatus[moduloId].dataInicio = new Date().toISOString().split('T')[0];
          }
        }
      }

      return novoStatus;
    });
  };

  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      setError(null);
      const novoModulosStatus: typeof modulosStatus = {};

      try {
        for (const am of aluno.alunoModulos || []) {
          novoModulosStatus[am.moduloId] = {
            status: am.status || 'pendente',
            dataInicio: am.dataInicio ? new Date(am.dataInicio).toISOString().split('T')[0] : '',
            dataFim: am.dataFim ? new Date(am.dataFim).toISOString().split('T')[0] : '',
            celulasProgresso: {}
          };

          // Carregar presenças para cada célula do módulo
          const response = await fetch(
            `${API_BASE_URL}/api/alunos/${aluno.id}/modulos/${am.moduloId}/presencas`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Erro ao carregar presenças');
          }

          const presencas = await response.json();
          
          // Organizar presenças por célula
          presencas.forEach((presenca: any) => {
            novoModulosStatus[am.moduloId].celulasProgresso[presenca.celulaId] = {
              presente: presenca.presente,
              horasFeitas: presenca.horasFeitas
            };
          });
        }

        setModulosStatus(novoModulosStatus);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [aluno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Preparar os dados para atualização
      const modulosParaAtualizar = Object.entries(modulosStatus).map(([moduloId, moduloData]) => ({
        moduloId: Number(moduloId),
        status: moduloData.status,
        dataInicio: moduloData.dataInicio || null,
        dataFim: moduloData.dataFim || null,
        celulasProgresso: Object.entries(moduloData.celulasProgresso).map(([celulaId, celulaData]) => ({
          celulaId: Number(celulaId),
          presente: celulaData.presente,
          horasFeitas: celulaData.horasFeitas,
          data: new Date().toISOString(),
        })),
      }));

      // Atualizar progresso usando a rota correta
      const response = await fetch(`${API_BASE_URL}/api/alunos/${aluno.id}/progresso`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
        },
        body: JSON.stringify({
          modulosStatus: modulosParaAtualizar,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar progresso');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      setError('Erro ao salvar dados. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Atualizar Progresso</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isSaving}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
        <div className="mb-4">
              <h4 className="font-medium">{aluno.nome}</h4>
          <p className="text-sm text-gray-600">
            Curso: <span className="font-medium">{aluno.curso?.nome}</span>
          </p>
          <p className="text-sm text-gray-600">
                Início do curso: <span className="font-medium">
                  {formatarData(aluno.alunoModulos?.[0]?.dataInicio)}
                </span>
          </p>
        </div>
        
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-6">
            {aluno.curso?.modulos?.filter(modulo => 
              aluno.alunoModulos?.some(am => am.moduloId === modulo.id)
            ).map((modulo) => {
                  const moduloStatus = modulosStatus[modulo.id];
              
              if (!moduloStatus) return null;
              
              return (
                <div key={modulo.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">{modulo.nome}</h5>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`text-sm font-medium ${
                              moduloStatus.status === 'concluido' 
                                ? 'text-green-600' 
                                : moduloStatus.status === 'em_progresso' 
                                  ? 'text-blue-600' 
                                  : 'text-gray-600'
                            }`}>
                              {moduloStatus.status === 'concluido' 
                                ? 'Concluído' 
                                : moduloStatus.status === 'em_progresso' 
                                  ? 'Em Progresso' 
                                  : 'Pendente'}
                            </span>
                      </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Início:</span>
                            <span className="text-sm font-medium">
                              {formatarData(moduloStatus.dataInicio)}
                        </span>
                      </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Término:</span>
                            <span className="text-sm font-medium">
                              {formatarData(moduloStatus.dataFim)}
                            </span>
                    </div>
                      </div>
                      </div>

                      <div className="mt-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Células:</h6>
                        <div className="grid grid-cols-5 gap-4">
                          {modulo.celulas?.map((celula) => {
                            const celulaProgresso = moduloStatus.celulasProgresso[celula.id] || null;

                            return (
                              <div key={celula.id} className="bg-white p-3 rounded border">
                                <div className="flex flex-col space-y-2">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium">{celula.siglaTecnica}</span>
                                    {celulaProgresso && (
                                      <span className="text-xs text-gray-500">
                                        {new Date().toLocaleDateString()}
                                      </span>
                                    )}
                      </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCelulaChange(
                                        modulo.id,
                                        celula.id,
                                        true
                                      )}
                                      disabled={isSaving || celulaProgresso?.presente === true}
                                      className={`flex-1 p-2 rounded flex items-center justify-center transition-colors ${
                                        celulaProgresso?.presente === true
                                          ? 'bg-green-100 text-green-600'
                                          : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                                      } disabled:opacity-50`}
                                      title="Marcar Presença"
                                    >
                                      <CheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCelulaChange(
                                        modulo.id,
                                        celula.id,
                                        false
                                      )}
                                      disabled={isSaving || celulaProgresso?.presente === false}
                                      className={`flex-1 p-2 rounded flex items-center justify-center transition-colors ${
                                        celulaProgresso?.presente === false
                                          ? 'bg-red-100 text-red-600'
                                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                      } disabled:opacity-50`}
                                      title="Marcar Falta"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                    </div>
                                  <div className="text-xs text-center">
                                    {celulaProgresso ? (
                                      celulaProgresso.presente === null ? (
                                        <span className="text-gray-500">Não registrado</span>
                                      ) : (
                                        <span className={`font-medium ${
                                          celulaProgresso.presente ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {celulaProgresso.presente ? 'Presente' : 'Falta'}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn btn-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="btn btn-primary disabled:opacity-50 min-w-[100px]"
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 