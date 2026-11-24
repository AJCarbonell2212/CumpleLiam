# Cumpleaños de Liam

Invitación web interactiva (temática vaquero y granja) para el primer cumpleaños de Liam, con RSVP, música y panel de invitaciones.

- `index.html`: la invitación (atrapar al caballo, música, confirmación de asistencia).
- `admin.html`: panel para agregar invitados, enviarles su enlace por WhatsApp y descargar el Excel.
- `config.js`: aquí va la URL del Apps Script.
- `apps-script/Code.gs`: el código que guarda las respuestas en Google Sheets.

## Publicar

Settings › Pages › Deploy from a branch › `main` / `(root)`.

## Conectar el RSVP (una sola vez)

1. Crea una hoja nueva en Google Sheets.
2. Extensiones › Apps Script. Borra lo que haya y pega `apps-script/Code.gs`.
3. En la línea `const ADMIN_KEY = ...` pon la clave del panel. (No la guardes en este repo: es público.)
4. Implementar › Nueva implementación › Tipo: App web. Ejecutar como: Yo. Quién tiene acceso: Cualquier persona. Autoriza los permisos.
5. Copia la URL que termina en `/exec` y pégala en `config.js` en `SCRIPT_URL`.

Las respuestas quedan en las pestañas **Confirmaciones** e **Invitados** de la hoja. El panel (`/admin.html`) las muestra y las descarga en Excel.

## Enlaces personalizados

El panel genera enlaces como `https://<usuario>.github.io/CumpleLiam/?para=Juan&id=abc123`. La invitación saluda a la persona por su nombre y asocia su respuesta.
