import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Curso } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NovoModulo {
  id: number;
  nome: string;
  descricao: string;
  aulas: NovaAula[];
}

interface NovaAula {
  id: number;
  nome: string;
  descricao: string;
  cargaHoraria: number;
  siglaTecnica: string;
}

export function Cursos() {
  const [showModal, setShowModal] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const { data: cursos, fetchData: fetchCursos } = useFetch<Curso[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCursos('/api/cursos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchCursos]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await fetch(`http://localhost:3000/api/cursos/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
          },
        });
        fetchCursos('/api/cursos');
      } catch (error) {
        console.error('Erro ao excluir curso:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Cursos</h1>
        <button
          onClick={() => {
            setEditingCurso(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Curso
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos?.map((curso) => (
          <div
            key={curso.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">
                  {curso.nome}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingCurso(curso);
                      setShowModal(true);
                    }}
                    className="p-1 text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(curso.id)}
                    className="p-1 text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{curso.descricao}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Carga Horária:</span>
                  <span className="font-medium">{curso.cargaHorariaTotal}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Módulos:</span>
                  <span className="font-medium">
                    {curso.modulos?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Alunos:</span>
                  <span className="font-medium">{curso.alunos?.length || 0}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Módulos:</h3>
                <div className="space-y-2">
                  {curso.modulos?.map((modulo) => (
                    <div key={modulo.id} className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium">{modulo.nome}</h4>
                      <p className="text-sm text-gray-600">{modulo.descricao}</p>
                      <div className="mt-2">
                        <h5 className="text-xs font-medium text-gray-700">Aulas:</h5>
                        <ul className="list-disc list-inside text-sm">
                          {modulo.aulas?.map((aula) => (
                            <li key={aula.id}>{aula.nome}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CursoModal
          curso={editingCurso}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchCursos('/api/cursos');
          }}
        />
      )}
    </div>
  );
}

interface CursoModalProps {
  curso: Curso | null;
  onClose: () => void;
  onSave: () => void;
}

function CursoModal({ curso, onClose, onSave }: CursoModalProps) {
  const [formData, setFormData] = useState({
    nome: curso?.nome || '',
    descricao: curso?.descricao || '',
    cargaHorariaTotal: curso?.cargaHorariaTotal || 0,
    preRequisitos: curso?.preRequisitos || '',
    materialNecessario: curso?.materialNecessario || '',
    modulos: (curso?.modulos || []).map(m => ({
      id: m.id,
      nome: m.nome,
      descricao: m.descricao,
      aulas: m.aulas?.map(a => ({
        id: a.id,
        nome: a.nome,
        descricao: a.descricao,
        cargaHoraria: a.cargaHoraria,
        siglaTecnica: a.siglaTecnica
      })) || []
    })) as NovoModulo[],
  });

  const [novoModulo, setNovoModulo] = useState<Omit<NovoModulo, 'id'>>({
    nome: '',
    descricao: '',
    aulas: [],
  });

  const [novaAula, setNovaAula] = useState<Omit<NovaAula, 'id'>>({
    nome: '',
    descricao: '',
    cargaHoraria: 0,
    siglaTecnica: '',
  });

  const [moduloEditandoIndex, setModuloEditandoIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = curso
      ? `http://localhost:3000/api/cursos/${curso.id}`
      : 'http://localhost:3000/api/cursos';
    const method = curso ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar curso');
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
    }
  };

  const adicionarModulo = () => {
    if (novoModulo.nome && novoModulo.descricao) {
      setFormData({
        ...formData,
        modulos: [...formData.modulos, { ...novoModulo, id: Date.now(), aulas: [] }],
      });
      setNovoModulo({ nome: '', descricao: '', aulas: [] });
    }
  };

  const removerModulo = (index: number) => {
    const novosModulos = [...formData.modulos];
    novosModulos.splice(index, 1);
    setFormData({ ...formData, modulos: novosModulos });
  };

  const adicionarAula = (moduloIndex: number) => {
    if (novaAula.nome && novaAula.descricao && novaAula.cargaHoraria > 0) {
      const novosModulos = [...formData.modulos];
      novosModulos[moduloIndex].aulas = [
        ...(novosModulos[moduloIndex].aulas || []),
        { ...novaAula, id: Date.now() },
      ];
      setFormData({ ...formData, modulos: novosModulos });
      setNovaAula({ nome: '', descricao: '', cargaHoraria: 0, siglaTecnica: '' });
    }
  };

  const removerAula = (moduloIndex: number, aulaIndex: number) => {
    const novosModulos = [...formData.modulos];
    if (novosModulos[moduloIndex].aulas) {
      novosModulos[moduloIndex].aulas.splice(aulaIndex, 1);
      setFormData({ ...formData, modulos: novosModulos });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {curso ? 'Editar Curso' : 'Novo Curso'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
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
              <label htmlFor="cargaHorariaTotal" className="label">
                Carga Horária Total (horas)
              </label>
              <input
                type="number"
                id="cargaHorariaTotal"
                className="input"
                value={formData.cargaHorariaTotal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cargaHorariaTotal: Number(e.target.value),
                  })
                }
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="descricao" className="label">Descrição</label>
            <textarea
              id="descricao"
              className="input"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preRequisitos" className="label">Pré-requisitos</label>
              <textarea
                id="preRequisitos"
                className="input"
                value={formData.preRequisitos}
                onChange={(e) => setFormData({ ...formData, preRequisitos: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label htmlFor="materialNecessario" className="label">
                Material Necessário
              </label>
              <textarea
                id="materialNecessario"
                className="input"
                value={formData.materialNecessario}
                onChange={(e) => setFormData({ ...formData, materialNecessario: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Módulos</h3>
            
            <div className="space-y-4">
              {formData.modulos.map((modulo, moduloIndex) => (
                <div key={modulo.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{modulo.nome}</h4>
                    <button
                      type="button"
                      onClick={() => removerModulo(moduloIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{modulo.descricao}</p>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Aulas</h5>
                    {modulo.aulas.map((aula, aulaIndex) => (
                      <div key={aula.id} className="flex justify-between items-center bg-white p-2 rounded">
                        <div className="flex-1 mr-2">
                          <span className="font-medium">{aula.nome}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({aula.cargaHoraria}h)
                          </span>
                          {aula.siglaTecnica && (
                            <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded text-sm">
                              {aula.siglaTecnica}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removerAula(moduloIndex, aulaIndex)}
                          className="text-red-600 hover:text-red-900 flex-shrink-0"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {moduloEditandoIndex === moduloIndex && (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Nome da aula"
                          className="input"
                          value={novaAula.nome}
                          onChange={(e) =>
                            setNovaAula({ ...novaAula, nome: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Descrição da aula"
                          className="input"
                          value={novaAula.descricao}
                          onChange={(e) =>
                            setNovaAula({ ...novaAula, descricao: e.target.value })
                          }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Carga horária"
                            className="input"
                            value={novaAula.cargaHoraria}
                            onChange={(e) =>
                              setNovaAula({
                                ...novaAula,
                                cargaHoraria: Number(e.target.value),
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Sigla Técnica (ex: 1F, 2G)"
                            className="input"
                            value={novaAula.siglaTecnica}
                            onChange={(e) =>
                              setNovaAula({
                                ...novaAula,
                                siglaTecnica: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            adicionarAula(moduloIndex);
                            setModuloEditandoIndex(null);
                          }}
                          className="btn btn-secondary whitespace-nowrap w-full"
                        >
                          Adicionar Aula
                        </button>
                      </div>
                    )}

                    {moduloEditandoIndex !== moduloIndex && (
                      <button
                        type="button"
                        onClick={() => setModuloEditandoIndex(moduloIndex)}
                        className="btn btn-secondary btn-sm mt-2"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Adicionar Aula
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 sm:p-4 border border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium mb-2">Novo Módulo</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nome do módulo"
                    className="input"
                    value={novoModulo.nome}
                    onChange={(e) =>
                      setNovoModulo({ ...novoModulo, nome: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Descrição do módulo"
                    className="input"
                    value={novoModulo.descricao}
                    onChange={(e) =>
                      setNovoModulo({ ...novoModulo, descricao: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={adicionarModulo}
                    className="btn btn-secondary w-full sm:w-auto"
                  >
                    Adicionar Módulo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 