<div align="center">

# 🌐 Devlog

**Red social**

Una aplicación web completa donde los usuarios pueden publicar contenido,
interactuar con otros y construir su red de seguidores.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

🔗 **[Ver demo en vivo](https://devlog.criveradev.com)** &nbsp;·&nbsp;
📡 **[API en producción](https://api.devlog.criveradev.com/health)** &nbsp;·&nbsp;
🐛 **[Reportar bug](https://github.com/criveradev/Devlog/issues)**

<br/>

> ⚠️ El backend está en Render plan gratuito.
> La primera petición puede tardar ~30 segundos si el servidor estuvo inactivo.

</div>

---

## 📋 Tabla de contenidos

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Diseño del frontend](#-diseño-del-frontend)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Primeros pasos](#-primeros-pasos)
- [Variables de entorno](#-variables-de-entorno)
- [Docker](#-docker)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Pruebas](#-pruebas)
- [Contrato y observabilidad](#-contrato-y-observabilidad)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)
- [Developed by](#-developed-by)

---

## 🎯 Sobre el proyecto

**Devlog** es un proyecto full-stack desarrollado como primer proyecto profesional
para portafolio. El objetivo fue aplicar las bases del desarrollo web moderno:
construcción de una API REST segura, modelado de datos con MongoDB, autenticación stateless
con JWT almacenado en una cookie segura y una interfaz reactiva con React.

El proyecto cubre los conceptos fundamentales que se encuentran en cualquier aplicación real:
autenticación, CRUD completo, relaciones entre datos, subida de archivos a CDN y despliegue
en la nube con CI/CD automático.

---

## ✨ Funcionalidades

### 👤 Usuarios

- Registro e inicio de sesión con contraseñas hasheadas (bcrypt)
- Contraseñas de entre 12 y 128 caracteres en alta, cambio y recuperación
- Autenticación stateless con JWT en cookie `HttpOnly`, `SameSite=Strict` y `Secure` en producción
- Perfil con avatar, nombre de usuario y biografía
- Edición de perfil con cambio de avatar en tiempo real
- Verificación de email y recuperación de contraseña mediante Resend
- En v1 la verificación identifica cuentas confirmadas, pero no bloquea la publicación
- Cambio seguro de contraseña y email con revocación de sesiones
- Eliminación integral de cuenta y contenido asociado

### 📝 Publicaciones

- Crear, editar y eliminar publicaciones
- Subida de imágenes a Cloudinary con drag & drop
- Feed paginado por cursor con carga progresiva
- Vista previa de imagen antes de publicar

### ❤️ Interacciones

- Sistema de likes idempotente con actualización optimista
- Comentarios con eliminación por autor
- Sistema de seguidores bidireccional (follow / unfollow)
- Contador de seguidores y seguidos en el perfil

### 🎨 Experiencia de usuario

- Interfaz moderna basada en una paleta índigo y slate, superficies translúcidas y gradientes sutiles
- Layout adaptativo: una columna en móvil, panel contextual en escritorio y navegación lateral en pantallas amplias
- Navegación inferior móvil con acceso directo al feed, publicación y perfil
- Pantallas de autenticación, recuperación y verificación con un lenguaje visual consistente
- Feed personalizado con acceso rápido para crear publicaciones
- Skeletons animados con efecto shimmer durante la carga
- Estados vacíos con llamada a la acción
- Notificaciones tipo toast para feedback inmediato
- Menú de usuario responsivo con dropdown en móvil
- Imágenes con fade-in al cargar
- Contador de caracteres en tiempo real al escribir
- Foco visible, etiquetas accesibles, estados ARIA y soporte para movimiento reducido

---

## 🛠 Stack tecnológico

### Backend

| Tecnología     | Versión | Uso                              |
| -------------- | ------- | -------------------------------- |
| Node.js        | 20.x    | Entorno de ejecución             |
| Express        | 5.x     | Framework HTTP                   |
| MongoDB Atlas  | —       | Base de datos NoSQL en la nube   |
| Mongoose       | 9.x     | ODM para modelado de datos       |
| JSON Web Token | 9.x     | Autenticación stateless          |
| bcryptjs       | 3.x     | Hash de contraseñas              |
| Multer         | 2.x     | Manejo de archivos multipart     |
| Cloudinary     | 2.x     | Almacenamiento y CDN de imágenes |
| dotenv         | 17.x    | Variables de entorno             |
| CORS           | 2.x     | Control de acceso entre dominios |
| Helmet         | 8.x     | Cabeceras HTTP de seguridad      |
| express-rate-limit | 8.x | Protección contra abuso          |
| cookie-parser  | 1.x     | Lectura de la cookie de sesión   |
| Resend Email API | —     | Emails transaccionales sin servidor SMTP |
| OpenAPI + Swagger UI | 3.1 / 5.x | Contrato ejecutable y documentación interactiva |

### Frontend

| Tecnología       | Versión | Uso                              |
| ---------------- | ------- | -------------------------------- |
| React            | 19.x    | Librería de interfaz             |
| Vite             | 8.x     | Bundler y servidor de desarrollo |
| Tailwind CSS     | 4.x     | Estilos utilitarios              |
| React Router DOM | 7.x     | Navegación SPA                   |
| Axios            | 1.x     | Cliente HTTP con interceptores   |
| Zustand          | 5.x     | Estado global de autenticación   |
| React Hook Form  | 7.x     | Formularios con validación       |
| React Hot Toast  | 2.x     | Notificaciones                   |
| Vitest + Testing Library | 4.x / 16.x | Pruebas unitarias y de componentes |
| Playwright       | 1.x     | Pruebas end-to-end en escritorio y móvil |

### Infraestructura

| Servicio      | Uso                  | Plan             |
| ------------- | -------------------- | ---------------- |
| MongoDB Atlas | Base de datos        | M0 (gratuito)    |
| Cloudinary    | Imágenes y CDN       | Free (25 GB/mes) |
| Render        | Hosting del backend  | Free (750 h/mes) |
| Vercel        | Hosting del frontend | Hobby (gratuito) |
| Docker        | Entornos reproducibles | Local / CI     |
| GitHub Actions | Integración continua | Free            |
| GitHub        | Repositorio           | Free            |

---

## 🏗 Arquitectura

```
┌─────────────────────┐         ┌──────────────────────┐
│                     │  HTTPS  │                      │
│  Frontend (React)   │────────▶│   Backend (Express)  │
│      devlog.        │◀────────│    api.devlog.       │
│   criveradev.com    │  JSON   │   criveradev.com     │
│                     │         │                      │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                          ┌────────────────┼─────────────────┐
                          │                │                 │
                          ▼                ▼                 ▼
               ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
               │   MongoDB    │  │  Cloudinary  │  │    GitHub    │
               │    Atlas     │  │  (imágenes)  │  │  (CI/CD →    │
               │   (datos)    │  │              │  │ auto-deploy) │
               └──────────────┘  └──────────────┘  └──────────────┘
```

> Ambos dominios (`devlog.criveradev.com` y `api.devlog.criveradev.com`) son
> subdominios propios gestionados en **Cloudflare DNS**, apuntando respectivamente
> a Vercel y Render mediante registros CNAME.

### Arquitectura del backend por capas

```
Petición HTTP
     │
     ▼
┌─────────────┐
│   ROUTES    │  Define URLs y conecta con controladores
├─────────────┤
│ MIDDLEWARE  │  JWT cookie · Rate limiting · Uploads · Errores
├─────────────┤
│ CONTROLLERS │  Traducción entre HTTP y casos de uso
├─────────────┤
│  SERVICES   │  Reglas de aplicación y transacciones
├─────────────┤
│   MODELS    │  Persistencia: User · Post · Like · Follow...
├─────────────┤
│  MONGODB    │  Persistencia en Atlas
└─────────────┘
```

---

## 🖥 Diseño del frontend

El frontend utiliza un sistema visual propio construido sobre Tailwind CSS 4. La
interfaz mantiene los componentes funcionales de React desacoplados de los estilos
compartidos y evita depender de una librería visual adicional.

### Sistema visual

- **Identidad:** índigo como color principal, slate para texto y superficies claras con profundidad sutil.
- **Componentes base:** `.surface-card`, `.field`, `.btn-primary`, `.btn-secondary` y `.btn-danger` centralizan los patrones reutilizables.
- **Tipografía:** stack de fuentes del sistema, jerarquía compacta y títulos con tracking ajustado.
- **Feedback:** estados hover, disabled, loading, focus y optimistic UI diferenciados visualmente.
- **Movimiento:** transiciones breves y desactivación automática cuando el sistema solicita `prefers-reduced-motion`.

### Comportamiento responsivo

| Vista | Navegación | Distribución |
| ----- | ---------- | ------------ |
| Móvil | Barra inferior fija + menú de usuario | Una columna optimizada para interacción táctil |
| Tablet | Navbar superior | Feed centrado con mayor espacio lateral |
| Escritorio | Navbar + panel contextual | Feed y panel informativo |
| Escritorio amplio | Navbar + sidebar + panel contextual | Layout completo de tres columnas |

Las pantallas públicas utilizan un layout editorial con propuesta de valor y una
tarjeta de autenticación. Las rutas privadas comparten el mismo shell visual para
feed, creación de contenido, perfiles y configuración de seguridad.

---

## 📁 Estructura del proyecto

```
Devlog/
│
├── devlog-server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── api.js                 # Identidad y versión actual de la API
│   │   │   ├── swagger.js             # Carga y validación de OpenAPI
│   │   │   ├── db.js                  # Conexión a MongoDB Atlas
│   │   │   ├── cloudinary.js          # Configuración de Cloudinary
│   │   │   └── environment.js         # Validación del entorno al arrancar
│   │   ├── models/
│   │   │   ├── User.js                # Cuenta y perfil
│   │   │   ├── Post.js                # Publicaciones
│   │   │   ├── Comment.js             # Comentarios
│   │   │   ├── Like.js                # Likes únicos por usuario/post
│   │   │   ├── Follow.js              # Relaciones de seguimiento
│   │   │   └── AccountToken.js        # Verificación y recuperación
│   │   ├── controllers/
│   │   │   ├── authController.js      # HTTP de sesión y usuario actual
│   │   │   ├── userController.js      # Adaptación HTTP de perfiles y follows
│   │   │   ├── postController.js      # Adaptación HTTP de posts y likes
│   │   │   └── commentController.js   # create, getByPost, delete
│   │   ├── services/
│   │   │   ├── authService.js         # Registro, hashing y autenticación
│   │   │   ├── postService.js         # Ciclo de vida y consistencia de posts
│   │   │   ├── commentService.js      # Reglas y autorización de comentarios
│   │   │   ├── profileService.js      # Perfil y ciclo de vida del avatar
│   │   │   ├── feedService.js         # Feed y cursor
│   │   │   ├── interactionService.js  # Likes y follows transaccionales
│   │   │   ├── accountService.js      # Email y recuperación
│   │   │   └── accountDeletionService.js # Borrado integral
│   │   ├── errors/
│   │   │   └── ApplicationError.js    # Errores esperados de aplicación
│   │   ├── routes/
│   │   │   ├── index.js                 # Composición de versiones bajo /api
│   │   │   ├── legacy/                   # Alias sin versión durante la migración
│   │   │   │   └── index.js
│   │   │   └── v1/                       # Contrato HTTP versionado
│   │   │       ├── index.js             # Composición de recursos v1
│   │   │       ├── authRoutes.js
│   │   │       ├── userRoutes.js
│   │   │       ├── postRoutes.js
│   │   │       └── commentRoutes.js
│   │   ├── middleware/
│   │   │   ├── apiDeprecationMiddleware.js # Ciclo de vida del contrato legacy
│   │   │   ├── authMiddleware.js      # Verificación JWT → req.user
│   │   │   ├── uploadMiddleware.js    # Multer en memoria
│   │   │   ├── rateLimitMiddleware.js # Límites para login y registro
│   │   │   ├── requestContextMiddleware.js # Correlación y logging HTTP
│   │   │   ├── swaggerMiddleware.js   # CSP limitada a Swagger UI
│   │   │   └── errorMiddleware.js     # 404 + errores centralizados
│   │   ├── utils/
│   │   │   ├── authCookie.js           # Configuración segura de sesión
│   │   │   └── uploadToCloudinary.js
│   │   ├── app.js                      # Configuración de Express
│   │   └── server.js                   # Arranque y apagado ordenado
│   ├── test/                           # Pruebas unitarias e integración HTTP
│   ├── scripts/                        # Migraciones y orquestación Docker
│   ├── openapi.yaml                    # Contrato OpenAPI 3.1
│   ├── Dockerfile                      # Development, test y production
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── devlog-client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Cliente HTTP con cookies e interceptores
│   │   ├── store/
│   │   │   └── authStore.js           # Estado global con Zustand + persist
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Navbar translúcida y menú de usuario
│   │   │   ├── MobileNav.jsx          # Navegación inferior para móvil
│   │   │   ├── Sidebar.jsx            # Navegación lateral de escritorio
│   │   │   ├── PostCard.jsx           # Tarjeta con likes, comentarios y optimistic UI
│   │   │   ├── AccountSecurityCard.jsx # Password, email y eliminación de cuenta
│   │   │   ├── Skeleton.jsx           # Skeletons animados con efecto shimmer
│   │   │   └── ProtectedRoute.jsx     # Guard de rutas privadas
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx           # Feed por cursor y estados de carga
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── VerifyEmailPage.jsx
│   │   │   ├── CreatePostPage.jsx     # Editor con drag & drop de imágenes
│   │   │   └── ProfilePage.jsx        # Perfil, posts y seguridad de cuenta
│   │   ├── App.jsx                    # Routing y layouts públicos/privados
│   │   ├── main.jsx
│   │   └── index.css                  # Tokens y componentes visuales compartidos
│   ├── e2e/                            # Flujos Playwright
│   ├── playwright.config.js
│   ├── vite.config.js                  # Vite y proxy local de /api
│   ├── nginx.conf                      # Imagen web de producción
│   ├── Dockerfile                      # Development, e2e y production
│   ├── vercel.json                    # Rewrites para React Router
│   ├── .env.example
│   └── package.json
│
├── .github/workflows/ci.yml            # Calidad, tests Docker y E2E
├── docker-compose.yml                  # Aplicación y perfiles de prueba
└── README.md
```

---

## 🚀 Primeros pasos

### Requisitos previos

- **Node.js** v20 o superior — [Descargar](https://nodejs.org/)
- **npm** v10 o superior (incluido con Node)
- **Docker Desktop** con Compose v2 para contenedores y E2E
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuita)
- Cuenta en [Cloudinary](https://cloudinary.com/) (gratuita)
- Cuenta en [GitHub](https://github.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/criveradev/Devlog.git
cd Devlog
```

### 2. Instalar dependencias

```bash
# Backend
cd devlog-server && npm ci

# Frontend
cd ../devlog-client && npm ci
```

### 3. Configurar variables de entorno

```bash
# Backend
cp devlog-server/.env.example devlog-server/.env

# Frontend
cp devlog-client/.env.example devlog-client/.env
```

Edita ambos archivos con tus credenciales (ver sección Variables de entorno).

### 4. Ejecutar en desarrollo

Abre **dos terminales**:

```bash
# Terminal 1 — Backend (http://localhost:5050)
cd devlog-server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd devlog-client && npm run dev
```

### 5. Verificar

Abre `http://localhost:5173`, crea una cuenta y prueba la app.

Para verificar el backend:

```bash
curl http://localhost:5050/health
# → { "status": "ok", "timestamp": "..." }
```

---

## 🔐 Variables de entorno

### Backend — `devlog-server/.env`

```env
# Servidor
PORT=5050
NODE_ENV=development

# Base de datos — MongoDB Atlas → Cluster → Connect → Drivers
MONGO_URI=mongodb+srv://usuario:password@cluster.xxx.mongodb.net/red-social

# JWT — genera con:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=cadena_aleatoria_minimo_32_caracteres
JWT_EXPIRES=7d

# Cloudinary — cloudinary.com → Dashboard → API Keys
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS — URL del frontend en producción (sin barra al final)
CLIENT_URL=https://devlog.criveradev.com

# Observabilidad (opcional; habilita GET /metrics)
METRICS_TOKEN=cadena_aleatoria_para_metricas

# Resend (requerido para verificación y recuperación)
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=Devlog <no-reply@notify.criveradev.com>
```

### Frontend — `devlog-client/.env`

```env
# Origen del backend (opcional; sin /api/v1 — el cliente lo añade)
VITE_API_URL=http://localhost:5050

# En producción:
# VITE_API_URL=https://api.devlog.criveradev.com
```

> ⚠️ **Sin `/api/v1` al final.** El cliente (axios) le añade `/api/v1` a la `baseURL`,
> así que la variable lleva solo el dominio del backend. Si se omite en desarrollo,
> Vite utiliza el proxy `/api` hacia `http://127.0.0.1:5050`.
>
> ⚠️ **Nunca subas archivos `.env` a GitHub.** Están incluidos en `.gitignore`.

---

## 🐳 Docker

La composición local levanta MongoDB 8 como réplica de un nodo, inicializa el
replica set y arranca backend y frontend con recarga en caliente. No utiliza Atlas
ni las credenciales de producción.

```bash
cd devlog-server

# Construir y arrancar la aplicación
npm run docker:up

# Seguir logs de backend y frontend
npm run docker:logs

# Detener los servicios
npm run docker:down
```

| Servicio | URL |
| -------- | --- |
| Frontend | `http://localhost:5173` |
| API | `http://localhost:5050/api/v1` |
| Swagger UI | `http://localhost:5050/api/v1/docs` |
| Liveness | `http://localhost:5050/health` |
| Readiness | `http://localhost:5050/ready` |

Los perfiles `test` y `e2e` son efímeros y se limpian automáticamente al terminar:

```bash
cd devlog-server
npm run docker:test
npm run docker:e2e
```

---

## 🔌 Endpoints de la API

URL base de la versión actual: `https://api.devlog.criveradev.com/api/v1`

### Versionado y ciclo de vida

- `GET /api` publica las versiones soportadas y cuál es la actual.
- `/api/v1` es el contrato estable que deben consumir todas las integraciones nuevas.
- Los aliases anteriores (`/api/auth`, `/api/posts`, `/api/comments` y `/api/users`)
  siguen disponibles temporalmente para evitar una ruptura inmediata.
- Las respuestas legacy incluyen `Deprecation: @1788048000`, conforme a RFC 9745,
  `Link: </api/v1>; rel="successor-version"` y `x-api-deprecated: true`.
- Una versión desconocida, por ejemplo `/api/v2`, responde `404` y nunca utiliza rutas de v1.
- Los cambios compatibles se incorporan dentro de v1; un cambio incompatible exige una
  nueva versión mayor, su propio router y un periodo de migración documentado.
- No se publica `Sunset` hasta definir una fecha real de retirada del contrato legacy.

### 🔑 Autenticación

| Método | Endpoint         | Descripción                    | Auth |
| ------ | ---------------- | ------------------------------ | :--: |
| `POST` | `/auth/register` | Crear cuenta e iniciar sesión  |  —   |
| `POST` | `/auth/login`    | Iniciar sesión                 |  —   |
| `GET`  | `/auth/me`       | Restaurar la sesión actual     |  ✅  |
| `POST` | `/auth/logout`   | Invalidar la cookie de sesión  |  ✅  |
| `POST` | `/auth/verify-email/request` | Enviar verificación | ✅ |
| `POST` | `/auth/verify-email` | Confirmar email | — |
| `POST` | `/auth/forgot-password` | Solicitar recuperación | — |
| `POST` | `/auth/reset-password` | Restablecer contraseña | — |
| `POST` | `/auth/change-password` | Cambiar contraseña y revocar sesiones | ✅ |
| `POST` | `/auth/change-email/request` | Confirmar un nuevo email | ✅ |
| `POST` | `/auth/change-email/confirm` | Aplicar el cambio de email | — |

### 📝 Publicaciones

| Método   | Endpoint                 | Descripción            | Auth |
| -------- | ------------------------ | ---------------------- | :--: |
| `GET`    | `/posts?limit=10&cursor=...` | Feed por cursor      |  ✅  |
| `GET`    | `/posts/:id`             | Ver un post            |  ✅  |
| `POST`   | `/posts`                 | Crear post (form-data) |  ✅  |
| `PUT`    | `/posts/:id`             | Editar post            |  ✅  |
| `DELETE` | `/posts/:id`             | Eliminar post          |  ✅  |
| `PUT`    | `/posts/:id/like`        | Establecer like        |  ✅  |
| `DELETE` | `/posts/:id/like`        | Quitar like            |  ✅  |

### 💬 Comentarios

| Método   | Endpoint                                      | Descripción            | Auth |
| -------- | --------------------------------------------- | ---------------------- | :--: |
| `GET`    | `/comments/post/:postId?page=1&limit=20`      | Comentarios paginados  |  —   |
| `POST`   | `/comments/post/:postId`                      | Crear comentario       |  ✅  |
| `DELETE` | `/comments/:id`                               | Eliminar comentario    |  ✅  |

### 👤 Usuarios

| Método | Endpoint                         | Descripción                  | Auth |
| ------ | -------------------------------- | ---------------------------- | :--: |
| `GET`  | `/users/:id?page=1&limit=10`     | Perfil + posts paginados     |  ✅  |
| `PUT`  | `/users/profile`                 | Editar mi perfil (form-data) |  ✅  |
| `PUT` | `/users/:id/follow`                | Seguir de forma idempotente  |  ✅  |
| `DELETE` | `/users/:id/follow`             | Dejar de seguir              |  ✅  |
| `DELETE` | `/users/account`                | Eliminar mi cuenta confirmando contraseña |  ✅  |

### Autenticación en peticiones protegidas

El cliente web envía automáticamente la cookie `HttpOnly` usando credenciales CORS.
Ni el token ni la identidad del usuario se guardan en `localStorage`; la sesión se
restaura desde el backend y el estado vive únicamente en memoria. Durante
la migración, el backend también acepta tokens Bearer emitidos previamente:

```http
Authorization: Bearer <tu_token_jwt>
```

### Códigos de respuesta

| Código | Significado                   |
| ------ | ----------------------------- |
| `200`  | OK                            |
| `201`  | Creado                        |
| `400`  | Datos inválidos               |
| `401`  | Sin token o token inválido    |
| `403`  | Sin permisos sobre el recurso |
| `404`  | Recurso no encontrado         |
| `409`  | Conflicto con un recurso existente |
| `413`  | Archivo demasiado grande      |
| `422`  | Validación semántica fallida  |
| `429`  | Demasiadas peticiones         |
| `500`  | Error interno del servidor    |

---

## 🧪 Pruebas

El backend utiliza el runner nativo de Node.js e incluye pruebas unitarias, de
integración HTTP y de contrato OpenAPI. Las pruebas de persistencia levantan una
réplica MongoDB efímera; nunca utilizan `MONGO_URI` ni modifican la base configurada.

```bash
cd devlog-server
npm test
npm run test:coverage
```

Validación estática y build del frontend:

```bash
cd devlog-client
npm run lint
npm test
npm run build
```

El E2E de Playwright se ejecuta en escritorio y móvil: registra un usuario real, crea
una publicación, cierra sesión, vuelve a iniciar sesión y verifica el contenido.
Para garantizar reproducibilidad,
la ejecución recomendada utiliza todo el stack Docker:

```bash
cd devlog-server
npm run docker:test
npm run docker:e2e
```

GitHub Actions ejecuta cuatro controles: seguridad del repositorio, calidad del
frontend, tests del backend en Docker y flujo E2E. El reporte HTML de Playwright se
conserva como artifact durante 7 días, incluso cuando el E2E falla.

---

## 📐 Contrato y observabilidad

El contrato fuente está en [`devlog-server/openapi.yaml`](./devlog-server/openapi.yaml).
La versión en ejecución publica:

- Swagger UI: `GET /api/v1/docs`
- Documento JSON: `GET /api/v1/openapi.json`

Ambos viven dentro del router `v1`, de modo que documentación, implementación y
ciclo de vida evolucionan como una sola unidad. El arranque falla si el YAML no se
puede interpretar o si no declara OpenAPI 3.1.0.

El backend separa liveness y readiness:

- `GET /health`: proceso HTTP activo.
- `GET /ready`: confirma que MongoDB está conectado.
- `GET /metrics`: métricas JSON, habilitadas únicamente con `METRICS_TOKEN` y protegidas por Bearer.

---

## 🚢 Despliegue

El proyecto usa **CI/CD automático**: cada `git push origin main` dispara un nuevo
deploy en Render y Vercel simultáneamente sin ningún paso manual.

> ⚠️ **Migración obligatoria para instalaciones existentes:** antes de desplegar
> esta versión ejecuta una sola vez `npm run migrate:relations` desde
> `devlog-server`. La operación es idempotente y mueve los arrays legacy de likes
> y follows a colecciones con índices únicos. Realiza un backup de MongoDB antes.

### Servicios en producción

| Servicio          | URL                                                                 |
| ----------------- | ------------------------------------------------------------------- |
| Frontend (Vercel) | [devlog.criveradev.com](https://devlog.criveradev.com)                |
| Backend (Render)  | [api.devlog.criveradev.com](https://api.devlog.criveradev.com/health) |
| DNS / Dominio     | Cloudflare (registros CNAME hacia Vercel y Render)                  |
| Base de datos     | MongoDB Atlas M0                                                    |
| Imágenes          | Cloudinary                                                          |

### Desplegar tu propia instancia

```bash
# 1. Haz fork del repositorio en GitHub

# 2. Backend → crear Web Service en render.com
#    Root Directory : devlog-server
#    Build Command  : npm install
#    Start Command  : npm start
#    + Agregar todas las variables de entorno

# 3. Frontend → crear proyecto en vercel.com
#    Root Directory : devlog-client
#    Framework      : Vite
#    + Agregar VITE_API_URL con la URL de tu servicio en Render

# 4. Actualizar CLIENT_URL en Render con la URL de Vercel
#    → Render hace redeploy automático

# 5. (Opcional) Dominio propio en Cloudflare
#    - Vercel → Settings → Domains → agrega tu subdominio (ej: app.tudominio.com)
#      → si tu zona DNS ya está en Cloudflare, Vercel puede autorizar y crear
#        el registro CNAME automáticamente
#    - Render → Settings → Custom Domains → agrega tu subdominio de API
#      (ej: api.tudominio.com) y copia el CNAME entregado a Cloudflare
#    - Actualiza CLIENT_URL (Render) y VITE_API_URL (Vercel) con los nuevos
#      dominios — cuidado con incluir siempre el prefijo https://, un origen
#      sin protocolo hace que el backend rechace el CORS
```

---

## 🗺 Roadmap

### v1.1 — Actual ✅

- [x] Autenticación con JWT y bcrypt
- [x] Sesión mediante cookie HttpOnly y restauración automática
- [x] CRUD de publicaciones con imágenes (Cloudinary)
- [x] Sistema de likes con optimistic UI
- [x] Comentarios con eliminación
- [x] Sistema de seguidores bidireccional
- [x] Perfil editable con avatar
- [x] Feed paginado
- [x] Sistema visual moderno y responsivo con Tailwind CSS 4
- [x] Navegación móvil inferior y layout desktop de tres columnas
- [x] Accesibilidad de foco, formularios, estados ARIA y movimiento reducido
- [x] Skeletons, estados vacíos y de error
- [x] Deploy automático (Render + Vercel)
- [x] Rate limiting y cabeceras de seguridad con Helmet
- [x] Pruebas unitarias e integración HTTP
- [x] Paginación de perfiles y comentarios
- [x] Feed por cursor
- [x] Likes y follows en colecciones escalables
- [x] Sesiones revocables
- [x] Verificación de email y recuperación de contraseña
- [x] Cambio de contraseña, email y eliminación integral de cuenta
- [x] Readiness, métricas, OpenAPI y CI

### v1.2 — Próximamente

- [ ] Notificaciones en tiempo real (Socket.io)
- [ ] Búsqueda de usuarios y posts
- [ ] Hashtags y menciones (@usuario)
- [ ] Posts con múltiples imágenes
- [ ] Modo oscuro

### v2.0 — Futuro

- [ ] Caché del feed con Redis
- [ ] App móvil con React Native

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes, abre primero un issue
para discutir qué te gustaría cambiar.

```bash
# 1. Haz fork del proyecto
# 2. Crea tu rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Haz commit con mensaje descriptivo
git commit -m "feat: agrega nueva funcionalidad"

# 4. Haz push a tu rama
git push origin feature/nueva-funcionalidad

# 5. Abre un Pull Request
```

### Convención de commits

| Prefijo     | Uso                        |
| ----------- | -------------------------- |
| `feat:`     | Nueva funcionalidad        |
| `fix:`      | Corrección de bug          |
| `docs:`     | Cambios en documentación   |
| `style:`    | Formato (no afecta lógica) |
| `refactor:` | Refactorización de código  |
| `test:`     | Agrega o modifica tests    |
| `chore:`    | Tareas de mantenimiento    |

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver [`LICENSE`](./LICENSE) para más información.

---

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
