#!/bin/sh

BASEDIR=$(dirname $0)
USER="root"
HOST="68.183.135.52"
IMAGE=hangovershield/web:latest
IMAGE_FILE=hangovershield-web.tar
CONTAINER=hangovershield-web-prod

set -e  # Exit immediately if any command fails

# Build the image
# Usar DOCKER_BUILDKIT=0 si hay problemas con credenciales de Docker Desktop
if [[ $(uname -m) == 'arm64' ]]; then
  DOCKER_BUILDKIT=0 docker build --platform linux/amd64 -f $BASEDIR/../Dockerfile -t $IMAGE $BASEDIR/.. || docker build --platform linux/amd64 -f $BASEDIR/../Dockerfile -t $IMAGE $BASEDIR/..
else
  DOCKER_BUILDKIT=0 docker build -f $BASEDIR/../Dockerfile -t $IMAGE $BASEDIR/.. || docker build -f $BASEDIR/../Dockerfile -t $IMAGE $BASEDIR/..
fi

docker save $IMAGE > $IMAGE_FILE

scp $IMAGE_FILE root@$HOST:/tmp/hangovershield/$IMAGE_FILE

ssh $USER@$HOST << EOF
  mkdir -p /tmp/hangovershield
  cd /tmp/hangovershield
  docker load -i $IMAGE_FILE
  
  # Solo afecta al contenedor de Hangover Shield, no otros servicios
  docker stop $CONTAINER 2>/dev/null || true
  docker rm $CONTAINER 2>/dev/null || true
  
  docker run -p 4052:3000 -d --restart unless-stopped --name $CONTAINER $IMAGE
  rm $IMAGE_FILE
  
  echo "✓ Contenedor $CONTAINER iniciado en puerto 4052"
  echo "✓ Otros servicios no afectados (Xilema:4051, otros servicios intactos)"
EOF

rm $IMAGE_FILE

echo "✓ Deploy completado exitosamente"

