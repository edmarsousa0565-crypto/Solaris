import {StrictMode, Component} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40, fontFamily:'monospace', background:'#1C1410', color:'#F4A623', minHeight:'100vh'}}>
          <h2 style={{color:'#ff6b6b', marginBottom:16}}>âŒ Erro de Renderização</h2>
          <pre style={{whiteSpace:'pre-wrap', color:'#fff', fontSize:13}}>{String((this.state.error as any)?.message)}</pre>
          <pre style={{whiteSpace:'pre-wrap', color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:16}}>{String((this.state.error as any)?.stack)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
