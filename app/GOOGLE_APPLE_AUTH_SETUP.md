# 🔐 Configuración de Google y Apple Sign-In - Hangover Shield

## ✅ Lo que ya está hecho

1. ✅ **Dependencias instaladas**: `expo-auth-session`, `expo-crypto`, `expo-apple-authentication`
2. ✅ **Archivos de configuración**: `GoogleService-Info.plist` y `google-services.json` están en el proyecto
3. ✅ **app.config.ts actualizado**: Con credenciales de Firebase y OAuth Client IDs
4. ✅ **Servicio de auth**: Funciones `signInWithGoogleCredential` y `signInWithApple` implementadas
5. ✅ **Componentes**: `GoogleSignInButton` y `AppleSignInButton` creados

## 🔧 Lo que falta configurar (del lado del usuario)

### 1. Firebase Console - Verificar Sign-in Methods

**En Firebase Console → Authentication → Sign-in method:**

- ✅ **Google**: Debe estar habilitado (ya lo veo en las imágenes)
- ⚠️ **Apple**: Necesitas habilitarlo si no está habilitado
  - Ve a Authentication → Sign-in method
  - Haz clic en "Apple"
  - Habilita el proveedor
  - Guarda los cambios

### 2. Apple Developer - Configurar Sign In with Apple

**En Apple Developer Portal:**

1. **App ID Configuration:**
   - Ve a [developer.apple.com](https://developer.apple.com)
   - Certificates, Identifiers & Profiles → Identifiers
   - Selecciona tu App ID: `com.versaluna.hangovershield`
   - Habilita "Sign In with Apple" capability
   - Guarda los cambios

2. **Service ID (para Firebase):**
   - Crea un Service ID en Apple Developer
   - Configura los dominios y redirect URLs según las instrucciones de Firebase
   - Firebase te dará las URLs exactas cuando habilites Apple Sign-In

### 3. Firebase Console - Configurar Apple Sign-In

**En Firebase Console:**

1. Ve a Authentication → Sign-in method → Apple
2. Habilita Apple Sign-In
3. Firebase te pedirá:
   - **Service ID** (de Apple Developer)
   - **OAuth Code Flow Configuration** (Firebase te guiará)
   - **Key ID** y **Private Key** (si usas JWT)

### 4. Verificar OAuth Client IDs en Firebase

**En Firebase Console → Project Settings → Your apps:**

- ✅ **iOS App**: Client ID configurado (`251175596798-i2k3l2od98f1rucpuuvgcple05t4cv13`)
- ✅ **Android App**: Client ID configurado (`251175596798-7gm1psc5s4ls18kdqq5v85hmc3rq5cf5`)
- ✅ **Web App**: Client ID configurado (`1013028346504-lujh3n7etd4oum5e9df3b9cnmsu8apdn`)

**Verifica que estos Client IDs estén correctos en `app.config.ts`**

### 5. Actualizar app.config.ts con valores reales (si es necesario)

Si los Client IDs en las imágenes son diferentes a los que están en `app.config.ts`, actualízalos:

```typescript
extra: {
  googleIosClientId: '251175596798-i2k3l2od98f1rucpuuvgcple05t4cv13.apps.googleusercontent.com',
  googleAndroidClientId: '251175596798-7gm1psc5s4ls18kdqq5v85hmc3rq5cf5.apps.googleusercontent.com',
  googleWebClientId: '1013028346504-lujh3n7etd4oum5e9df3b9cnmsu8apdn.apps.googleusercontent.com',
}
```

### 6. Configurar SHA Certificate Fingerprints (Android)

**Para Google Sign-In en Android:**

1. Ve a Firebase Console → Project Settings → Your apps → Android app
2. En "SHA certificate fingerprints", agrega:
   - **Debug keystore SHA**: Para desarrollo
   - **Release keystore SHA**: Para producción

**Obtener SHA fingerprint:**

```bash
# Debug (desarrollo)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release (producción)
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

### 7. Verificar que los archivos de configuración estén en la raíz

Asegúrate de que estos archivos estén en `/app/`:

- ✅ `GoogleService-Info.plist` (iOS)
- ✅ `google-services.json` (Android)

Expo los copiará automáticamente durante el build gracias a la configuración en `app.config.ts`:

```typescript
ios: {
  googleServicesFile: './GoogleService-Info.plist',
},
android: {
  googleServicesFile: './google-services.json',
}
```

## 📋 Checklist Final

- [ ] Google Sign-In habilitado en Firebase Console
- [ ] Apple Sign-In habilitado en Firebase Console
- [ ] App ID configurado en Apple Developer con "Sign In with Apple"
- [ ] Service ID creado en Apple Developer (si Firebase lo requiere)
- [ ] SHA fingerprints agregados en Firebase (Android)
- [ ] OAuth Client IDs verificados en `app.config.ts`
- [ ] Archivos `GoogleService-Info.plist` y `google-services.json` en `/app/`

## 🧪 Probar la autenticación

Una vez configurado todo:

1. **Google Sign-In:**
   - Debería funcionar en iOS, Android y Web
   - El componente `GoogleSignInButton` maneja todo automáticamente

2. **Apple Sign-In:**
   - Solo funciona en iOS (dispositivos físicos o simulador con iOS 13+)
   - El componente `AppleSignInButton` solo se muestra en iOS

## 🚨 Notas Importantes

1. **Managed Flow de Expo**: Los archivos de configuración (`GoogleService-Info.plist` y `google-services.json`) se copian automáticamente durante `expo prebuild` o `eas build`. No necesitas hacer nada manual.

2. **Apple Sign-In en Simulador**: Funciona en simuladores de iOS 13+ pero requiere estar logueado con un Apple ID en el simulador.

3. **Google Sign-In en Web**: Requiere que el `webClientId` esté correctamente configurado.

4. **Testing**: Para probar en desarrollo, usa `expo start` y luego `expo run:ios` o `expo run:android` para builds nativos.

## 📞 Si algo no funciona

1. Verifica los logs en la consola de Expo
2. Revisa Firebase Console → Authentication → Users para ver si se crean usuarios
3. Verifica que los Client IDs en `app.config.ts` coincidan con Firebase Console
4. Asegúrate de que los archivos de configuración estén en la ubicación correcta







