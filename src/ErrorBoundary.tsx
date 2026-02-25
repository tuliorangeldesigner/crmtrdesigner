import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    handleReload = () => {
        if (typeof window === 'undefined') return;
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', background: '#e74c3c', color: 'white', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h2>Poxa, uma tela branca aconteceu por causa deste erro interno:</h2>
                    <br />
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#c0392b', padding: '1rem', borderRadius: '8px' }}>{this.state.error?.toString()}</pre>
                    <br />
                    <details>
                        <summary>Ver mais detalhes para o programador Antigravity</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', color: '#ffcbcb' }}>{this.state.error?.stack}</pre>
                    </details>
                    <br />
                    <button
                        onClick={this.handleReload}
                        style={{
                            marginTop: '8px',
                            background: '#111',
                            color: '#fff',
                            border: '1px solid #fff',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            cursor: 'pointer'
                        }}
                    >
                        Recarregar CRM
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
