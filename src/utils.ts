export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [
    hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0'),
  ].filter(Boolean);

  return parts.join(':');
}

// Função para formatar timestamps em hora local (HH:MM)
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
}

// Função para obter a hora de início formatada
export function getFormattedStartTime(startTimestamp?: number): string {
  if (!startTimestamp) return "--:--";
  return formatTimestamp(startTimestamp);
}