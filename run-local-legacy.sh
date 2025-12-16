#!/bin/bash

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Attempting to free it..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Install UI dependencies
    print_status "Installing UI dependencies..."
    cd ui
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    cd ..
    
    # Install approuter dependencies
    print_status "Installing approuter dependencies..."
    cd approuter
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    cd ..
    
    print_success "Dependencies installed successfully!"
}

# Function to start the UI development server
start_ui() {
    print_status "Starting UI development server..."
    cd ui
    npm run serve &
    UI_PID=$!
    cd ..
    echo $UI_PID > .ui.pid
    print_success "UI development server started (PID: $UI_PID)"
}

# Function to build UI for approuter
build_ui() {
    print_status "Building UI for approuter..."
    cd ui
    npm run build
    cd ..
    print_success "UI built successfully!"
}

# Function to start the approuter in proxy mode (for development)
start_approuter_dev() {
    print_status "Starting approuter in development mode (proxy to UI dev server)..."
    cd approuter
    npm run local &
    APPROUTER_PID=$!
    cd ..
    echo $APPROUTER_PID > .approuter.pid
    print_success "Approuter started in dev mode (PID: $APPROUTER_PID)"
}

# Function to start the approuter with XSUAA authentication
start_approuter_auth() {
    print_status "Starting approuter with XSUAA authentication..."
    cd approuter
    npm run local-auth &
    APPROUTER_PID=$!
    cd ..
    echo $APPROUTER_PID > .approuter.pid
    print_success "Approuter started with XSUAA auth (PID: $APPROUTER_PID)"
}

# Function to start the approuter
start_approuter() {
    print_status "Starting approuter..."
    
    # Build UI first for approuter to serve
    build_ui
    
    cd approuter
    npm run dev &
    APPROUTER_PID=$!
    cd ..
    echo $APPROUTER_PID > .approuter.pid
    print_success "Approuter started (PID: $APPROUTER_PID)"
}

# Function to stop all services
stop_services() {
    print_status "Stopping services..."
    
    # Stop UI server
    if [ -f ".ui.pid" ]; then
        UI_PID=$(cat .ui.pid)
        if kill -0 $UI_PID 2>/dev/null; then
            kill $UI_PID
            print_success "UI server stopped"
        fi
        rm -f .ui.pid
    fi
    
    # Stop approuter
    if [ -f ".approuter.pid" ]; then
        APPROUTER_PID=$(cat .approuter.pid)
        if kill -0 $APPROUTER_PID 2>/dev/null; then
            kill $APPROUTER_PID
            print_success "Approuter stopped"
        fi
        rm -f .approuter.pid
    fi
    
    # Clean up dev workspace
    rm -rf approuter/dev-workspace
    
    # Kill any remaining processes on our ports
    kill_port 8080
    kill_port 5001
    
    print_success "All services stopped"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services (UI + Approuter in proxy mode)"
    echo "  dev       Same as start - development mode with hot reload"
    echo "  auth      Start with XSUAA authentication (UI + Approuter with auth)"
    echo "  prod      Start approuter with built UI (production-like)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  ui        Start only UI development server"
    echo "  approuter Start only approuter"
    echo "  install   Install dependencies"
    echo "  status    Show status of running services"
    echo "  logs      Show logs from running services"
    echo "  clean     Clean node_modules and reinstall"
    echo "  help      Show this help message"
}

# Function to show status
show_status() {
    print_status "Service Status:"
    
    if [ -f ".ui.pid" ]; then
        UI_PID=$(cat .ui.pid)
        if kill -0 $UI_PID 2>/dev/null; then
            print_success "UI Server: Running (PID: $UI_PID)"
        else
            print_error "UI Server: Not running (stale PID file)"
            rm -f .ui.pid
        fi
    else
        print_warning "UI Server: Not running"
    fi
    
    if [ -f ".approuter.pid" ]; then
        APPROUTER_PID=$(cat .approuter.pid)
        if kill -0 $APPROUTER_PID 2>/dev/null; then
            print_success "Approuter: Running (PID: $APPROUTER_PID)"
        else
            print_error "Approuter: Not running (stale PID file)"
            rm -f .approuter.pid
        fi
    else
        print_warning "Approuter: Not running"
    fi
    
    echo ""
    print_status "Port Status:"
    if port_in_use 8080; then
        print_success "Port 8080: In use (likely UI server)"
    else
        print_warning "Port 8080: Available"
    fi
    
    if port_in_use 5001; then
        print_success "Port 5001: In use (likely approuter)"
    else
        print_warning "Port 5001: Available"
    fi
}

# Function to clean and reinstall
clean_install() {
    print_status "Cleaning node_modules and reinstalling..."
    
    stop_services
    
    # Clean UI
    print_status "Cleaning UI dependencies..."
    rm -rf ui/node_modules ui/package-lock.json
    
    # Clean approuter
    print_status "Cleaning approuter dependencies..."
    rm -rf approuter/node_modules approuter/package-lock.json
    
    # Reinstall
    install_dependencies
    
    print_success "Clean install completed!"
}

# Trap to handle script interruption
trap 'stop_services; exit 0' INT TERM

# Main script logic
case "${1:-start}" in
    "start")
        print_status "Starting My Dashboard locally..."
        
        # Clean up any existing processes
        kill_port 8080
        kill_port 5001
        
        # Install dependencies if node_modules don't exist
        if [ ! -d "ui/node_modules" ] || [ ! -d "approuter/node_modules" ]; then
            install_dependencies
        fi
        
        # Start services
        start_ui
        sleep 5  # Give UI time to start
        start_approuter_auth  # Use authenticated mode for development
        
        echo ""
        print_success "My Dashboard is now running in development mode!"
        echo ""
        print_status "Services:"
        echo "  UI Development Server: http://localhost:8080"
        echo "  Approuter (proxy):     http://localhost:5002"
        echo ""
        print_status "Use the approuter URL for full application experience"
        print_status "To stop the services, run: $0 stop"
        print_status "Press Ctrl+C to stop all services"
        
        # Wait for user interrupt
        wait
        ;;
    "dev")
        # Same as start - just an alias for clarity
        $0 start
        ;;
    "auth")
        print_status "Starting My Dashboard with XSUAA authentication..."
        
        # Clean up any existing processes
        kill_port 8080
        kill_port 5001
        
        # Install dependencies if node_modules don't exist
        if [ ! -d "ui/node_modules" ] || [ ! -d "approuter/node_modules" ]; then
            install_dependencies
        fi
        
        # Check if default-env.json exists and has proper configuration
        if [ ! -f "approuter/default-env.json" ]; then
            print_error "default-env.json not found in approuter directory!"
            print_status "Please create approuter/default-env.json with your XSUAA service credentials"
            exit 1
        fi
        
        # Start services
        start_ui
        sleep 5  # Give UI time to start
        start_approuter_auth  # Use XSUAA authentication
        
        echo ""
        print_success "My Dashboard is now running with XSUAA authentication!"
        echo ""
        print_status "Services:"
        echo "  UI Development Server: http://localhost:8080"
        echo "  Approuter (with auth): http://localhost:5001"
        echo ""
        print_status "Use the approuter URL to access the authenticated application"
        print_status "To stop the services, run: $0 stop"
        print_status "Press Ctrl+C to stop all services"
        
        # Wait for user interrupt
        wait
        ;;
    "prod")
        print_status "Starting My Dashboard in production mode..."
        
        # Clean up any existing processes
        kill_port 8080
        kill_port 5001
        
        # Install dependencies if node_modules don't exist
        if [ ! -d "ui/node_modules" ] || [ ! -d "approuter/node_modules" ]; then
            install_dependencies
        fi
        
        # Build and start approuter with built UI
        build_ui
        cd approuter
        npm run dev &
        APPROUTER_PID=$!
        cd ..
        echo $APPROUTER_PID > .approuter.pid
        
        echo ""
        print_success "My Dashboard is running in production mode!"
        echo ""
        print_status "Service:"
        echo "  Approuter: http://localhost:5001"
        echo ""
        print_status "To stop the service, run: $0 stop"
        print_status "Press Ctrl+C to stop the service"
        
        wait
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        $0 start
        ;;
    "ui")
        kill_port 8080
        if [ ! -d "ui/node_modules" ]; then
            print_status "Installing UI dependencies..."
            cd ui && npm install && cd ..
        fi
        start_ui
        print_success "UI server is running at http://localhost:8080"
        wait
        ;;
    "approuter")
        kill_port 5001
        if [ ! -d "approuter/node_modules" ]; then
            print_status "Installing approuter dependencies..."
            cd approuter && npm install && cd ..
        fi
        start_approuter
        print_success "Approuter is running at http://localhost:5001"
        wait
        ;;
    "install")
        install_dependencies
        ;;
    "status")
        show_status
        ;;
    "logs")
        print_status "Showing recent logs..."
        if [ -f ".ui.pid" ]; then
            echo "UI Server logs:"
            tail -n 20 ui/*.log 2>/dev/null || echo "No UI logs found"
        fi
        if [ -f ".approuter.pid" ]; then
            echo "Approuter logs:"
            tail -n 20 approuter/*.log 2>/dev/null || echo "No approuter logs found"
        fi
        ;;
    "clean")
        clean_install
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
