import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Curso, API_BASE_URL, NovoModulo, Celula } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { RefreshButton } from '../components/RefreshButton';

export function Cursos() {
  const [showModal, setShowModal] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const { data: cursos, fetchData: fetchCursos } = useFetch<Curso[]>();
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

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
        setIsDeleting(id);
        await fetch(`${API_BASE_URL}/api/cursos/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('@SysSolda:token')}`,
          },
        });
        fetchCursos('/api/cursos');
      } catch (error) {
        console.error('Erro ao excluir curso:', error);
      } finally {
        setIsDeleting(null);
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
        <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-semibold text-gray-900">Cursos</h1>
          <RefreshButton onClick={() => fetchCursos('/api/cursos')} isLoading={loading} />
        </div>
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
                    className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
                    disabled={isDeleting === curso.id}
                  >
                    {isDeleting === curso.id ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
                    <TrashIcon className="w-5 h-5" />
                    )}
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
                        <h5 className="text-xs font-medium text-gray-700">Células:</h5>
                        <ul className="list-disc list-inside text-sm">
                          {modulo.celulas?.map((celula) => (
                            <li key={celula.id}>Célula {celula.ordem} - {celula.siglaTecnica}</li>
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
      celulas: m.celulas?.map(c => ({
        id: c.id,
        ordem: c.ordem,
        siglaTecnica: c.siglaTecnica
      })) || [],
      cargaHorariaTotal: m.cargaHorariaTotal
    })) as NovoModulo[],
  });

  const [novoModulo, setNovoModulo] = useState<NovoModulo>({
    nome: '',
    descricao: '',
    numeroCelulas: 1,
    siglaTecnica: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingModulo, setIsAddingModulo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const url = curso
      ? `${API_BASE_URL}/api/cursos/${curso.id}`
      : `${API_BASE_URL}/api/cursos`;
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
    } finally {
      setIsSaving(false);
    }
  };

  const adicionarModulo = () => {
    if (!novoModulo.nome || !novoModulo.descricao || !novoModulo.numeroCelulas || !novoModulo.siglaTecnica) {
      return;
    }

    const numCelulas = Number(novoModulo.numeroCelulas);
    const siglaTecnica = String(novoModulo.siglaTecnica);
    
    if (numCelulas < 1) {
      return;
    }

    setIsAddingModulo(true);
    try {
      // Criar células baseado no número informado
      const celulas: Celula[] = Array.from({ length: numCelulas }, (_, index) => ({
        id: Date.now() + index,
        ordem: index + 1,
        siglaTecnica
      }));

      setFormData({
        ...formData,
        modulos: [
          ...formData.modulos,
          {
            ...novoModulo,
            id: Date.now(),
            celulas,
            cargaHorariaTotal: numCelulas * 2 // Cada célula = 2 horas
          }
        ],
      });
      setNovoModulo({ nome: '', descricao: '', numeroCelulas: 1, siglaTecnica: '' });
    } finally {
      setIsAddingModulo(false);
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
                <div key={modulo.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                    <h4 className="font-medium">{modulo.nome}</h4>
                      <p className="text-sm text-gray-600">{modulo.descricao}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          modulos: formData.modulos.filter((_, i) => i !== moduloIndex),
                        });
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mt-4">
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
              ))}

              <div className="mt-4 p-3 sm:p-4 border border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium mb-2">Novo Módulo</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nome do módulo"
                    className="input"
                    value={novoModulo.nome}
                    onChange={(e) => setNovoModulo({ ...novoModulo, nome: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Descrição do módulo"
                    className="input"
                    value={novoModulo.descricao}
                    onChange={(e) => setNovoModulo({ ...novoModulo, descricao: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="numeroCelulas" className="label">Número de Células</label>
                      <input
                        type="number"
                        id="numeroCelulas"
                        className="input"
                        value={novoModulo.numeroCelulas}
                        onChange={(e) => setNovoModulo({ ...novoModulo, numeroCelulas: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div>
                      <label htmlFor="siglaTecnica" className="label">Sigla Técnica</label>
                      <input
                        type="text"
                        id="siglaTecnica"
                        className="input"
                        value={novoModulo.siglaTecnica}
                        onChange={(e) => setNovoModulo({ ...novoModulo, siglaTecnica: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={adicionarModulo}
                    className="btn btn-secondary w-full sm:w-auto disabled:opacity-50"
                    disabled={isAddingModulo || !novoModulo.nome || !novoModulo.descricao || (novoModulo.numeroCelulas || 0) <= 0 || !novoModulo.siglaTecnica}
                  >
                    {isAddingModulo ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                    ) : (
                      'Adicionar Módulo'
                    )}
                  </button>
                </div>
              </div>
            </div>
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