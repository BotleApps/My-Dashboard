# My Dashboard

A modern, customizable dashboard application built with Vue.js and SAP Approuter.

## Quick Start

1. **Install dependencies**:
   ```bash
   ./run-local.sh install
   ```

2. **Start development**:
   ```bash
   ./run-local.sh start
   ```

3. **Access the application**:
   - UI Development Server: http://localhost:8080
   - Approuter (with auth): http://localhost:5001

## Commands

- `./run-local.sh start` - Start development environment
- `./run-local.sh install` - Install dependencies  
- `./run-local.sh build` - Build for production
- `./run-local.sh stop` - Stop all services
- `./run-local.sh help` - Show help

## Project Structure

- `ui/` - Vue.js frontend application
- `approuter/` - SAP Approuter configuration  
- `mta.yaml` - Deployment descriptor
- `run-local.sh` - Development script
- `run-local-legacy.sh` - Original script (backup)

## Authentication

For XSUAA authentication, create `approuter/default-env.json` with your service credentials.

