#!/bin/bash

# DevOps Project-37: Kubernetes Deployment Script
# 3-Tier Microservice Voting App K8s Deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="voting-app"
KUSTOMIZE_DIR="k8s/base"
ARGOCD_NAMESPACE="argocd"

# Function to print colored output
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed!"
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster!"
        exit 1
    fi
    
    # Check if running on AKS
    if kubectl get nodes -o wide | grep -q "aks"; then
        print_success "Connected to AKS cluster"
    else
        print_warning "Not running on AKS cluster"
    fi
    
    print_success "Prerequisites check completed!"
}

# Deploy application
deploy_app() {
    print_status "Deploying 3-Tier Voting App to Kubernetes..."
    
    # Create namespace
    print_status "Creating namespace..."
    kubectl apply -f k8s/base/namespace.yaml
    
    # Deploy MongoDB (Tier 3)
    print_status "Deploying MongoDB (Database Tier)..."
    kubectl apply -f k8s/base/mongo.yaml
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n $NAMESPACE
    
    # Deploy Backend (Tier 2)
    print_status "Deploying Backend API (Application Tier)..."
    kubectl apply -f k8s/base/backend.yaml
    
    # Wait for Backend to be ready
    print_status "Waiting for Backend to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/backend -n $NAMESPACE
    
    # Deploy Frontend (Tier 1)
    print_status "Deploying Frontend (Presentation Tier)..."
    kubectl apply -f k8s/base/frontend.yaml
    
    # Wait for Frontend to be ready
    print_status "Waiting for Frontend to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n $NAMESPACE
    
    # Deploy Ingress
    print_status "Deploying Ingress..."
    kubectl apply -f k8s/base/ingress.yaml
    
    print_success "Application deployed successfully!"
}

# Setup ArgoCD
setup_argocd() {
    print_status "Setting up ArgoCD..."
    
    # Install ArgoCD
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    # Wait for ArgoCD to be ready
    print_status "Waiting for ArgoCD to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment/argocd-server -n argocd
    
    # Apply ArgoCD configuration
    print_status "Applying ArgoCD configuration..."
    kubectl apply -f argocd/project.yaml
    kubectl apply -f argocd/app.yaml
    
    # Get ArgoCD admin password
    ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
    
    print_success "ArgoCD setup completed!"
    print_status "ArgoCD Admin Password: $ARGOCD_PASSWORD"
}

# Check deployment status
check_status() {
    print_status "Checking deployment status..."
    
    echo ""
    print_status "Namespace status:"
    kubectl get ns $NAMESPACE
    
    echo ""
    print_status "Pod status:"
    kubectl get pods -n $NAMESPACE -o wide
    
    echo ""
    print_status "Service status:"
    kubectl get svc -n $NAMESPACE
    
    echo ""
    print_status "Ingress status:"
    kubectl get ingress -n $NAMESPACE
    
    echo ""
    print_status "Deployment status:"
    kubectl get deployments -n $NAMESPACE
    
    # Health checks
    echo ""
    print_status "Health checks:"
    
    # Check if all pods are running
    if kubectl get pods -n $NAMESPACE | grep -q "Running"; then
        print_success "✅ Pods are running"
    else
        print_error "❌ Some pods are not running"
    fi
    
    # Check services
    if kubectl get svc -n $NAMESPACE | grep -q "ClusterIP\|LoadBalancer"; then
        print_success "✅ Services are active"
    else
        print_error "❌ Services are not ready"
    fi
}

# Show access information
show_access_info() {
    print_status "Application Access Information:"
    
    # Get ingress IP
    INGRESS_IP=$(kubectl get ingress voting-app-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    
    echo ""
    echo "🌐 Application URLs:"
    if [ "$INGRESS_IP" != "pending" ] && [ "$INGRESS_IP" != "" ]; then
        echo "   • Frontend:    http://$INGRESS_IP"
        echo "   • Backend API: http://$INGRESS_IP/api"
        echo "   • API Docs:    http://$INGRESS_IP/api/docs"
    else
        echo "   • Ingress IP is pending... Use port-forward:"
        echo "   • kubectl port-forward svc/frontend-service 3000:3000 -n $NAMESPACE"
        echo "   • kubectl port-forward svc/backend-service 8001:8001 -n $NAMESPACE"
    fi
    
    echo ""
    echo "🔧 Management URLs:"
    echo "   • ArgoCD:      kubectl port-forward svc/argocd-server 8080:443 -n argocd"
    echo "   • K8s Dashboard: kubectl proxy"
    
    echo ""
    echo "🛠️  Useful Commands:"
    echo "   • View logs:   kubectl logs -f deployment/frontend -n $NAMESPACE"
    echo "   • Shell access: kubectl exec -it deployment/backend -n $NAMESPACE -- /bin/bash"
    echo "   • Port forward: kubectl port-forward svc/frontend-service 3000:3000 -n $NAMESPACE"
    
}

# Cleanup function
cleanup() {
    print_status "Cleaning up deployment..."
    
    # Delete application resources
    kubectl delete -f k8s/base/ --ignore-not-found=true
    
    # Delete namespace
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    print_success "Cleanup completed!"
}

# Scale deployment
scale_deployment() {
    local service=$1
    local replicas=$2
    
    if [ -z "$service" ] || [ -z "$replicas" ]; then
        print_error "Usage: scale <service> <replicas>"
        print_error "Services: frontend, backend"
        exit 1
    fi
    
    print_status "Scaling $service to $replicas replicas..."
    kubectl scale deployment $service --replicas=$replicas -n $NAMESPACE
    
    print_success "$service scaled to $replicas replicas!"
}

# Main execution
main() {
    case "$1" in
        "deploy"|"up"|"")
            check_prerequisites
            deploy_app
            check_status
            show_access_info
            ;;
        "argocd")
            setup_argocd
            ;;
        "status")
            check_status
            ;;
        "info")
            show_access_info
            ;;
        "cleanup"|"down")
            cleanup
            ;;
        "scale")
            scale_deployment "$2" "$3"
            ;;
        "logs")
            service=${2:-"all"}
            if [ "$service" == "all" ]; then
                kubectl logs -f -l app=frontend -n $NAMESPACE &
                kubectl logs -f -l app=backend -n $NAMESPACE &
                kubectl logs -f -l app=mongodb -n $NAMESPACE &
                wait
            else
                kubectl logs -f deployment/$service -n $NAMESPACE
            fi
            ;;
        *)
            echo "Usage: $0 {deploy|argocd|status|info|cleanup|scale|logs}"
            echo ""
            echo "Commands:"
            echo "  deploy     - Deploy application to Kubernetes"
            echo "  argocd     - Setup ArgoCD"
            echo "  status     - Check deployment status"
            echo "  info       - Show access information"
            echo "  cleanup    - Remove deployment"
            echo "  scale      - Scale deployment (scale <service> <replicas>)"
            echo "  logs       - Show logs (logs [service])"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"