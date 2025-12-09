# Hangover Shield - Landing Page

Una landing page premium para la app móvil Hangover Shield, construida con Next.js 14+, TypeScript, Tailwind CSS v4 y Framer Motion.

## 🎨 Características

- **Diseño Glassmorphism Premium**: Interfaz moderna y sofisticada con efectos de vidrio esmerilado
- **Animaciones Suaves**: Transiciones elegantes con Framer Motion
- **Responsive**: Completamente optimizado para mobile, tablet y desktop
- **Accesibilidad**: Jerarquía de headings correcta y semántica HTML
- **TypeScript**: Código completamente tipado para mayor seguridad
- **Dark Mode Ready**: Arquitectura preparada para soporte de modo oscuro futuro

## 🚀 Tecnologías

- **Next.js 14+** - Framework React con App Router
- **TypeScript** - Lenguaje de programación tipado
- **Tailwind CSS v4** - Framework de utilidades CSS
- **Framer Motion** - Biblioteca de animaciones
- **React 19** - Interfaz de usuario
- **PostCSS** - Herramienta de transformación CSS

## 📁 Estructura del Proyecto

```
web/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de inicio
│   ├── globals.css         # Estilos globales
│   ├── privacy/
│   │   └── page.tsx        # Política de privacidad
│   └── terms/
│       └── page.tsx        # Términos y condiciones
├── components/
│   ├── Navbar.tsx          # Barra de navegación sticky
│   ├── Hero.tsx            # Sección hero con mockup iPhone
│   ├── Problem.tsx         # Sección de problemas
│   ├── HowItWorks.tsx      # Sección "Cómo funciona" (Antes/Durante/Después)
│   ├── IntelligentPlan.tsx # Sección de plan inteligente
│   ├── WhyItWorks.tsx      # Sección "Por qué funciona"
│   ├── Pricing.tsx         # Planes y precios
│   ├── DownloadSection.tsx # CTA de descarga y formulario de email
│   └── Footer.tsx          # Pie de página
├── tailwind.config.ts      # Configuración de Tailwind
├── postcss.config.js       # Configuración de PostCSS
├── next.config.js          # Configuración de Next.js
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias del proyecto
```

## 🎨 Paleta de Colores

- **Serenity Mint** `rgb(214 245 234)` - Frescura y recuperación
- **Soft Sky Blue** `rgb(207 232 255)` - Cielo calmado, claridad mental
- **Deep Teal** `rgb(15 63 70)` - Color principal para CTAs
- **Glow Coral** `rgb(255 154 139)` - Accent emocional
- **Lime Mist** `rgb(233 255 204)` - Detalles de frescura

## 🚀 Instalación y Uso

### Requisitos Previos

- Node.js 18.17 o superior
- npm o yarn

### Instalación

```bash
cd web
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. El sitio se recargará automáticamente cuando hagas cambios.

### Build para Producción

```bash
npm run build
npm start
```

## 📱 Componentes Principales

### Navbar
- Sticky en desktop
- Logo + texto "Hangover Shield"
- Links de navegación: How It Works, Smart Plan, Pricing, FAQ
- CTA "Download App" que ancla a la sección de descarga

### Hero
- Título impactante con degradado
- Subtítulo explicativo
- Dos CTAs principales
- Texto de prueba social
- Mockup animado de iPhone con UI de la app

### Problem
- Sección que agita el problema sin ser dramática
- Tres "píldoras" de problemas (Hangxiety, Energía, Culpa)

### HowItWorks
- Tres columnas: Antes, Durante, Después
- Iconografía simple
- Descripción clara de beneficios

### IntelligentPlan
- Tarjeta grande con plan de hoy por bloques de tiempo
- Botón "Unlock Smart Plan"
- Información sobre precio de subscripción

### WhyItWorks
- 4 cards con razones por las que funciona
- Íconos emoji
- Copy convincente

### Pricing
- Dos planes: Monthly ($0.99) y Yearly ($11.99)
- Plan anual destacado visualmente
- Beneficios listados

### DownloadSection
- Botones de App Store y Google Play (placeholders)
- Formulario de email con validación
- Manejo de submit con console.log (preparado para Firebase)

### Footer
- Links a Privacy, Terms, Support
- Copyright year dinámico

## 🎬 Animaciones

- Fade in de secciones al scroll
- Slide up de elementos con stagger
- Float suave del mockup del iPhone
- Hover effects en botones
- Smooth transitions en todos los elementos

## 🔧 Configuración de Tailwind

Se han añadido colores personalizados, fonts, espaciados y animaciones en `tailwind.config.ts`. Todos los colores están basados en RGB para compatibilidad con opacity (ej: `bg-white/40`).

## 📝 Variables de Entorno

Actualmente no hay variables de entorno requeridas. Cuando integres Firebase más adelante, deberás crear un archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

## 🚀 Próximos Pasos

- [ ] Integración con Firebase para manejo de emails
- [ ] Agregar formulario de contacto
- [ ] Implementar i18n completo (inglés/español)
- [ ] Optimizar imágenes y assets
- [ ] Agregar Open Graph images
- [ ] Implementar analytics (Google Analytics, Mixpanel, etc.)
- [ ] Tests con Jest y React Testing Library
- [ ] Mejorar accesibilidad (WCAG AAA)
- [ ] Agregar soporte para dark mode

## 📞 Soporte

Para preguntas o soporte, contacta: support@hangovershield.co

## 📄 Licencia

Todos los derechos reservados © 2025 Hangover Shield.
