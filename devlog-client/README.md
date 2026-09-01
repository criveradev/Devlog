# Devlog Client

SPA de Devlog construida con React 19, Vite 8 y Tailwind CSS 4. Consume el
contrato HTTP estable de la API bajo `/api/v1` y mantiene la sesión mediante una
cookie `HttpOnly` enviada con credenciales CORS.

## Requisitos

- Node.js 20.19 o superior
- npm 10 o superior
- Backend Devlog disponible en `http://localhost:5050`, o Docker Desktop

## Configuración

```bash
npm ci
cp .env.example .env
npm run dev
```

`VITE_API_URL` contiene únicamente el origen del backend, sin `/api/v1`. Si se
omite durante el desarrollo, Vite envía `/api` a `http://127.0.0.1:5050` mediante
su proxy local.

```env
VITE_API_URL=http://localhost:5050
```

## Scripts

| Comando | Propósito |
| ------- | --------- |
| `npm run dev` | Servidor Vite con recarga en caliente |
| `npm run lint` | Análisis estático con ESLint |
| `npm test` | Pruebas unitarias y de componentes con Vitest |
| `npm run test:watch` | Vitest en modo interactivo |
| `npm run build` | Build optimizado de producción |
| `npm run preview` | Vista previa del build |
| `npm run test:e2e` | Flujos E2E de escritorio y móvil con Playwright |
| `npm run test:e2e:ui` | Playwright en modo interactivo |

La ejecución E2E reproducible del stack completo se orquesta desde el backend:

```bash
cd ../devlog-server
npm run docker:e2e
```

El reporte queda en `devlog-client/playwright-report/` y los artefactos de error
en `devlog-client/test-results/`.

### 👨🏻‍💻 Developed by

<p align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://res.cloudinary.com/docscluster/image/upload/v1782698757/logo-dark_qddsa3.svg">
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://res.cloudinary.com/docscluster/image/upload/v1782698757/logo-light_wilpp4.svg">
    <img
      alt="criveradev"
      src="https://res.cloudinary.com/docscluster/image/upload/v1782698757/logo-light_wilpp4.svg"
      width="200">
  </picture>
</p>
