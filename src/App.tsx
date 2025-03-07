import { useEffect } from 'react';
import { Baby } from 'lucide-react';
import { Header } from './components/Header';
import { RegistrationCard } from './components/RegistrationCard';
import { WatchList } from './components/WatchList';
import { useStore } from './store';

function App() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  useEffect(() => {
    // Set correct viewport height for mobile browsers
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <div className={`h-full bg-gray-50 transition-colors dark:bg-gray-900 ${isDark ? 'dark' : ''}`}>
      <Header icon={Baby} title="Controle Infantil" />
      <main className="container mx-auto max-w-lg px-4 pb-safe pt-20">
        <RegistrationCard />
        <WatchList />
      </main>
    </div>
  );
}

export default App;