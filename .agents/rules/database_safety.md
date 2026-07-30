# Regla de Seguridad para Modificaciones de Bases de Datos

## Contexto del Proyecto
Este espacio de trabajo interactúa con tres entornos de base de datos distintos:
1. **PLANIX1**: Instancia de Supabase Autoalojada (`https://api.planix.do/`).
2. **KLYNN**: Instancia de Supabase Cloud (ID/Ref: `lqtjwcphidbwiwrnqbac`).
3. **Planix**: Base de datos de Cloudflare D1 (administrada a través de Wrangler).

## Guardarraíl de Comportamiento Obligatorio
* **SIEMPRE** debes solicitar confirmación explícita y escrita del usuario antes de realizar cualquier acción que modifique, inserte, elimine o actualice tablas, datos, esquemas, o ejecute migraciones/SQL en cualquiera de los entornos descritos.
* Si el usuario te pide realizar una modificación directa (por ejemplo, mediante una herramienta de MCP o un comando de terminal), confirma primero el entorno de destino exacto y pide confirmación de seguridad antes de continuar.
