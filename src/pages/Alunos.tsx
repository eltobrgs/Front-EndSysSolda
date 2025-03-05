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
    dataTermino: string;
  }[]>(
    (() => {
      // Primeiro, pegamos o curso atual
      const cursoAtual = aluno?.curso || cursos[0] || null;
      
      if (!cursoAtual) return [];

      // Criamos um mapa dos módulos do aluno para fácil acesso
      const alunoModulosMap = new Map(
        aluno?.alunoModulos?.map(am => [
          am.moduloId,
          {
            selecionado: true,
            dataInicio: am.dataInicio ? new Date(am.dataInicio).toISOString().split('T')[0] : '',
            dataTermino: am.dataTermino ? new Date(am.dataTermino).toISOString().split('T')[0] : '',
          }
        ]) || []
      );

      // Retornamos todos os módulos do curso, marcando como selecionados aqueles que o aluno já tem
      return cursoAtual.modulos?.map(modulo => {
        const moduloDoAluno = alunoModulosMap.get(modulo.id);
        return {
          moduloId: modulo.id,
          selecionado: !!moduloDoAluno,
          dataInicio: moduloDoAluno?.dataInicio || '',
          dataTermino: moduloDoAluno?.dataTermino || '',
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
          dataTermino: '',
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
        dataTermino: m.dataTermino || null,
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
                                value={moduloSelecionado?.dataTermino || ''}
                                onChange={(e) =>
                                  handleModuloChange(modulo.id, 'dataTermino', e.target.value)
                                }
                                className="input py-1 px-2 text-sm w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600">{modulo.descricao}</p>
                      
                      {moduloSelecionado?.selecionado && (
                        <div className="mt-2">
                          <h5 className="text-sm font-medium">Aulas:</h5>
                          <ul className="list-disc list-inside text-sm">
                            {modulo.aulas?.map((aula) => (
                              <li key={aula.id} className="flex items-center space-x-2">
                                <span>{aula.nome}</span>
                                <span className="text-gray-500">({aula.cargaHoraria}h)</span>
                                {aula.siglaTecnica && (
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded text-xs">
                                    {aula.siglaTecnica}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
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
  const [modulosStatus, setModulosStatus] = useState<{
    moduloId: number;
    status: string;
    dataInicio: string;
    dataTermino: string;
  }[]>(
    aluno.alunoModulos?.map((am) => ({
      moduloId: am.moduloId,
      status: am.status,
      dataInicio: am.dataInicio ? new Date(am.dataInicio).toISOString().split('T')[0] : '',
      dataTermino: am.dataTermino ? new Date(am.dataTermino).toISOString().split('T')[0] : '',
    })) || []
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleModuloChange = (moduloId: number, field: string, value: string) => {
    setModulosStatus(
      modulosStatus.map((m) =>
        m.moduloId === moduloId ? { ...m, [field]: value } : m
      )
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CONCLUIDO':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-gray-200';
      case 'EM_ANDAMENTO':
        return 'bg-blue-200';
      case 'CONCLUIDO':
        return 'bg-green-200';
      default:
        return 'bg-gray-200';
    }
  };

  const formatarData = (dataString: string | null | undefined) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/alunos/${aluno.id}/progresso`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
          },
          body: JSON.stringify({
            modulosStatus: modulosStatus.map(({ moduloId, status, dataInicio, dataTermino }) => ({
              moduloId,
              status,
              dataInicio: dataInicio || null,
              dataTermino: dataTermino || null,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar progresso');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Atualizar Progresso - {aluno.nome}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Curso: <span className="font-medium">{aluno.curso?.nome}</span>
          </p>
          <p className="text-sm text-gray-600">
            Início do curso: <span className="font-medium">{formatarData(aluno.alunoModulos?.[0]?.dataInicio)}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {aluno.curso?.modulos?.filter(modulo => 
              aluno.alunoModulos?.some(am => am.moduloId === modulo.id)
            ).map((modulo) => {
              const moduloStatus = modulosStatus.find(
                (m) => m.moduloId === modulo.id
              );
              
              if (!moduloStatus) return null;
              
              return (
                <div key={modulo.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h4 className="font-medium">{modulo.nome}</h4>
                        <p className="text-sm text-gray-600">{modulo.descricao}</p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(moduloStatus.status)}`}>
                          {getStatusLabel(moduloStatus.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                      <div>
                        <label htmlFor={`status-${modulo.id}`} className="text-sm text-gray-700">
                          Status
                        </label>
                        <select
                          id={`status-${modulo.id}`}
                          value={moduloStatus.status}
                          onChange={(e) =>
                            handleModuloChange(modulo.id, 'status', e.target.value)
                          }
                          className="input"
                        >
                          <option value="PENDENTE">Pendente</option>
                          <option value="EM_ANDAMENTO">Em Andamento</option>
                          <option value="CONCLUIDO">Concluído</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`inicio-${modulo.id}`} className="text-sm text-gray-700">
                          Data de Início
                        </label>
                        <input
                          type="date"
                          id={`inicio-${modulo.id}`}
                          value={moduloStatus.dataInicio}
                          onChange={(e) =>
                            handleModuloChange(modulo.id, 'dataInicio', e.target.value)
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label htmlFor={`termino-${modulo.id}`} className="text-sm text-gray-700">
                          Data de Término
                        </label>
                        <input
                          type="date"
                          id={`termino-${modulo.id}`}
                          value={moduloStatus.dataTermino}
                          onChange={(e) =>
                            handleModuloChange(modulo.id, 'dataTermino', e.target.value)
                          }
                          className="input"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h5 className="text-sm font-medium">Aulas:</h5>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {modulo.aulas?.map((aula) => (
                          <li key={aula.id} className="flex items-center space-x-2">
                            <span>{aula.nome}</span>
                            <span className="text-gray-500">({aula.cargaHoraria}h)</span>
                            {aula.siglaTecnica && (
                              <span className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded text-xs">
                                {aula.siglaTecnica}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn btn-secondary w-full sm:w-auto disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
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