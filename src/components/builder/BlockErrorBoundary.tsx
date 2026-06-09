import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  blockId: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BlockErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[BlockErrorBoundary] Crash in block ${this.props.blockId}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border-2 border-red-200 border-dashed rounded-md text-red-600 m-2 flex flex-col gap-2 items-center justify-center min-h-[100px]">
          <span className="font-semibold text-sm">⚠️ Erreur de rendu (Bloc {this.props.blockId})</span>
          <span className="text-xs text-red-400">{this.state.error?.message}</span>
        </div>
      );
    }

    return this.props.children;
  }
}
