# INSTRUCCIONES PARA CONFIGURAR SUPABASE

## 📋 Paso a Paso para Crear tu Base de Datos

### 1. Acceder a Supabase

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Verás tu proyecto: `ergadtdtyptueyeuegcf`

### 2. Borrar Tablas Antiguas (si las hay)

1. En el panel izquierdo, haz clic en **"Table Editor"**
2. Si hay tablas de proyectos anteriores, elimínalas:
   - Haz clic derecho en cada tabla
   - Selecciona "Delete table"
   - Confirma la eliminación

### 3. Ejecutar el Script SQL

1. En el panel izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**
3. Abre el archivo `database/schema.sql` de este proyecto
4. **Copia todo el contenido** del archivo
5. **Pégalo** en el editor SQL de Supabase
6. Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)

### 4. Verificar que las Tablas se Crearon

1. Ve a **"Table Editor"**
2. Deberías ver estas 6 tablas:
   - ✅ `periodos`
   - ✅ `maestrias`
   - ✅ `especialidades`
   - ✅ `profesores`
   - ✅ `evaluaciones`
   - ✅ `admin_users`

### 5. Verificar Datos Iniciales

1. Haz clic en la tabla **`periodos`**
2. Deberías ver un registro: **2026A** (activo: true)

3. Haz clic en la tabla **`admin_users`**
4. Deberías ver un registro: **admin** / **posgrado2026**

## ⚙️ Configuración de Políticas de Seguridad (RLS)

Por defecto, Supabase tiene Row Level Security (RLS) activado. Para este proyecto, necesitamos configurarlo:

### Opción 1: Deshabilitar RLS (Más Simple)

**Para cada tabla** (periodos, maestrias, especialidades, profesores, evaluaciones, admin_users):

1. Ve a **"Authentication" → "Policies"**
2. Selecciona la tabla
3. Si RLS está habilitado, haz clic en **"Disable RLS"**

### Opción 2: Configurar Políticas (Más Seguro)

Si prefieres mantener RLS activo, ejecuta este SQL:

```sql
-- Permitir lectura pública en ciertas tablas
ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE maestrias ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Permitir lectura pública" ON periodos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON maestrias FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON especialidades FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON profesores FOR SELECT USING (true);

-- Permitir insertar evaluaciones (alumnos)
CREATE POLICY "Permitir insertar evaluaciones" ON evaluaciones FOR INSERT WITH CHECK (true);

-- Solo lectura para evaluaciones (se necesitará autenticación para leer)
-- Esto lo manejarás desde el admin con credenciales
```

## 🧪 Probar la Conexión

1. Abre el proyecto en tu navegador: http://localhost:3000
2. Deberías ver la página principal
3. Si no hay errores en la consola (F12), ¡todo funciona!

## 📝 Agregar Datos de Prueba

Para probar el sistema, puedes agregar datos manualmente:

### Agregar una Maestría:

```sql
INSERT INTO maestrias (nombre, activa, periodo_id)
VALUES (
  'Maestría en Psicología Clínica',
  true,
  (SELECT id FROM periodos WHERE nombre = '2026A')
);
```

### Agregar una Especialidad:

```sql
INSERT INTO especialidades (nombre, maestria_id, activa)
VALUES (
  'Terapia Cognitivo-Conductual',
  (SELECT id FROM maestrias WHERE nombre = 'Maestría en Psicología Clínica'),
  true
);
```

### Agregar un Profesor:

```sql
INSERT INTO profesores (
  nombre_completo,
  materia,
  maestria_id,
  es_basica,
  es_compartida,
  periodo_id
)
VALUES (
  'Dr. Juan Pérez García',
  'Fundamentos de Psicología',
  (SELECT id FROM maestrias WHERE nombre = 'Maestría en Psicología Clínica'),
  true,
  false,
  (SELECT id FROM periodos WHERE nombre = '2026A')
);
```

## 🔍 Verificar Datos en Tiempo Real

Mientras el sistema está corriendo:

1. Ve a Supabase → **"Table Editor"**
2. Selecciona una tabla
3. Actualiza la página (F5) para ver nuevos registros
4. Puedes editar/eliminar registros directamente desde aquí

## ❗ Problemas Comunes

### Error: "relation already exists"
- Ya ejecutaste el script antes
- Solución: Borra las tablas y vuelve a ejecutar el script

### Error: "permission denied"
- Problema de permisos RLS
- Solución: Deshabilita RLS (ver Opción 1 arriba)

### Error: "Failed to fetch"
- Problema de conexión
- Verifica las credenciales en `src/config/supabase.js`

## ✅ Lista de Verificación

Antes de usar el sistema, verifica:

- [ ] 6 tablas creadas en Supabase
- [ ] Período 2026A existe y está activo
- [ ] Usuario admin creado
- [ ] RLS deshabilitado O políticas configuradas
- [ ] Aplicación corre sin errores en consola
- [ ] Puedes ver la página principal

---

**¿Todo listo?** ¡Ahora puedes empezar a usar el sistema! 🎉
