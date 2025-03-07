import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { TimePicker } from './TimePicker';

export function RegistrationCard() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(1);
  const { addChild, showRegistration, toggleRegistration } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addChild(name.trim(), duration);
      setName('');
      setDuration(1);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleRegistration}
        className={`ios-button-primary mb-4 flex w-full items-center justify-center space-x-2 ${
          showRegistration ? 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500' : ''
        }`}
      >
        {showRegistration ? (
          <>
            <X className="h-5 w-5" />
            <span>Cancelar</span>
          </>
        ) : (
          <>
            <Plus className="h-5 w-5" />
            <span>Adicionar Criança</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {showRegistration && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl bg-white shadow-lg dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da criança"
                  className="ios-input text-white"
                  required
                />
                </div>
                <TimePicker value={duration} onChange={setDuration} />
                <button type="submit" className="ios-button-primary mt-4 w-full">
                  Adicionar
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}