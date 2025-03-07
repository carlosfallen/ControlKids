import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { WatchCard } from './WatchCard';
import { showNotification } from '../serviceWorker';

export function WatchList() {
  const children = useStore((state) => state.children);
  const updateTimeLeft = useStore((state) => state.updateTimeLeft);
  const syncTimers = useStore((state) => state.syncTimers);
  
  const notifiedTimers = useRef<Set<string>>(new Set());
  const childrenRef = useRef(children);

  // Update ref when children change
  useEffect(() => {
    childrenRef.current = children;
  }, [children]);

  // Sort children (unchanged)
  const sortedChildren = [...children].sort((a, b) => {
    if (a.timeLeft === 0 && b.timeLeft === 0) return b.priority - a.priority;
    if (a.timeLeft === 0) return 1;
    if (b.timeLeft === 0) return -1;
    return a.timeLeft - b.timeLeft || b.priority - a.priority;
  });

  // Interval effect (no dependency on `children`)
  useEffect(() => {
    syncTimers();
    const intervalId = setInterval(() => {
      syncTimers();
      childrenRef.current.forEach((child) => {
        if (
          child.timeLeft === 0 &&
          !notifiedTimers.current.has(child.id) &&
          !child.isRunning
        ) {
          showNotification(`Tempo esgotado para ${child.name}!`, {
            body: "É hora de encerrar a atividade.",
            icon: '/icon.png',
          });
          notifiedTimers.current.add(child.id);
        }
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [syncTimers]);

  // Event listeners (use a stable syncTimers)
  const stableSyncTimers = useCallback(() => syncTimers(), [syncTimers]);
  useEffect(() => {
    const handleVisibilityChange = () => stableSyncTimers();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', stableSyncTimers);
    window.addEventListener('online', stableSyncTimers);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', stableSyncTimers);
      window.removeEventListener('online', stableSyncTimers);
    };
  }, [stableSyncTimers]);

  // Cleanup notifiedTimers (unchanged)
  useEffect(() => {
    notifiedTimers.current = new Set(
      Array.from(notifiedTimers.current).filter(
        (id) => children.some((child) => 
          child.id === id && child.timeLeft === 0 && !child.isRunning
        )
      )
    );
  }, [children]);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sortedChildren.map((child) => (
          <WatchCard key={child.id} child={child} />
        ))}
      </AnimatePresence>
    </div>
  );
}