# Reynal-GYM (interfaz inicial)

Proyecto inicial creado con Vite + React. Esta rama contiene una UI mínima para gestionar autenticación local (sin backend) y navegación.

Características añadidas en este commit:

- Chakra UI para componentes y diseño
- React Router DOM para rutas (/login, /register, /dashboard)
- Framer Motion instalado (para animaciones futuras)
- Autenticación simulada con Web Crypto API (hash SHA-256 + salt) y localStorage

Rutas disponibles:

- `/login` — iniciar sesión
- `/register` — crear cuenta (almacenada en localStorage)
- `/dashboard` — panel protegido (redirige a login si no hay sesión)

Instalación y ejecución:

```powershell
npm install
npm run dev
```

Notas técnicas:

- Los usuarios y la sesión se guardan en `localStorage` (claves: `rg_users`, `rg_session`).
- Los métodos de autenticación están en `src/utils/auth.js`.
- Página principal y rutas en `src/App.jsx`. Páginas en `src/pages/`.

Siguientes pasos sugeridos:

- Validaciones de formularios y UX (campos obligatorios, fuerza de contraseña)
- Integrar API/ backend real y reemplazar localStorage
- Agregar pruebas unitarias y E2E
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# gimnasio
