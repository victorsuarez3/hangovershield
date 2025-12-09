#!/bin/sh

# Script de verificación del servidor antes del deployment
# Ejecuta este script para verificar que todo esté listo

USER="root"
HOST="68.183.135.52"
CONTAINER=hangovershield-web-prod
PORT=4052

echo "🔍 Verificando requisitos del servidor..."
echo ""

# Verificar acceso SSH
echo "1. Verificando acceso SSH..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes $USER@$HOST echo "✓ SSH OK" 2>/dev/null; then
  echo "   ✓ Acceso SSH configurado correctamente"
else
  echo "   ✗ No se puede conectar vía SSH"
  echo "   → Configura las claves SSH: ssh-copy-id $USER@$HOST"
  exit 1
fi
echo ""

# Verificar Docker instalado
echo "2. Verificando Docker..."
if ssh $USER@$HOST "command -v docker >/dev/null 2>&1"; then
  echo "   ✓ Docker está instalado"
  ssh $USER@$HOST "docker --version"
else
  echo "   ✗ Docker no está instalado"
  echo "   → Instala Docker en el servidor"
  exit 1
fi
echo ""

# Verificar que Docker está corriendo
echo "3. Verificando que Docker está corriendo..."
if ssh $USER@$HOST "docker ps >/dev/null 2>&1"; then
  echo "   ✓ Docker está corriendo"
else
  echo "   ✗ Docker no está corriendo"
  echo "   → Inicia Docker: systemctl start docker"
  exit 1
fi
echo ""

# Verificar que el puerto 4052 está disponible
echo "4. Verificando disponibilidad del puerto $PORT..."
if ssh $USER@$HOST "netstat -tuln | grep :$PORT >/dev/null 2>&1 || ss -tuln | grep :$PORT >/dev/null 2>&1"; then
  echo "   ⚠ El puerto $PORT está en uso"
  echo "   → Verifica qué servicio lo está usando"
  ssh $USER@$HOST "netstat -tuln | grep :$PORT || ss -tuln | grep :$PORT"
else
  echo "   ✓ El puerto $PORT está disponible"
fi
echo ""

# Verificar si el contenedor anterior existe
echo "5. Verificando contenedores existentes..."
if ssh $USER@$HOST "docker ps -a --format '{{.Names}}' | grep -q '^${CONTAINER}$'"; then
  echo "   ⚠ El contenedor $CONTAINER ya existe (será reemplazado)"
  ssh $USER@$HOST "docker ps -a --filter name=$CONTAINER --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
else
  echo "   ✓ No hay contenedores previos (primera vez)"
fi
echo ""

# Verificar espacio en disco
echo "6. Verificando espacio en disco..."
ssh $USER@$HOST "df -h /tmp | tail -1 | awk '{print \"   Espacio disponible en /tmp: \" \$4}'"
echo ""

# Verificar otros servicios en puertos cercanos
echo "7. Verificando otros servicios..."
echo "   Contenedores activos:"
ssh $USER@$HOST "docker ps --format 'table {{.Names}}\t{{.Ports}}' | head -10"
echo ""

echo "✅ Verificación completada"
echo ""
echo "Si todo está correcto, puedes ejecutar:"
echo "  cd web && ./scripts/deploy.sh"

