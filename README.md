# Frontend

Base limpia para comenzar un nuevo proyecto con Angular y Tailwind CSS.

## Requisitos

- Node.js 24.15.0 (documentado en `.nvmrc`).
- npm 11.12.1.

## Desarrollo

Instala las dependencias y levanta el servidor local:

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200/`.

## Comandos

- `npm start`: inicia el servidor de desarrollo.
- `npm run build`: genera la versión de producción.
- `npm test`: ejecuta las pruebas unitarias.
- `npm run watch`: compila en modo desarrollo y observa cambios.
- `npx ng generate component nombre`: crea un componente.

## Inicio de sesión

La primera funcionalidad se encuentra en `/login` y utiliza un componente standalone con carga
diferida, Typed Reactive Forms y validaciones locales. Por ahora funciona exclusivamente en modo
demostración y no realiza solicitudes HTTP.

La implementación está organizada por funcionalidad en `src/app/features/auth/pages/login`.
