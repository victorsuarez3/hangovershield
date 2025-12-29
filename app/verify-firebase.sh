#!/bin/bash

# Script de Verificación Firebase
# Ejecuta antes de probar en dispositivo para confirmar que todo está correcto

echo "🔍 Verificando configuración de Firebase..."
echo ""

# 1. Verificar versión de Firebase
echo "1️⃣ Versión de Firebase instalada:"
FB_VERSION=$(npm ls firebase --depth=0 2>&1 | grep "firebase@" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
if [[ "$FB_VERSION" == 10.* ]]; then
  echo "   ✅ Firebase $FB_VERSION (10.x)"
else
  echo "   ⚠️ Firebase $FB_VERSION (se recomienda 10.x)"
fi

# 2. Verificar versiones únicas de @firebase/app
echo ""
echo "2️⃣ Verificando deduplicación de @firebase/app:"
UNIQUE_APP_VERSIONS=$(npm ls @firebase/app 2>&1 | grep "@firebase/app@" | grep -v "deduped" | sort -u | wc -l | tr -d ' ')
if [ "$UNIQUE_APP_VERSIONS" -eq 1 ]; then
  APP_VERSION=$(npm ls @firebase/app 2>&1 | grep "@firebase/app@" | grep -v "deduped" | head -1 | grep -o '@firebase/app@[0-9.]*')
  echo "   ✅ Solo una versión: $APP_VERSION"
else
  echo "   ❌ ADVERTENCIA: $UNIQUE_APP_VERSIONS versiones diferentes detectadas"
  npm ls @firebase/app 2>&1 | grep "@firebase/app@" | grep -v "deduped"
fi

# 3. Verificar que @firebase/auth no esté duplicado
echo ""
echo "3️⃣ Verificando @firebase/auth:"
UNIQUE_AUTH_VERSIONS=$(npm ls @firebase/auth 2>&1 | grep "@firebase/auth@" | grep -v "deduped" | sort -u | wc -l | tr -d ' ')
if [ "$UNIQUE_AUTH_VERSIONS" -eq 1 ]; then
  AUTH_VERSION=$(npm ls @firebase/auth 2>&1 | grep "@firebase/auth@" | grep -v "deduped" | head -1 | grep -o '@firebase/auth@[0-9.]*')
  echo "   ✅ Solo una versión: $AUTH_VERSION"
else
  echo "   ⚠️ ADVERTENCIA: $UNIQUE_AUTH_VERSIONS versiones detectadas"
  npm ls @firebase/auth 2>&1 | grep "@firebase/auth@" | grep -v "deduped"
fi

# 4. Verificar que el import de RN exista
echo ""
echo "4️⃣ Verificando @firebase/auth/dist/rn:"
if [ -f "node_modules/firebase/node_modules/@firebase/auth/dist/rn/index.rn.d.ts" ]; then
  echo "   ✅ @firebase/auth/dist/rn existe (React Native persistence disponible)"
elif [ -d "node_modules/firebase/auth/react-native" ]; then
  echo "   ⚠️ Usando firebase/auth/react-native (Firebase 9.x)"
else
  echo "   ❌ ERROR: No se encuentra persistence para React Native"
fi

# 5. TypeScript check
echo ""
echo "5️⃣ Verificando tipos TypeScript:"
npx tsc --noEmit 2>&1 > /dev/null
if [ $? -eq 0 ]; then
  echo "   ✅ Sin errores de TypeScript"
else
  echo "   ❌ Hay errores de TypeScript - ejecuta: npx tsc --noEmit"
fi

# 6. Verificar Metro config
echo ""
echo "6️⃣ Verificando metro.config.js:"
if [ -f "metro.config.js" ]; then
  if grep -q "nodeModulesPaths" metro.config.js; then
    echo "   ✅ metro.config.js configurado para Firebase 10.x"
  else
    echo "   ⚠️ metro.config.js existe pero puede necesitar configuración"
  fi
else
  echo "   ⚠️ metro.config.js no encontrado (se usará config por defecto)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RESUMEN:"
echo ""

# Contar checks exitosos
CHECKS_PASSED=0
[[ "$FB_VERSION" == 10.* ]] && CHECKS_PASSED=$((CHECKS_PASSED + 1))
[ "$UNIQUE_APP_VERSIONS" -eq 1 ] && CHECKS_PASSED=$((CHECKS_PASSED + 1))
[ "$UNIQUE_AUTH_VERSIONS" -eq 1 ] && CHECKS_PASSED=$((CHECKS_PASSED + 1))
[ -f "node_modules/firebase/node_modules/@firebase/auth/dist/rn/index.rn.d.ts" ] && CHECKS_PASSED=$((CHECKS_PASSED + 1))
npx tsc --noEmit 2>&1 > /dev/null && CHECKS_PASSED=$((CHECKS_PASSED + 1))

if [ "$CHECKS_PASSED" -ge 4 ]; then
  echo "✅ CONFIGURACIÓN CORRECTA - Listo para probar en dispositivo"
  echo ""
  echo "Siguiente paso:"
  echo "  1. Desinstala la app del iPhone (importante!)"
  echo "  2. npx expo start -c --port 8082"
  echo "  3. Escanea el QR code"
else
  echo "⚠️ HAY ADVERTENCIAS ($CHECKS_PASSED/5 checks pasaron)"
  echo ""
  echo "Si hay problemas, ejecuta:"
  echo "  rm -rf node_modules package-lock.json"
  echo "  npm install"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
