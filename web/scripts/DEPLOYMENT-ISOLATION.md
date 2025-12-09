# 🔒 Aislamiento de Deployment - Hangover Shield

Este documento confirma que el deployment de Hangover Shield **NO afecta** a otros servicios corriendo en el servidor.

## ✅ Aislamiento Completo

### 1. **Puerto Único**
- **Hangover Shield**: Puerto `4052`
- **Xilema**: Puerto `4051`
- **Gastabien**: Otro puerto (no especificado)
- ✅ **No hay conflicto de puertos**

### 2. **Contenedor Docker Único**
- **Hangover Shield**: `hangovershield-web-prod`
- **Xilema**: `xilema-landing-prod`
- ✅ **Cada servicio tiene su propio contenedor**

### 3. **Imagen Docker Separada**
- **Hangover Shield**: `hangovershield/web:latest`
- **Xilema**: `xilema/landing:latest`
- ✅ **Imágenes completamente independientes**

### 4. **Directorio Temporal Separado**
- **Hangover Shield**: `/tmp/hangovershield/`
- **Xilema**: `/tmp/xilema/`
- ✅ **Archivos temporales aislados**

### 5. **Archivo Tar Único**
- **Hangover Shield**: `hangovershield-web.tar`
- **Xilema**: `xilema-landing.tar`
- ✅ **No hay sobrescritura de archivos**

## 🔍 Qué Hace el Script

El script de deployment **SOLO** afecta al contenedor de Hangover Shield:

```bash
# Solo detiene/elimina el contenedor de Hangover Shield
docker stop hangovershield-web-prod
docker rm hangovershield-web-prod

# Solo crea el nuevo contenedor de Hangover Shield
docker run -p 4052:3000 --name hangovershield-web-prod ...
```

**NO toca:**
- ❌ Contenedores de Xilema
- ❌ Contenedores de Gastabien
- ❌ Cualquier otro servicio
- ❌ Configuraciones de nginx
- ❌ Archivos de otros proyectos

## 🛡️ Garantías de Seguridad

1. **Nombre de contenedor específico**: Solo afecta `hangovershield-web-prod`
2. **Puerto dedicado**: Solo usa el puerto `4052`
3. **Directorio aislado**: Solo usa `/tmp/hangovershield/`
4. **Sin comandos globales**: No ejecuta `docker stop $(docker ps -q)` ni similares

## 📊 Verificación Post-Deployment

Después del deployment, puedes verificar que otros servicios siguen corriendo:

```bash
ssh root@68.183.135.52 "docker ps --format 'table {{.Names}}\t{{.Ports}}'"
```

Deberías ver:
- ✅ `hangovershield-web-prod` en puerto `4052`
- ✅ `xilema-landing-prod` en puerto `4051`
- ✅ Otros servicios intactos

## 🚨 En Caso de Problemas

Si accidentalmente algo afecta otro servicio:

1. **Xilema**: Reinicia con `docker restart xilema-landing-prod`
2. **Otros servicios**: Verifica con `docker ps -a` y reinicia según sea necesario

Pero esto **NO debería pasar** porque el script solo toca su propio contenedor.

