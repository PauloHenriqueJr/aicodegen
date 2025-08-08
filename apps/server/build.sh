#!/bin/bash
# Build script for Vercel

echo "🔧 Starting build process..."

# Go to root and install dependencies
cd ../..
echo "📦 Installing dependencies..."
npm ci

# Build the server
echo "🏗️ Building server..."
npm run build --filter=server

# Copy the built files to the correct location
echo "📂 Copying built files..."
cp -r apps/server/dist/* apps/server/

echo "✅ Build completed!"
ls -la apps/server/
