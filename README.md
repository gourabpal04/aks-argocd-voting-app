# DevOps Project: 3-Tier Microservice Voting App

## 🎯 Project Overview

This project demonstrates a **production-ready 3-tier microservice-based Voting App** deployed using **Azure DevOps CI/CD pipelines**, **Azure Kubernetes Service (AKS)**, and **ArgoCD GitOps workflows**. It showcases modern DevOps practices including containerization, microservices architecture, continuous integration/deployment, and GitOps.

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    3-Tier Microservice Architecture                 │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 1: Presentation Layer (Frontend)                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React.js Application                                        │   │
│  │  • Modern UI with Tailwind CSS                               │   │
│  │  • Responsive design                                         │   │
│  │  • Real-time results                                         │   │
│  │  • Vote casting interface                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 2: Application Layer (Backend)                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  FastAPI Backend Service                                     │   │
│  │  • RESTful API endpoints                                     │   │
│  │  • Vote processing logic                                     │   │
│  │  • Data validation                                           │   │
│  │  • Authentication & authorization                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 3: Data Layer (Database)                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MongoDB Database                                            │   │
│  │  • Poll storage                                              │   │
│  │  • Vote records                                              │   │
│  │  • User sessions                                             │   │
│  │  • Real-time aggregation                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### Application Features
- **Create Polls**: Interactive poll creation with multiple options
- **Cast Votes**: Secure voting system with IP-based validation
- **Real-time Results**: Live vote counting and percentage calculations
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Poll Management**: Create, view, and manage polls

### DevOps Features
- **Containerization**: Docker containers for each service
- **Microservices**: Independent, scalable services
- **CI/CD Pipelines**: Azure DevOps automated pipelines
- **GitOps**: ArgoCD for continuous deployment
- **Infrastructure as Code**: Kubernetes manifests
- **Monitoring**: Health checks and observability
- **Security**: Container scanning and security policies

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React.js, Tailwind CSS | User interface and experience |
| **Backend** | FastAPI, Python | API services and business logic |
| **Database** | MongoDB | Data persistence and storage |
| **Container** | Docker | Application containerization |
| **Orchestration** | Kubernetes (AKS) | Container orchestration |
| **CI/CD** | Azure DevOps | Continuous integration/deployment |
| **GitOps** | ArgoCD | Declarative deployment |
| **Monitoring** | Prometheus, Grafana | Observability and metrics |

## 📁 Project Structure

```
aks-argocd-voting-app/
├── frontend/                   # React application (Tier 1)
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Application pages
│   │   └── services/           # API services
│   ├── Dockerfile             # Frontend container
│   └── package.json           # Dependencies
├── backend/                   # FastAPI application (Tier 2)
│   ├── app/
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   └── main.py            # Application entry
│   ├── Dockerfile             # Backend container
│   └── requirements.txt       # Python dependencies
├── database/                  # MongoDB configuration (Tier 3)
│   └── init.js               # Database initialization
├── k8s/                      # Kubernetes manifests
│   └── base/                 # Base configurations
│       ├── namespace.yaml    # Namespace definition
│       ├── mongo.yaml        # Database deployment
│       ├── backend.yaml      # Backend deployment
│       ├── frontend.yaml     # Frontend deployment
│       └── ingress.yaml      # Load balancer
├── argocd/                   # ArgoCD GitOps
│   ├── project.yaml          # ArgoCD project
│   └── app.yaml              # Application definition
├── .azure-pipelines/         # CI/CD pipelines
│   ├── frontend-pipeline.yml # Frontend pipeline
│   ├── backend-pipeline.yml  # Backend pipeline
│   └── shared-steps.yml      # Shared pipeline steps
├── scripts/                  # Deployment scripts
│   ├── deploy-local.sh       # Local deployment
│   └── k8s-deploy.sh         # Kubernetes deployment
├── docker-compose.yml        # Local development
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- kubectl (for Kubernetes deployment)
- Azure CLI (for AKS deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/aks-argocd-voting-app.git
   cd aks-argocd-voting-app
   ```

2. **Start with Docker Compose**
   ```bash
   chmod +x scripts/deploy-local.sh
   ./scripts/deploy-local.sh up
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

4. **View logs**
   ```bash
   ./scripts/deploy-local.sh logs
   ```

### Kubernetes Deployment

1. **Deploy to Kubernetes**
   ```bash
   chmod +x scripts/k8s-deploy.sh
   ./scripts/k8s-deploy.sh deploy
   ```

2. **Setup ArgoCD**
   ```bash
   ./scripts/k8s-deploy.sh argocd
   ```

3. **Check deployment status**
   ```bash
   ./scripts/k8s-deploy.sh status
   ```

## 🔄 CI/CD Pipeline

### Azure DevOps Pipeline Features

- **Frontend Pipeline** (`frontend-pipeline.yml`)
  - Code linting and testing
  - Docker image build and push
  - Kubernetes deployment
  - Health checks

- **Backend Pipeline** (`backend-pipeline.yml`)
  - Code quality checks (Black, Flake8)
  - Security scanning (Bandit, Safety)
  - Unit and integration tests
  - Docker image build and push
  - Database migrations
  - API health checks

### Pipeline Stages

1. **Build & Test**
   - Code quality checks
   - Security scans
   - Unit tests
   - Container image build

2. **Deploy**
   - Kubernetes deployment
   - GitOps sync
   - Health verification

3. **Post-Deploy**
   - Integration tests
   - Performance tests
   - Notifications

## 🔧 GitOps with ArgoCD

### ArgoCD Configuration

- **Project**: `voting-app-project` - Defines access controls and policies
- **Application**: `voting-app` - Manages the deployment lifecycle
- **Sync Policy**: Automated sync with self-healing enabled
- **Health Checks**: Custom health checks for all services

### Deployment Flow

1. Code changes pushed to Git
2. Azure DevOps builds and pushes container images
3. Pipeline updates Kubernetes manifests
4. ArgoCD detects changes and syncs
5. Application deployed to AKS

## 📊 Monitoring & Observability

### Health Checks

- **Frontend**: HTTP health endpoint
- **Backend**: `/api/health` endpoint with database connectivity
- **Database**: MongoDB ping command

### Metrics & Monitoring

- Kubernetes resource metrics
- Application performance metrics
- Custom business metrics (votes, polls)
- Log aggregation and analysis

## 🔒 Security

### Container Security

- Non-root user containers
- Security scanning with Trivy/Aqua
- Minimal base images
- Regular updates

### Kubernetes Security

- Network policies
- Pod security policies
- RBAC (Role-Based Access Control)
- Secrets management

### Application Security

- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## 🎯 DevOps Best Practices Demonstrated

1. **Infrastructure as Code**: All infrastructure defined in code
2. **GitOps**: Declarative deployments with ArgoCD
3. **Microservices**: Loosely coupled, independently deployable services
4. **Continuous Integration**: Automated testing and builds
5. **Continuous Deployment**: Automated deployments with rollback capability
6. **Monitoring**: Comprehensive observability and alerting
7. **Security**: Security scanning and best practices
8. **Scalability**: Horizontal pod autoscaling

## 🚀 Deployment Scenarios

### Scenario 1: Local Development

```bash
# Start local environment
./scripts/deploy-local.sh up

# View logs
./scripts/deploy-local.sh logs

# Stop services
./scripts/deploy-local.sh down
```

### Scenario 2: Kubernetes Cluster

```bash
# Deploy to K8s
./scripts/k8s-deploy.sh deploy

# Setup ArgoCD
./scripts/k8s-deploy.sh argocd

# Check status
./scripts/k8s-deploy.sh status
```

### Scenario 3: Azure Kubernetes Service (AKS)

```bash
# Create AKS cluster
az aks create --resource-group voting-app-rg --name voting-app-aks

# Get credentials
az aks get-credentials --resource-group voting-app-rg --name voting-app-aks

# Deploy application
./scripts/k8s-deploy.sh deploy
```

## 🧪 Testing

### Local Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test

# Integration tests
./scripts/test-integration.sh
```

### Production Testing

- Health check endpoints
- Load testing with k6
- End-to-end testing
- Performance monitoring

## 📈 Scaling

### Horizontal Pod Autoscaling

```yaml
# HPA configuration included in manifests
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
```

### Manual Scaling

```bash
# Scale frontend
./scripts/k8s-deploy.sh scale frontend 5

# Scale backend
./scripts/k8s-deploy.sh scale backend 3
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8001, 27017 are available
2. **Docker issues**: Restart Docker daemon
3. **Kubernetes connectivity**: Check kubectl configuration
4. **Service health**: Use health check endpoints

### Debug Commands

```bash
# Check pod logs
kubectl logs -f deployment/backend -n voting-app

# Execute into pod
kubectl exec -it deployment/backend -n voting-app -- /bin/bash

# Port forward for debugging
kubectl port-forward svc/backend-service 8001:8001 -n voting-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/aks-argocd-voting-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/aks-argocd-voting-app/discussions)
- **Email**: devops@company.com

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [ArgoCD](https://argoproj.github.io/cd/) for GitOps capabilities
- [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) for CI/CD pipelines

---
