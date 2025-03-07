import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, Trash2 } from 'lucide-react';
import { useStore, Child } from '../store';
import { formatTime, formatTimestamp } from '../utils';
import { useState, useRef, useCallback } from 'react';

// Hook personalizado para detectar pressão longa
const useLongPress = (callback: () => void, ms = 3000) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const start = useCallback(() => {
    isLongPressActive.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onTouchStart: start,
    onMouseDown: start,
    onTouchEnd: stop,
    onMouseUp: stop,
    onMouseLeave: stop
  };
};

interface WatchCardProps {
  child: Child;
}

export function WatchCard({ child }: WatchCardProps) {
  const { toggleTimer, removeChild, addHours } = useStore();
  const progress = (child.timeLeft / (child.duration || 1)) * 100;
  const urgencyColor = child.timeLeft < 1800 && child.timeLeft > 0 
    ? 'bg-orange-500 dark:bg-orange-400' 
    : 'bg-blue-500 dark:bg-blue-400';

  // Calcula se o timer está próximo do fim (menos de 30 min)
  const isNearEnd = child.timeLeft < 1800 && child.timeLeft > 0;
  
  // Determina se o timer está finalizado
  const isFinished = child.timeLeft === 0;

  // Estado para controlar a exibição do seletor de horas adicionais
  const [showAddHours, setShowAddHours] = useState(false);
  const [additionalHours, setAdditionalHours] = useState(1);
  
  // Estado para controlar a exibição do modal de confirmação de remoção
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // LongPress hook para ativar confirmação de exclusão
  const longPressProps = useLongPress(() => {
    setShowDeleteConfirm(true);
  }, 1000);

  // Função para adicionar mais horas
  const handleAddHours = () => {
    addHours(child.id, additionalHours);
    setShowAddHours(false);
  };

  // Função para remover o card
  const handleRemove = () => {
    removeChild(child.id);
  };

  // Opções de horas que podem ser adicionadas
  const hourOptions = [1, 2, 3, 4, 5];

  // Função para garantir formatação consistente
  const formatTimeDisplay = (time: any): string => {
    if (!time) return "--:--";
    
    // Se for um número (timestamp), formata usando a função formatTimestamp
    if (typeof time === 'number') {
      return formatTimestamp(time);
    }
    
    // Se já for uma string formatada, retorna como está
    return time;
  };

  // Se o card estiver finalizado, exibimos uma versão compacta
  if (isFinished) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-lg bg-white p-3 shadow-sm transition-shadow dark:bg-gray-800 border-l-4 border-red-500 dark:border-red-400"
        {...longPressProps}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              {child.name}
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Tempo esgotado
            </span>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`relative rounded-2xl bg-white p-6 shadow-lg transition-shadow dark:bg-gray-800 ${isNearEnd ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''}`}
    {...longPressProps}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {child.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {`Entrada: ${formatTimeDisplay(child.startTimestamp)} - Saída: ${formatTimeDisplay(child.endTimestamp)}`}
        </p>
      </div>
      <div className="flex space-x-2">
        <button onClick={() => setShowAddHours(!showAddHours)} className="ios-button-secondary">
          <Clock className="h-5 w-5" />
        </button>
        <button onClick={() => toggleTimer(child.id)} className="ios-button-secondary">
          {child.isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
      </div>
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
            className={`h-full rounded-full ${urgencyColor}`}
          />
        </div>
      </div>

      {showAddHours && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden"
        >
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Adicionar mais horas
            </p>
            <div className="flex justify-center space-x-2">
              {hourOptions.map((hour) => (
                <motion.button
                  key={hour}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAdditionalHours(hour)}
                  className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                    additionalHours === hour
                      ? 'bg-blue-500 text-white dark:bg-blue-400'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {hour}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <button 
                onClick={handleAddHours}
                className="ios-button-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal de confirmação de exclusão */}  
      <AnimatePresence>
    {showDeleteConfirm && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-2xl 
        bg-black/50 backdrop-blur-2xl backdrop-saturate-150 backdrop-contrast-125
        border border-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300"
        onClick={() => setShowDeleteConfirm(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-64 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-4 text-center text-lg font-medium text-gray-900 dark:text-white">
            Deseja mesmo remover?
          </h3>
          <div className="flex justify-center space-x-3">
            <button
              aria-label="Remover criança"
              onClick={handleRemove}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Sim
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Não
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>


    </motion.div>
  );
}
