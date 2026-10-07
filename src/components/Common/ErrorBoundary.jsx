import React from 'react';
import i18n from "../../i18n";


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
          <h2 className="text-2xl font-bold mb-4">{i18n.t("errorBoundary:quelque_chose_s_est_mal_passe")}</h2>
          <p className="mb-4">{String(this.state.error)}</p>
          <p>{i18n.t("errorBoundary:recharge_la_page_ou_contacte_le")}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
