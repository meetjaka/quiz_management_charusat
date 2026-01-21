#!/bin/bash
set -e

echo "📦 Installing frontend dependencies..."
(cd frontend && npm install)

echo "🔨 Building frontend..."
(cd frontend && npm run build)

echo "✅ Build complete!"
