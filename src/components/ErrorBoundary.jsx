// src/components/ErrorBoundary.jsx

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para exibir a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Loga o erro para serviços de monitoramento se necessário
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2 className="text-2xl text-red-500">Ocorreu um erro.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
