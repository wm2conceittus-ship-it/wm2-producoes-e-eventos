import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('wm2_graduation_state');
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-neutral-800 border border-neutral-700 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold mb-2">Ops! Algo deu errado ao carregar</h1>
            <p className="text-neutral-400 text-sm mb-6">
              Ocorreu uma falha ao exibir os dados. Clique abaixo para restaurar as configurações iniciais do sistema.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-[#aa904f] hover:bg-[#8f7840] text-neutral-950 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar e Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
