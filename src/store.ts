import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Child {
  id: string;
  name: string;
  duration: number;        // Duração total em segundos
  timeLeft: number;        // Tempo restante em segundos
  isRunning: boolean;      // Se o cronômetro está em execução
  startTimestamp: number;  // Timestamp fixo do momento inicial de entrada
  lastResumeTimestamp?: number; // Timestamp da última vez que o timer foi retomado
  endTimestamp?: string;   // Timestamp formatado para exibição de quando o cronômetro deve terminar
  endTimestampRaw?: number; // Timestamp em ms de quando o cronômetro deve terminar
  priority: number;
}

interface Store {
  children: Child[];
  showRegistration: boolean;
  addChild: (name: string, duration: number) => void;
  removeChild: (id: string) => void;
  toggleTimer: (id: string) => void;
  updateTimeLeft: (id: string, timeLeft: number) => void;
  toggleRegistration: () => void;
  syncTimers: () => void;
  addHours: (id: string, additionalHours: number) => void;
}

// Função para formatar timestamp em hora local (HH:MM)
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      children: [],
      showRegistration: false,
      
      addChild: (name, duration) => {
        const now = Date.now();
        const durationInSeconds = duration * 3600; // Converte horas para segundos
        const endTime = now + (durationInSeconds * 1000);
        
        set((state) => ({
          children: [
            ...state.children,
            {
              id: crypto.randomUUID(),
              name,
              duration: durationInSeconds,
              timeLeft: durationInSeconds,
              isRunning: true,
              startTimestamp: now, // Timestamp fixo de entrada
              lastResumeTimestamp: now, // Começamos com o mesmo valor
              endTimestamp: formatTimestamp(endTime),
              endTimestampRaw: endTime,
              priority: state.children.length + 1,
            },
          ],
          showRegistration: false,
        }));
      },
      
      removeChild: (id) =>
        set((state) => ({
          children: state.children.filter((child) => child.id !== id),
        })),
      
      toggleTimer: (id) =>
        set((state) => ({
          children: state.children.map((child) => {
            if (child.id === id) {
              const now = Date.now();
              
              // Se estamos pausando o timer
              if (child.isRunning) {
                // Calcula o tempo restante atual baseado na hora atual
                const currentTimeLeft = child.endTimestampRaw && child.endTimestampRaw > now 
                  ? Math.ceil((child.endTimestampRaw - now) / 1000)
                  : 0;
                
                return {
                  ...child,
                  isRunning: false,
                  timeLeft: currentTimeLeft,
                };
              } 
              // Se estamos retomando o timer
              else {
                // Calcula o novo timestamp de término baseado no tempo restante
                const newEndTimestamp = now + (child.timeLeft * 1000);
                console.log(newEndTimestamp);
                return {
                  ...child,
                  isRunning: true,
                  lastResumeTimestamp: now, // Atualizamos o timestamp de retomada, não o de início
                  endTimestamp: formatTimestamp(newEndTimestamp),
                  endTimestampRaw: newEndTimestamp,
                };
              }
            }
            return child;
          }),
        })),
      
      updateTimeLeft: (id, timeLeft) =>
        set((state) => ({
          children: state.children.map((child) => {
            if (child.id === id) {
              const now = Date.now();
              
              // Se estiver em execução, atualiza também o endTimestamp
              const endTime = child.isRunning 
                ? now + (timeLeft * 1000)
                : child.endTimestampRaw;
              
              return { 
                ...child, 
                timeLeft,
                endTimestamp: endTime ? formatTimestamp(endTime) : child.endTimestamp,
                endTimestampRaw: endTime,
              };
            }
            return child;
          }),
        })),
      
      toggleRegistration: () =>
        set((state) => ({
          showRegistration: !state.showRegistration,
        })),
      
      syncTimers: () => {
        const now = Date.now();
        
        set((state) => ({
          children: state.children.map((child) => {
            // Se o timer não estiver rodando, mantém como está
            if (!child.isRunning) {
              return child;
            }
            
            // Se temos um timestamp de término, calculamos o tempo restante
            if (child.endTimestampRaw) {
              // Se já passou do tempo de término
              if (now >= child.endTimestampRaw) {
                return {
                  ...child,
                  timeLeft: 0,
                  isRunning: false, // Automaticamente para o timer quando termina
                };
              }
              
              // Caso contrário, calcula o tempo restante baseado na hora atual
              const newTimeLeft = Math.ceil((child.endTimestampRaw - now) / 1000);
              
              return {
                ...child,
                timeLeft: newTimeLeft,
              };
            }
            
            return child;
          }),
        }));
      },

      // Nova função para adicionar mais horas a um cronômetro existente
      addHours: (id, additionalHours) => {
        set((state) => ({
          children: state.children.map((child) => {
            if (child.id === id) {
              const now = Date.now();
              
              // Convertemos as horas adicionais para segundos
              const additionalSeconds = additionalHours * 3600;
              
              // Atualizamos o tempo restante
              const newTimeLeft = child.timeLeft + additionalSeconds;
              
              // Atualizamos a duração total
              const newDuration = child.duration + additionalSeconds;
              
              // Calculamos o novo timestamp de término
              let newEndTimestampRaw = child.endTimestampRaw;
              
              // Se o timer estiver rodando, atualizamos o timestamp de término
              if (child.isRunning && child.endTimestampRaw) {
                newEndTimestampRaw = child.endTimestampRaw + (additionalSeconds * 1000);
              } 
              // Se estiver pausado, calculamos baseado no tempo atual
              else if (!child.isRunning) {
                newEndTimestampRaw = now + (newTimeLeft * 1000);
              }

              return {
                ...child,
                timeLeft: newTimeLeft,
                duration: newDuration,
                endTimestamp: newEndTimestampRaw ? formatTimestamp(newEndTimestampRaw) : child.endTimestamp,
                endTimestampRaw: newEndTimestampRaw,
              };
            }
            return child;
          }),
        }));
      },
    }),
    {
      name: 'children-control-storage',
      // Importante: sincronizar ao carregar do storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sincroniza os temporizadores imediatamente após a rehidratação
          setTimeout(() => state.syncTimers(), 0);
        }
      }
    }
  )
);