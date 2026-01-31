# devopsakademy-frontend
Frontend application for DevOpsAkademy. Built with modern frontend stack, integrated with a documented and tested REST API. Focus on quality, non-regression and production readiness.

## 🚀 CI/CD – Frontend Deployment

This frontend application is automatically built and deployed using **GitHub Actions**.

### 🔁 Workflow
- Triggered on every push to the `develop` branch
- Runs linting, tests, and production build
- Deploys the compiled frontend (`dist/`) directly to an **Apache2 server**

### 🛠 Stack
- GitHub Actions
- Node.js 20
- Vite
- Apache2
- SCP + SSH deployment

### 📂 Deployment Target

