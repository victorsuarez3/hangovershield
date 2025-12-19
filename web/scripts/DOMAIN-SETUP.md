# 🌐 Configuración del Dominio - Hangover Shield

## ✅ Lo que ya está hecho

1. ✅ **Deployment completado**: El sitio está corriendo en `http://68.183.135.52:4052`
2. ✅ **Nginx configurado**: Reverse proxy configurado para `hangovershield.co` → puerto `4052`
3. ✅ **Configuración activa**: Nginx recargado y funcionando

## 🔧 Pasos restantes

### 1. Configurar DNS del dominio

Necesitas configurar los registros DNS de `hangovershield.co` para que apunten a la IP del servidor:

**Registros DNS necesarios:**

```
Tipo    Nombre                    Valor
A       hangovershield.co         68.183.135.52
A       www.hangovershield.co     68.183.135.52
```

**Dónde configurarlo:**
- Ve al panel de control de tu proveedor de dominio (donde compraste `hangovershield.co`)
- Busca la sección de "DNS" o "Zona DNS"
- Agrega los registros A mostrados arriba

**Tiempo de propagación:** 5 minutos a 48 horas (normalmente 15-30 minutos)

### 2. Verificar que DNS está funcionando

Una vez configurado el DNS, verifica que resuelve correctamente:

```bash
# Desde tu terminal local
nslookup hangovershield.co
# Debería mostrar: 68.183.135.52

# O desde el navegador
# Deberías poder acceder a http://hangovershield.co
```

### 3. Configurar SSL/HTTPS (Opcional pero recomendado)

Una vez que el DNS esté funcionando y puedas acceder a `http://hangovershield.co`, configura SSL con Let's Encrypt:

```bash
ssh root@68.183.135.52
certbot --nginx -d hangovershield.co -d www.hangovershield.co
```

Esto:
- Instalará certificados SSL gratuitos
- Configurará HTTPS automáticamente
- Redirigirá HTTP → HTTPS

## 📋 Resumen del estado actual

| Componente | Estado | Detalles |
|------------|--------|----------|
| **Docker Container** | ✅ Activo | `hangovershield-web-prod` en puerto `4052` |
| **Nginx Config** | ✅ Configurado | `/etc/nginx/conf.d/hangovershield.conf` |
| **DNS** | ⏳ Pendiente | Necesitas configurar registros A |
| **SSL/HTTPS** | ⏳ Pendiente | Después de configurar DNS |

## 🔍 Verificación

### Verificar que el contenedor está corriendo:
```bash
ssh root@68.183.135.52 "docker ps --filter name=hangovershield-web-prod"
```

### Verificar configuración de nginx:
```bash
ssh root@68.183.135.52 "cat /etc/nginx/conf.d/hangovershield.conf"
```

### Verificar que nginx está funcionando:
```bash
ssh root@68.183.135.52 "nginx -t && systemctl status nginx"
```

### Probar acceso directo por IP:
```bash
curl -I http://68.183.135.52:4052
# Debería responder: HTTP/1.1 200 OK
```

## 🚨 Troubleshooting

### Si el dominio no resuelve:
1. Verifica que los registros DNS estén configurados correctamente
2. Espera a que se propague el DNS (puede tardar hasta 48 horas)
3. Verifica con: `nslookup hangovershield.co`

### Si nginx no funciona:
```bash
ssh root@68.183.135.52 "nginx -t"  # Verificar sintaxis
ssh root@68.183.135.52 "systemctl restart nginx"  # Reiniciar
```

### Si el contenedor no responde:
```bash
ssh root@68.183.135.52 "docker logs hangovershield-web-prod"
ssh root@68.183.135.52 "docker restart hangovershield-web-prod"
```

## 📞 Acceso actual

- **Por IP directa**: `http://68.183.135.52:4052` ✅ Funcionando
- **Por dominio (después de DNS)**: `http://hangovershield.co` ⏳ Pendiente DNS
- **Por dominio HTTPS (después de SSL)**: `https://hangovershield.co` ⏳ Pendiente SSL



