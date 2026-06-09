import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BuilderErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Builder node rendering crashed:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border-2 border-dashed border-rose-500 bg-rose-500/5 text-rose-400 rounded-xl my-2 text-center text-xs flex flex-col items-center gap-2">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold">Erreur de rendu de bloc</div>
            <div className="text-[10px] text-rose-500/75 mt-0.5 max-w-md truncate">
              {this.state.error?.message}
            </div>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-semibold transition-colors mt-1"
          >
            Réessayer le rendu
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
