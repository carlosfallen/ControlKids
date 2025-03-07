import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useStore, Child } from '../store';
import { formatTime } from '../utils';

interface WatchCardProps {
  child: Child;
}

export function WatchCard({ child }: WatchCardProps) {
  const { toggleTimer, removeChild } = useStore();
  const progress = (child.timeLeft / (child.duration || 1)) * 100;
  const urgencyColor = child.timeLeft < 1800 && child.timeLeft > 0 
    ? 'bg-orange-500 dark:bg-orange-400' 
    : 'bg-blue-500 dark:bg-blue-400';

  // Calcula se o timer está próximo do fim (menos de 30 min)
  const isNearEnd = child.timeLeft < 1800 && child.timeLeft > 0;
  
  // Determina se o timer está finalizado
  const isFinished = child.timeLeft === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl bg-white p-6 shadow-lg transition-shadow dark:bg-gray-800 ${
        isNearEnd ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''
      } ${isFinished ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {child.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
          {`Entrada: ${child.startTimestamp} - Saida: ${child.endTimestamp}`}
          </p>
        </div>
        {!isFinished && (
          <button
            onClick={() => toggleTimer(child.id)}
            className="ios-button-secondary"
          >
            {child.isRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            {formatTime(child.timeLeft)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${urgencyColor} ${isFinished ? 'bg-red-500 dark:bg-red-400' : ''}`}
          />
        </div>
      </div>

      {isFinished && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => removeChild(child.id)}
            className="ios-button-primary bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500"
          >
            Limpar
          </button>
        </div>
      )}
    </motion.div>
  );
}