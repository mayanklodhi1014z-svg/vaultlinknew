#!/bin/bash

# VaultLink Development Server Startup Script
# This script kills any processes on ports 5000 and 5173, then starts both servers

echo "🧹 Cleaning up ports..."

# Kill processes on port 5000 (backend)
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo "✅ Port 5000 freed" || echo "Port 5000 already free"

# Kill processes on port 5173 (frontend) 
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ Port 5173 freed" || echo "Port 5173 already free"

echo ""
echo "🚀 Starting VaultLink servers..."
echo ""

# Start backend in new terminal tab
gnome-terminal --tab --title="VaultLink Backend" -- bash -c "cd backend && npm run dev; exec bash" 2>/dev/null || \
  echo "⚠️  Could not open terminal tab. Start backend manually with: cd backend && npm run dev"

# Start frontend in new terminal tab  
gnome-terminal --tab --title="VaultLink Frontend" -- bash -c "cd frontend && npm run dev; exec bash" 2>/dev/null || \
  echo "⚠️  Could not open terminal tab. Start frontend manually with: cd frontend && npm run dev"

echo ""
echo "✨ VaultLink is starting..."
echo "📡 Backend:  http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "If terminals didn't open automatically, run these commands manually:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
