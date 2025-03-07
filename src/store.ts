import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Child {
  id: string;
  name: string;
  duration: number;        // Duração total em segundos
  timeLeft: number;        // Tempo restante em segundos
  isRunning: boolean;      // Se o cronômetro está em execução
  startTimestamp?: number; // Timestamp do momento em que o cronômetro começou ou foi retomado
  endTimestamp?: number;   // Timestamp calculado quando o cronômetro deve terminar
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
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      children: [],
      showRegistration: false,
      
      addChild: (name, duration) => {
        const now = Date.now();
        const durationInSeconds = duration * 3600; // Converte horas para segundos
        
        set((state) => ({
          children: [
            ...state.children,
            {
              id: crypto.randomUUID(),
              name,
              duration: durationInSeconds,
              timeLeft: durationInSeconds,
              isRunning: true,
              startTimestamp: now,
              endTimestamp: now + (durationInSeconds * 1000), // Calcula quando deve terminar
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
                const currentTimeLeft = child.endTimestamp && child.endTimestamp > now 
                  ? Math.ceil((child.endTimestamp - now) / 1000)
                  : 0;
                
                return {
                  ...child,
                  isRunning: false,
                  startTimestamp: undefined,
                  endTimestamp: undefined,
                  timeLeft: currentTimeLeft,
                };
              } 
              // Se estamos retomando o timer
              else {
                // Calcula o novo timestamp de término baseado no tempo restante
                const newEndTimestamp = now + (child.timeLeft * 1000);
                
                return {
                  ...child,
                  isRunning: true,
                  startTimestamp: now,
                  endTimestamp: newEndTimestamp,
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
              const endTimestamp = child.isRunning 
                ? now + (timeLeft * 1000)
                : undefined;
              
              return { 
                ...child, 
                timeLeft,
                endTimestamp,
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
            if (child.endTimestamp) {
              // Se já passou do tempo de término
              if (now >= child.endTimestamp) {
                return {
                  ...child,
                  timeLeft: 0,
                  isRunning: false, // Automaticamente para o timer quando termina
                  startTimestamp: undefined,
                  endTimestamp: undefined,
                };
              }
              
              // Caso contrário, calcula o tempo restante baseado na hora atual
              const newTimeLeft = Math.ceil((child.endTimestamp - now) / 1000);
              
              return {
                ...child,
                timeLeft: newTimeLeft,
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