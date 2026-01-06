# Debugging Production Build Issues

Si el build se queda colgado en splash screen:

## 1. Ver logs en tiempo real (CRÍTICO)

### iOS:
```bash
# Conecta tu iPhone y ejecuta:
xcrun simctl spawn booted log stream --predicate 'eventMessage contains "hangovershield"' --level=debug

# O más simple:
npx react-native log-ios
```

### Usando Xcode:
1. Abre Xcode
2. Window > Devices and Simulators
3. Selecciona tu dispositivo
4. Click "Open Console"
5. Busca errores en rojo

## 2. Errores comunes y soluciones

### Error: Firebase config undefined
**Causa:** Variables de entorno no se inyectaron en el build
**Solución:** 
- Verificar que `.env` existe en la raíz de `app/`
- Rebuild con `eas build --clear-cache`

### Error: Cannot find module
**Causa:** Dependencia nativa no instalada correctamente
**Solución:**
```bash
cd app
rm -rf node_modules
npm install
eas build --clear-cache
```

### Error: Auth persistence / AsyncStorage
**Causa:** Nuestro fix de setPersistenceProvider
**Solución:** Ya removido en commit 6ee264c

### Error: RevenueCat initialization
**Causa:** RevenueCat intentando inicializar sin API key
**Solución:** Comentar inicialización de RevenueCat en App.tsx temporalmente

## 3. Build de prueba con logs extra

Agregar esto temporalmente en App.tsx (línea 1):
```typescript
console.log('[APP] Starting app...');
console.log('[APP] Firebase config:', Constants.expoConfig?.extra);
```

## 4. Contacto de emergencia
Si nada funciona, los 3 CRITICAL fixes están en estos commits:
- 633782c: Login loop, Water reset, Auth persistence (WORKING VERSION)
- Podemos volver a esta versión y rebuild
