import ReactDOM from 'react-dom/client';
import App from './App';
import { register } from './serviceWorker'; // Importe do arquivo correto
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);

register();