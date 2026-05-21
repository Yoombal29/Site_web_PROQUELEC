
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);

    // Protection contre les boucles de crash (ex: state corrompu en localstorage)
    const crashCount = parseInt(sessionStorage.getItem('app_crash_count') || '0');
    sessionStorage.setItem('app_crash_count', (crashCount + 1).toString());

    if (crashCount >= 2) {
      console.warn("Crash répétitif détecté. Suggestion de réinitialisation du cache.");
    }
  }

  private handleReset = () => {
    sessionStorage.removeItem('app_crash_count');
    localStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Une erreur est survenue
              </h1>
              <p className="text-gray-600">
                Nous nous excusons pour ce désagrément. L'application a rencontré une erreur inattendue.
              </p>
            </div>

            {this.state.error &&
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-medium mb-2">Détails de l'erreur :</h3>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack &&
                <>
                      {'\n'}
                      {this.state.error.stack}
                    </>
                }
                </pre>
              </div>
            }

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-proqblue hover:bg-proqblue-dark">
                
                <RefreshCw className="mr-2 h-4 w-4" />
                Recharger la page
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}>
                
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>

              {parseInt(typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('app_crash_count') || '0' : '0') >= 2 &&
              <Button
                variant="destructive"
                onClick={this.handleReset}
                className="mt-4 sm:mt-0">
                
                  <Trash2 className="mr-2 h-4 w-4" />
                  Réinitialisation d'urgence
                </Button>
              }
            </div>
          </div>
        </div>);

    }

    return this.props.children;
  }
}