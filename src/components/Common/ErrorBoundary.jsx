import React from 'react';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    // console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quelque chose s'est mal passé.</h2>
          <p className="mb-4">{String(this.state.error)}</p>
          <p>Recharge la page ou contacte le développeur si le problème persiste.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
