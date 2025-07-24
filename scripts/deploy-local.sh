#!/bin/bash

# DevOps Project-37: Local Deployment Script
# 3-Tier Microservice Voting App Local Deployment

set -e

echo "🚀 Starting local deployment of 3-Tier Voting App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running!"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "✅ MongoDB is healthy"
    else
        print_error "❌ MongoDB health check failed"
    fi
    
    # Check Backend API
    if curl -f http://localhost:8001/api/health &> /dev/null; then
        print_success "✅ Backend API is healthy"
    else
        print_error "❌ Backend API health check failed"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "✅ Frontend is healthy"
    else
        print_error "❌ Frontend health check failed"
    fi
}

# Show service information
show_service_info() {
    print_status "Service Information:"
    echo ""
    echo "🌐 Frontend:  http://localhost:3000"
    echo "🔧 Backend:   http://localhost:8001"
    echo "📊 API Docs:  http://localhost:8001/docs"
    echo "🗄️  MongoDB:   localhost:27017"
    echo ""
    echo "📱 Application URLs:"
    echo "   • Home:        http://localhost:3000"
    echo "   • Create Poll: http://localhost:3000/create"
    echo "   • API Health:  http://localhost:8001/api/health"
    echo ""
}

# Show logs
show_logs() {
    if [ "$1" == "logs" ]; then
        print_status "Showing service logs..."
        docker-compose logs -f
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed!"
}

# Main execution
main() {
    case "$1" in
        "up"|"start"|"")
            check_prerequisites
            deploy_services
            show_service_info
            ;;
        "down"|"stop")
            print_status "Stopping services..."
            docker-compose down
            print_success "Services stopped!"
            ;;
        "logs")
            show_logs "logs"
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            print_status "Service status:"
            docker-compose ps
            ;;
        "health")
            check_service_health
            ;;
        "rebuild")
            print_status "Rebuilding services..."
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
            show_service_info
            ;;
        *)
            echo "Usage: $0 {up|down|logs|cleanup|status|health|rebuild}"
            echo ""
            echo "Commands:"
            echo "  up/start  - Start all services"
            echo "  down/stop - Stop all services"
            echo "  logs      - Show service logs"
            echo "  cleanup   - Stop services and cleanup"
            echo "  status    - Show service status"
            echo "  health    - Check service health"
            echo "  rebuild   - Rebuild and restart services"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup EXIT INT TERM

# Execute main function
main "$@"