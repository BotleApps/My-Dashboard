#!/bin/bash

# SAP BTP Deployment Script for My Dashboard

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function log() { echo -e "${BLUE}[INFO]${NC} $1"; }
function success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
function warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
function error() { echo -e "${RED}[ERROR]${NC} $1"; }

function check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v cf &> /dev/null; then
        error "Cloud Foundry CLI not found. Please install from: https://docs.cloudfoundry.org/cf-cli/"
        exit 1
    fi
    
    if ! command -v mbt &> /dev/null; then
        warning "MBT tool not found. Installing..."
        npm install -g mbt
    fi
    
    if ! cf target &> /dev/null; then
        error "Not logged into Cloud Foundry. Please run: cf login"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

function build_project() {
    log "Building project..."
    
    rm -rf mta_archives dist .mtaext
    
    log "Building UI application..."
    ./run-local.sh build
    
    log "Building MTA archive..."
    mbt build -p cf
    
    success "Project built successfully"
}

function deploy_to_btp() {
    log "Deploying to SAP BTP..."
    
    MTA_ARCHIVE=$(find mta_archives -name "*.mtar" | head -n 1)
    
    if [ -z "$MTA_ARCHIVE" ]; then
        error "No MTA archive found. Build may have failed."
        exit 1
    fi
    
    log "Deploying archive: $MTA_ARCHIVE"
    cf deploy "$MTA_ARCHIVE"
    
    if [ $? -eq 0 ]; then
        success "Deployment completed successfully!"
        log "Application URLs:"
        cf apps | grep my-dashboard
    else
        error "Deployment failed!"
        exit 1
    fi
}

function show_help() {
    echo "SAP BTP Deployment Script for My Dashboard"
    echo "=========================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy     Full deployment (build + deploy)"
    echo "  build      Build MTA archive only"
    echo "  services   Show bound services"
    echo "  logs       Show application logs"
    echo "  undeploy   Remove application from BTP"
    echo "  help       Show this help message"
}

case "${1:-deploy}" in
    "deploy")
        check_prerequisites
        build_project
        deploy_to_btp
        ;;
    "build")
        check_prerequisites
        build_project
        ;;
    "services")
        cf services | grep my-dashboard
        ;;
    "logs")
        cf logs my-dashboard-approuter --recent
        ;;
    "undeploy")
        warning "This will remove the application and all bound services!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cf undeploy my-dashboard --delete-services
        fi
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
