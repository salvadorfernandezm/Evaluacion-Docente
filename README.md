# Sistema de Evaluación Docente - Posgrado UJED

Sistema web completo para la evaluación docente del Posgrado en Psicología y Terapia de la Comunicación Humana de la UJED.

## 🚀 Características

- ✅ Evaluación anónima y confidencial
- ✅ Gestión de múltiples maestrías y especialidades
- ✅ Manejo de períodos semestrales (2026A, 2026B, etc.)
- ✅ Sistema de materias compartidas
- ✅ 17 reactivos con escala 0-10
- ✅ Panel de administración completo
- ✅ Reportes individuales en PDF con IA
- ✅ Reporte ejecutivo para autoridades
- ✅ Exportación a Excel/CSV
- ✅ Responsive (funciona en móvil, tablet y computadora)

## 📋 Requisitos Previos

- Node.js 18+ (Descargar de: https://nodejs.org/)
- Cuenta de Supabase (ya tienes una)
- Git (opcional, para control de versiones)

## 🔧 Instalación

### Paso 1: Descargar el Proyecto

Si tienes el código en un ZIP, descomprímelo en una carpeta.

### Paso 2: Instalar Dependencias

Abre una terminal/consola en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las librerías necesarias (React, Supabase, etc.)

### Paso 3: Configurar Supabase

1. **Ir a tu proyecto de Supabase**: https://supabase.com/dashboard

2. **Crear las tablas de la base de datos**:
   - Ve a la sección "SQL Editor"
   - Copia todo el contenido del archivo `database/schema.sql`
   - Pégalo en el editor y ejecuta

3. **Verificar que las credenciales estén correctas**:
   - Abre el archivo `src/config/supabase.js`
   - Verifica que la URL y la API Key coincidan con las de tu proyecto

### Paso 4: Ejecutar el Proyecto

```bash
npm run dev
```

El sistema se abrirá automáticamente en tu navegador en: http://localhost:3000

## 👤 Credenciales de Acceso

### Usuario Administrador:
- **Usuario**: admin
- **Contraseña**: posgrado2026

## 📱 Uso del Sistema

### Para Alumnos:

1. Entrar a la página principal
2. Clic en "Comenzar Evaluación"
3. Aceptar consentimiento informado
4. Llenar datos personales
5. Seleccionar maestría
6. Evaluar profesores del área básica
7. Seleccionar especialidad (si aplica)
8. Evaluar profesores de especialidad
9. Evaluar materias compartidas (si aplica)
10. Confirmar y enviar

### Para Administradores:

1. Ir a `/admin/login`
2. Iniciar sesión con las credenciales
3. Acceder al panel de administración

**Funciones del Admin:**
- 📊 Ver dashboard con estadísticas
- 📅 Gestionar períodos semestrales
- 🎓 Crear/editar maestrías y especialidades
- 👨‍🏫 Gestionar profesores y materias
- 📋 Ver todas las evaluaciones
- 📄 Generar reportes en PDF
- 💾 Exportar datos a Excel/CSV

## 🗂️ Estructura del Proyecto

```
evaluacion-docente/
├── public/                 # Archivos públicos
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── layout/       # Layout del admin
│   │   └── student/      # Componentes del flujo del alumno
│   ├── config/           # Configuración (Supabase)
│   ├── constants/        # Constantes (reactivos, textos)
│   ├── pages/            # Páginas principales
│   │   ├── admin/       # Páginas del administrador
│   │   └── student/     # Páginas del estudiante
│   ├── store/            # Estado global (Zustand)
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── database/
│   └── schema.sql        # Script SQL para Supabase
├── package.json          # Dependencias del proyecto
└── README.md            # Este archivo
```

## 🎨 Personalización

### Cambiar Logo:
En los archivos que usan el logo, busca:
```javascript
<img src="https://www.genspark.ai/api/files/s/PQ0EbNzP" />
```

Y reemplaza la URL con la de tu logo.

### Cambiar Colores:
Edita el archivo `tailwind.config.js` en la sección `colors.primary`.

### Modificar Reactivos:
Edita el archivo `src/constants/reactivos.js`.

## 📦 Construcción para Producción

Cuando estés listo para publicar:

```bash
npm run build
```

Esto genera una carpeta `dist/` con todos los archivos optimizados listos para subir a un servidor.

### Opciones de Hosting Gratuito:

1. **Vercel** (Recomendado):
   - https://vercel.com
   - Conecta tu repositorio o sube la carpeta `dist/`
   - Deploy automático

2. **Netlify**:
   - https://netlify.com
   - Arrastra la carpeta `dist/` a su interfaz

3. **GitHub Pages**:
   - Gratis con tu cuenta de GitHub
   - Requiere configuración adicional

## 🐛 Solución de Problemas

### Error al instalar dependencias:
```bash
# Limpiar caché e intentar de nuevo
npm cache clean --force
npm install
```

### Error de conexión a Supabase:
- Verifica que las credenciales en `src/config/supabase.js` sean correctas
- Asegúrate de que las tablas estén creadas en Supabase

### La aplicación no carga:
```bash
# Borrar node_modules y reinstalar
rm -rf node_modules
npm install
npm run dev
```

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador (F12 → Console)
2. Verifica la consola de terminal donde ejecutaste `npm run dev`
3. Asegúrate de que todas las tablas estén creadas en Supabase

## 🔄 Próximas Mejoras

- [ ] Implementar generación de reportes PDF con IA
- [ ] Agregar sistema de notificaciones por email
- [ ] Dashboard con gráficas interactivas
- [ ] Exportación avanzada con filtros
- [ ] Sistema de backup automático
- [ ] Modo oscuro

## 📄 Licencia

Este proyecto fue desarrollado específicamente para el Posgrado de Psicología y Comunicación Humana de la UJED.

## 👨‍💻 Desarrollo

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Estado Global**: Zustand
- **Routing**: React Router DOM
- **Iconos**: Lucide React

---

**Desarrollado con ❤️ para la UJED**

¿Necesitas ayuda? Contacta a la coordinación del posgrado.
