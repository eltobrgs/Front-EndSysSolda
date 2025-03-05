import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 rounded-full hover:bg-gray-100"
      title="Atualizar"
    >
      <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  );
} 