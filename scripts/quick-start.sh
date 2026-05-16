#!/bin/bash

# FluxoZap Quick Start Setup
# This script sets up local development environment with test data

set -e

echo "🚀 FluxoZap Quick Start Setup"
echo "───────────────────────────────"

# Check for required commands
for cmd in node npm docker docker-compose; do
  if ! command -v $cmd &> /dev/null; then
    echo "❌ Error: $cmd not found. Please install it."
    exit 1
  fi
done

# Setup .env.local if not exists
if [ ! -f .env.local ]; then
  echo ""
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  
  # Generate AUTH_SECRET
  AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  sed -i "s/AUTH_SECRET=.*/AUTH_SECRET=$AUTH_SECRET/" .env.local
  
  echo "✓ .env.local created with random AUTH_SECRET"
else
  echo "✓ .env.local already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent || npm install

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate deploy --skip-generate || true

# Seed database (if seed script exists)
if [ -f "prisma/seed.ts" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || true
fi

# Build
echo ""
echo "🔨 Building application..."
npm run build

echo ""
echo "───────────────────────────────"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start development server:    npm run dev"
echo "2. Open browser:                http://localhost:3000"
echo "3. Run validation tests:        npx ts-node scripts/validate-e2e.ts"
echo "4. Follow VALIDATION_GUIDE.md for manual testing"
echo ""
echo "Configuration file: .env.local"
echo "───────────────────────────────"
