#!/bin/bash

# Hangover Shield - Quick Start Script
# Este script inicia el servidor de desarrollo

cd "$(dirname "$0")"

echo "🛡️  Hangover Shield - Landing Page"
echo "=================================="
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

echo "🚀 Iniciando servidor de desarrollo..."
echo "🌐 Abre http://localhost:3000 en tu navegador"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
