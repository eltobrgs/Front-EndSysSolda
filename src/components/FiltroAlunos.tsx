import { useState, useEffect } from 'react';
import { Curso } from '../types';

interface FiltroAlunosProps {
  cursos: Curso[];
  onFiltroChange: (filtros: {
    cursoId: number | null;
    moduloId: number | null;
    nomeAluno: string;
  }) => void;
}

export function FiltroAlunos({ cursos, onFiltroChange }: FiltroAlunosProps) {
  const [cursoSelecionado, setCursoSelecionado] = useState<number | null>(null);
  const [moduloSelecionado, setModuloSelecionado] = useState<number | null>(null);
  const [nomeAluno, setNomeAluno] = useState('');

  // Reset módulo quando curso muda
  useEffect(() => {
    setModuloSelecionado(null);
  }, [cursoSelecionado]);

  // Atualiza os filtros quando qualquer valor muda
  useEffect(() => {
    onFiltroChange({
      cursoId: cursoSelecionado,
      moduloId: moduloSelecionado,
      nomeAluno: nomeAluno.trim(),
    });
  }, [cursoSelecionado, moduloSelecionado, nomeAluno, onFiltroChange]);

  const cursoAtual = cursos.find(c => c.id === cursoSelecionado);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Aluno
          </label>
          <input
            type="text"
            id="nome"
            className="input w-full"
            placeholder="Digite o nome do aluno"
            value={nomeAluno}
            onChange={(e) => setNomeAluno(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="curso" className="block text-sm font-medium text-gray-700 mb-1">
            Curso
          </label>
          <select
            id="curso"
            className="input w-full"
            value={cursoSelecionado || ''}
            onChange={(e) => setCursoSelecionado(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todos os cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modulo" className="block text-sm font-medium text-gray-700 mb-1">
            Módulo
          </label>
          <select
            id="modulo"
            className="input w-full"
            value={moduloSelecionado || ''}
            onChange={(e) => setModuloSelecionado(e.target.value ? Number(e.target.value) : null)}
            disabled={!cursoSelecionado}
          >
            <option value="">Todos os módulos</option>
            {cursoAtual?.modulos?.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setCursoSelecionado(null);
            setModuloSelecionado(null);
            setNomeAluno('');
          }}
          className="text-sm text-primary-600 hover:text-primary-900"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
} 