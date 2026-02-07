#!/bin/bash

# VaultLink Quick Start Script
# Helps you get the application running quickly

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╦  ╦┌─┐┬ ┬┬ ┌┬┐╦  ┬┌┐┌┬┌─
╚╗╔╝├─┤│ ││  │ ║  ││││├┴┐
 ╚╝ ┴ ┴└─┘┴─┘┴ ╩═╝┴┘└┘┴ ┴
EOF
echo -e "${NC}"
echo "Quick Start Setup"
echo "================================"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# MongoDB
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB CLI installed${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB CLI not found. Make sure MongoDB is accessible${NC}"
fi

echo ""

# Check if dependencies are installed
echo -e "${YELLOW}Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

echo ""

# Check environment files
echo -e "${YELLOW}Checking environment configuration...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗ backend/.env not found${NC}"
    echo ""
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠ Please edit backend/.env and add your configuration:${NC}"
    echo "  - MongoDB URI"
    echo "  - Cloudinary credentials"
    echo ""
    echo "Run this script again after configuration."
    exit 1
else
    echo -e "${GREEN}✓ backend/.env exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env from example..."
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ frontend/.env created${NC}"
else
    echo -e "${GREEN}✓ frontend/.env exists${NC}"
fi

echo ""

# Offer to start the application
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Setup Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "To start the application, you need to:"
echo ""
echo "1. Start Backend (in one terminal):"
echo -e "   ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo "2. Start Frontend (in another terminal):"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "3. Access the application:"
echo -e "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo "4. Test the API:"
echo -e "   ${GREEN}./test-api.sh${NC}"
echo ""
echo -e "${YELLOW}Note: Make sure MongoDB is running before starting the backend!${NC}"
echo ""

# Ask if user wants to start now
read -p "Do you want to start the backend now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Starting backend...${NC}"
    echo "Press Ctrl+C to stop"
    echo ""
    cd backend
    npm run dev
fi
