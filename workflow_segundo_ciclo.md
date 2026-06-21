# Guía de Flujo de Trabajo (Workflow) para el Segundo Ciclo de Primaria

Esta guía detalla los pasos técnicos necesarios para ampliar la migración e integrar los contenidos de **4to, 5to y 6to Grado de Primaria** para las asignaturas **Sociales, Naturales, Formación Humana, Educación Física y Artística** en el futuro.

## Arquitectura de Datos

Los contenidos se almacenan en la tabla `custom_units` de Cloudflare D1 en formato JSON serializado bajo la columna `content`. La estructura del JSON sigue la interfaz TypeScript `Unit` definida en `src/lib/data/unitCurriculum.ts`.

---

## Pasos para Integrar el Segundo Ciclo (4to, 5to y 6to)

### Paso 1: Actualizar el Script de Migración

1. Abre el script de migración en [migrate_supabase_to_d1.js](file:///c:/Users/Yeri%20Orlando/Desktop/Planix%20Nuevo/Planix%20Claudflare/Planix1/scratch/migrate_supabase_to_d1.js).
2. Localiza la constante `TARGET_GRADES`:
   ```javascript
   const TARGET_GRADES = new Set(['1ro', '2do', '3ro']);
   ```
3. Modifícala para añadir los grados del segundo ciclo:
   ```javascript
   const TARGET_GRADES = new Set(['1ro', '2do', '3ro', '4to', '5to', '6to']);
   ```

### Paso 2: Volver a Ejecutar la Migración

1. Abre una consola de comandos en el directorio del proyecto.
2. Ejecuta el script para volver a descargar la información de Supabase y generar el archivo SQL con todos los grados:
   ```bash
   node scratch/migrate_supabase_to_d1.js
   ```
   *El script generará un archivo SQL con más registros de unidades en `scratch/migrate_units.sql`.*
3. Sube el nuevo archivo SQL a tu base de datos de Cloudflare D1 usando Wrangler:
   ```bash
   npx wrangler d1 execute planix-db --remote --file=./scratch/migrate_units.sql
   ```

### Paso 3: Habilitar los Grados en la Interfaz de Administración

1. Abre el componente en [AdminCurriculum.tsx](file:///c:/Users/Yeri%20Orlando/Desktop/Planix%20Nuevo/Planix%20Claudflare/Planix1/src/pages/AdminCurriculum.tsx).
2. Localiza la constante `UNIT_GRADES` (alrededor de la línea 144):
   ```typescript
   const UNIT_GRADES = [
     { id: '1ro', name: '1er Grado de Primaria' },
     { id: '2do', name: '2do Grado de Primaria' },
     { id: '3ro', name: '3er Grado de Primaria' }
   ];
   ```
3. Añade los grados correspondientes al segundo ciclo de primaria:
   ```typescript
   const UNIT_GRADES = [
     { id: '1ro', name: '1er Grado de Primaria' },
     { id: '2do', name: '2do Grado de Primaria' },
     { id: '3ro', name: '3er Grado de Primaria' },
     { id: '4to', name: '4to Grado de Primaria' },
     { id: '5to', name: '5to Grado de Primaria' },
     { id: '6to', name: '6to Grado de Primaria' }
   ];
   ```

### Paso 4: Validar en el Entorno Local / Producción

1. Levanta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
2. Navega a la ruta de administración `/admin/curriculum`.
3. Selecciona la pestaña **Gestor de Temas (Unidades)**.
4. Usa los desplegables para verificar que los nuevos grados (4to, 5to, 6to) se muestren y carguen sus unidades de manera correcta.
