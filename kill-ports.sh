#!/bin/bash

# Kill processes on VaultLink ports

echo "🧹 Killing processes on ports 5000 and 5173..."

# Kill backend port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo "✅ Port 5000 freed" || echo "ℹ️  Port 5000 already free"

# Kill frontend port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ Port 5173 freed" || echo "ℹ️  Port 5173 already free"

echo "✨ Done!"
