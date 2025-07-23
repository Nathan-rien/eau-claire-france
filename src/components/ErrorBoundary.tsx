import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to external service if needed
    this.props.onError?.(error, errorInfo);
    
    // Log to console with structured data for debugging
    console.group('🚨 Application Error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
    
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;

      return (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Une erreur est survenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nous sommes désolés, une erreur inattendue s'est produite. 
              Vous pouvez essayer de recharger la page ou contacter le support si le problème persiste.
            </p>
            
            {isDevelopment && this.state.error && (
              <details className="bg-muted p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Détails de l'erreur (développement)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Message:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button onClick={this.handleRetry} className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Réessayer</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;