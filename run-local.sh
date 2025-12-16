#!/bin/bash

# Simple development script for My Dashboard
# This provides essential functionality while keeping complexity low

function show_help() {
    echo "My Dashboard - Simplified Development Script"
    echo "==========================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start/dev   Start development environment (default)"
    echo "  install     Install dependencies"
    echo "  build       Build UI for production"
    echo "  stop        Stop all services"
    echo "  help        Show this help message"
    echo ""
    echo "Development URLs:"
    echo "  UI Development: http://localhost:8080"
    echo "  Approuter:      http://localhost:5001"
}

function install_deps() {
    echo "📦 Installing dependencies..."
    
    if [ ! -d "ui/node_modules" ]; then
        echo "Installing UI dependencies..."
        cd ui && npm install && cd ..
    fi
    
    if [ ! -d "approuter/node_modules" ]; then
        echo "Installing approuter dependencies..."
        cd approuter && npm install && cd ..
    fi
    
    echo "✅ Dependencies installed!"
}

function start_dev() {
    echo "🚀 Starting My Dashboard in development mode..."
    
    # Install dependencies if needed
    install_deps
    
    # Kill any existing processes on our ports
    pkill -f "vue-cli-service serve" 2>/dev/null || true
    pkill -f "start-auth.js" 2>/dev/null || true
    pkill -f "start-local.js" 2>/dev/null || true
    
    # Start UI development server in background
    echo "Starting UI development server..."
    cd ui && npm run serve &
    UI_PID=$!
    cd ..
    
    # Give UI time to start
    sleep 5
    
    # Start approuter with authentication
    echo "Starting approuter with authentication..."
    cd approuter && npm run local-auth &
    APPROUTER_PID=$!
    cd ..
    
    echo ""
    echo "✅ My Dashboard is running!"
    echo "�� UI Development Server: http://localhost:8080"
    echo "🌐 Approuter (with auth): http://localhost:5001"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user interrupt
    trap 'echo "Stopping services..."; kill $UI_PID $APPROUTER_PID 2>/dev/null; exit 0' INT
    wait
}

function build_ui() {
    echo "🔨 Building UI for production..."
    cd ui && npm run build && cd ..
    echo "✅ Build completed!"
}

function stop_services() {
    echo "🛑 Stopping services..."
    pkill -f "vue-cli-service serve" 2>/dev/null || true
    pkill -f "start-auth.js" 2>/dev/null || true
    pkill -f "start-local.js" 2>/dev/null || true
    echo "✅ Services stopped"
}

# Main command handling
case "${1:-dev}" in
    "start"|"dev")
        start_dev
        ;;
    "install")
        install_deps
        ;;
    "build")
        build_ui
        ;;
    "stop")
        stop_services
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac
