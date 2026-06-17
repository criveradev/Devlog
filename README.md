<div align="center">

# 🌐 Devlog

**Red social construida con el stack MERN**

Una aplicación web completa donde los usuarios pueden publicar contenido,
interactuar con otros y construir su red de seguidores.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

🔗 **[Ver demo en vivo](https://red-social-kappa.vercel.app)** &nbsp;·&nbsp;
📡 **[API en producción](https://red-social-rbav.onrender.com/health)** &nbsp;·&nbsp;
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
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Primeros pasos](#-primeros-pasos)
- [Variables de entorno](#-variables-de-entorno)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Autor](#-autor)
- [Licencia](#-licencia)

---

## 🎯 Sobre el proyecto

**Devlog** es un proyecto full-stack desarrollado como primer proyecto profesional
para portafolio. El objetivo fue aplicar las bases del desarrollo web moderno:
construcción de una API REST segura, modelado de datos con MongoDB, autenticación stateless
con JWT y una interfaz reactiva con React.

El proyecto cubre los conceptos fundamentales que se encuentran en cualquier aplicación real:
autenticación, CRUD completo, relaciones entre datos, subida de archivos a CDN y despliegue
en la nube con CI/CD automático.

---

## ✨ Funcionalidades

### 👤 Usuarios
- Registro e inicio de sesión con contraseñas encriptadas (bcrypt)
- Autenticación stateless con JWT
- Perfil con avatar, nombre de usuario y biografía
- Edición de perfil con cambio de avatar en tiempo real

### 📝 Publicaciones
- Crear, editar y eliminar publicaciones
- Subida de imágenes a Cloudinary con drag & drop
- Feed paginado con carga progresiva
- Vista previa de imagen antes de publicar

### ❤️ Interacciones
- Sistema de likes con toggle y actualización optimista
- Comentarios con eliminación por autor
- Sistema de seguidores bidireccional (follow / unfollow)
- Contador de seguidores y seguidos en el perfil

### 🎨 Experiencia de usuario
- Skeletons animados con efecto shimmer durante la carga
- Estados vacíos con llamada a la acción
- Notificaciones tipo toast para feedback inmediato
- Menú responsivo con dropdown en móvil
- Imágenes con fade-in al cargar
- Contador de caracteres en tiempo real al escribir

---

## 🛠 Stack tecnológico

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | 20.x | Entorno de ejecución |
| Express | 4.x | Framework HTTP |
| MongoDB Atlas | — | Base de datos NoSQL en la nube |
| Mongoose | 8.x | ODM para modelado de datos |
| JSON Web Token | 9.x | Autenticación stateless |
| bcryptjs | 2.x | Hash de contraseñas |
| Multer | 1.x | Manejo de archivos multipart |
| Cloudinary | 2.x | Almacenamiento y CDN de imágenes |
| dotenv | 16.x | Variables de entorno |
| CORS | 2.x | Control de acceso entre dominios |

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.x | Librería de interfaz |
| Vite | 5.x | Bundler y servidor de desarrollo |
| Tailwind CSS | 3.x | Estilos utilitarios |
| React Router DOM | 6.x | Navegación SPA |
| Axios | 1.x | Cliente HTTP con interceptores |
| Zustand | 4.x | Estado global de autenticación |
| React Hook Form | 7.x | Formularios con validación |
| React Hot Toast | 2.x | Notificaciones |

### Infraestructura

| Servicio | Uso | Plan |
|---------|-----|------|
| MongoDB Atlas | Base de datos | M0 (gratuito) |
| Cloudinary | Imágenes y CDN | Free (25 GB/mes) |
| Render | Hosting del backend | Free (750 h/mes) |
| Vercel | Hosting del frontend | Hobby (gratuito) |
| GitHub | Repositorio + CI/CD | Free |

---

## 🏗 Arquitectura

```
┌─────────────────────┐         ┌──────────────────────┐
│                     │  HTTPS  │                      │
│  Frontend (React)   │────────▶│   Backend (Express)  │
│  red-social-kappa   │◀────────│   red-social-rbav    │
│    .vercel.app      │  JSON   │    .onrender.com     │
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

### Arquitectura del backend por capas

```
Petición HTTP
     │
     ▼
┌─────────────┐
│   ROUTES    │  Define URLs y conecta con controladores
├─────────────┤
│ MIDDLEWARE  │  JWT auth · Multer uploads · Error handling
├─────────────┤
│ CONTROLLERS │  Lógica de negocio por recurso
├─────────────┤
│   MODELS    │  Esquemas Mongoose: User · Post · Comment
├─────────────┤
│  MONGODB    │  Persistencia en Atlas
└─────────────┘
```

---

## 📁 Estructura del proyecto

```
Devlog/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # Conexión a MongoDB Atlas
│   │   │   └── cloudinary.js          # Configuración de Cloudinary
│   │   ├── models/
│   │   │   ├── User.js                # username, email, password, avatar, bio, followers
│   │   │   ├── Post.js                # author, content, image, imagePublicId, likes
│   │   │   └── Comment.js             # post, author, content
│   │   ├── controllers/
│   │   │   ├── authController.js      # register, login
│   │   │   ├── userController.js      # getProfile, updateProfile, toggleFollow
│   │   │   ├── postController.js      # CRUD + toggleLike
│   │   │   └── commentController.js   # create, getByPost, delete
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   └── commentRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # Verificación JWT → req.user
│   │   │   ├── uploadMiddleware.js    # Multer en memoria
│   │   │   └── errorMiddleware.js     # 404 + error handler centralizado
│   │   ├── utils/
│   │   │   └── uploadToCloudinary.js
│   │   └── app.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Instancia global con interceptores JWT
│   │   ├── store/
│   │   │   └── authStore.js           # Estado global con Zustand + persist
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Navegación responsiva con dropdown móvil
│   │   │   ├── PostCard.jsx           # Tarjeta con likes, comentarios y optimistic UI
│   │   │   ├── Skeleton.jsx           # Skeletons animados con efecto shimmer
│   │   │   └── ProtectedRoute.jsx     # HOC para rutas privadas
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx           # Feed con paginación y estados de carga
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CreatePostPage.jsx     # Editor con drag & drop de imágenes
│   │   │   └── ProfilePage.jsx        # Perfil con edición inline y banner
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json                    # Rewrites para React Router
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Primeros pasos

### Requisitos previos

- **Node.js** v20 o superior — [Descargar](https://nodejs.org/)
- **npm** v10 o superior (incluido con Node)
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
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edita ambos archivos con tus credenciales (ver sección Variables de entorno).

### 4. Ejecutar en desarrollo

Abre **dos terminales**:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### 5. Verificar

Abre `http://localhost:5173`, crea una cuenta y prueba la app.

Para verificar el backend:

```bash
curl http://localhost:5000/health
# → { "status": "ok", "timestamp": "..." }
```

---

## 🔐 Variables de entorno

### Backend — `backend/.env`

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
CLIENT_URL=https://red-social-kappa.vercel.app
```

### Frontend — `frontend/.env`

```env
# URL base de la API
VITE_API_URL=http://localhost:5050/api

# En producción:
# VITE_API_URL=https://red-social-rbav.onrender.com/api
```

> ⚠️ **Nunca subas archivos `.env` a GitHub.** Están incluidos en `.gitignore`.

---

## 🔌 Endpoints de la API

URL base en producción: `https://red-social-rbav.onrender.com/api`

### 🔑 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/auth/register` | Crear cuenta nueva | — |
| `POST` | `/auth/login` | Iniciar sesión | — |

### 📝 Publicaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/posts?page=1&limit=10` | Feed paginado | — |
| `GET` | `/posts/:id` | Ver un post | — |
| `POST` | `/posts` | Crear post (form-data) | ✅ |
| `PUT` | `/posts/:id` | Editar post | ✅ |
| `DELETE` | `/posts/:id` | Eliminar post | ✅ |
| `POST` | `/posts/:id/like` | Like / unlike (toggle) | ✅ |

### 💬 Comentarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/comments/post/:postId` | Listar comentarios | — |
| `POST` | `/comments/post/:postId` | Crear comentario | ✅ |
| `DELETE` | `/comments/:id` | Eliminar comentario | ✅ |

### 👤 Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/users/:id` | Ver perfil + posts | — |
| `PUT` | `/users/profile` | Editar mi perfil (form-data) | ✅ |
| `POST` | `/users/:id/follow` | Seguir / dejar de seguir | ✅ |

### Autenticación en peticiones protegidas

```http
Authorization: Bearer <tu_token_jwt>
```

### Códigos de respuesta

| Código | Significado |
|--------|-------------|
| `200` | OK |
| `201` | Creado |
| `400` | Datos inválidos |
| `401` | Sin token o token inválido |
| `403` | Sin permisos sobre el recurso |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

---

## 🚢 Despliegue

El proyecto usa **CI/CD automático**: cada `git push origin main` dispara un nuevo
deploy en Render y Vercel simultáneamente sin ningún paso manual.

### Servicios en producción

| Servicio | URL |
|---------|-----|
| Frontend (Vercel) | [red-social-kappa.vercel.app](https://red-social-kappa.vercel.app) |
| Backend (Render) | [red-social-rbav.onrender.com](https://red-social-rbav.onrender.com/health) |
| Base de datos | MongoDB Atlas M0 |
| Imágenes | Cloudinary |

### Desplegar tu propia instancia

```bash
# 1. Haz fork del repositorio en GitHub

# 2. Backend → crear Web Service en render.com
#    Root Directory : backend
#    Build Command  : npm install
#    Start Command  : npm start
#    + Agregar todas las variables de entorno

# 3. Frontend → crear proyecto en vercel.com
#    Root Directory : frontend
#    Framework      : Vite
#    + Agregar VITE_API_URL con la URL de tu servicio en Render

# 4. Actualizar CLIENT_URL en Render con la URL de Vercel
#    → Render hace redeploy automático
```

---

## 🗺 Roadmap

### v1.0 — Actual ✅
- [x] Autenticación con JWT y bcrypt
- [x] CRUD de publicaciones con imágenes (Cloudinary)
- [x] Sistema de likes con optimistic UI
- [x] Comentarios con eliminación
- [x] Sistema de seguidores bidireccional
- [x] Perfil editable con avatar
- [x] Feed paginado
- [x] UI responsiva con Tailwind
- [x] Skeletons, estados vacíos y de error
- [x] Deploy automático (Render + Vercel)

### v1.1 — Próximamente
- [ ] Notificaciones en tiempo real (Socket.io)
- [ ] Búsqueda de usuarios y posts
- [ ] Hashtags y menciones (@usuario)
- [ ] Posts con múltiples imágenes
- [ ] Modo oscuro

### v2.0 — Futuro
- [ ] Tests unitarios e integración (Jest + Supertest)
- [ ] Documentación Swagger / OpenAPI
- [ ] Rate limiting y Helmet
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

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Cambios en documentación |
| `style:` | Formato (no afecta lógica) |
| `refactor:` | Refactorización de código |
| `test:` | Agrega o modifica tests |
| `chore:` | Tareas de mantenimiento |

---

## 👨‍💻 Autor

**criveradev**

[![GitHub](https://img.shields.io/badge/GitHub-criveradev-181717?style=flat&logo=github&logoColor=white)](https://github.com/criveradev)

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver [`LICENSE`](./LICENSE) para más información.

---

<div align="center">

**¿Te resultó útil este proyecto?**

Dale una ⭐ al repositorio — ayuda a que otros lo encuentren.

<br/>

Hecho con ☕ y muchas ganas de aprender.

</div>
