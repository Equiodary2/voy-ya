# Guía de Instalación y Configuración - Voy Ya

Esta guía proporciona instrucciones paso a paso para instalar, configurar y ejecutar la aplicación **Voy Ya** en tu entorno local.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Inicial](#instalación-inicial)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración de Autenticación](#configuración-de-autenticación)
5. [Ejecución Local](#ejecución-local)
6. [Pruebas en Dispositivo Móvil](#pruebas-en-dispositivo-móvil)
7. [Compilación para Producción](#compilación-para-producción)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### Software Requerido

Antes de comenzar, asegúrate de tener instalado el siguiente software:

| Software | Versión | Propósito |
|----------|---------|----------|
| Node.js | 18.x o superior | Runtime de JavaScript |
| pnpm | 9.12.0 | Gestor de paquetes |
| Git | 2.30+ | Control de versiones |
| PostgreSQL | 14+ | Base de datos |
| Expo CLI | 54.0+ | CLI de Expo (opcional) |

### Verificar Instalación

Abre una terminal y ejecuta los siguientes comandos para verificar que todo está instalado:

```bash
# Verificar Node.js
node --version
# Salida esperada: v18.x.x o superior

# Verificar pnpm
pnpm --version
# Salida esperada: 9.12.0 o superior

# Verificar Git
git --version
# Salida esperada: git version 2.30+

# Verificar PostgreSQL
psql --version
# Salida esperada: psql (PostgreSQL) 14.x
```

### Instalación de Herramientas

Si falta alguna herramienta, sigue estas instrucciones:

#### Node.js

- **macOS**: `brew install node`
- **Windows**: Descarga desde [nodejs.org](https://nodejs.org)
- **Linux**: `sudo apt-get install nodejs npm`

#### pnpm

Una vez instalado Node.js, instala pnpm:

```bash
npm install -g pnpm@9.12.0
```

#### PostgreSQL

- **macOS**: `brew install postgresql`
- **Windows**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

---

## 📥 Instalación Inicial

### Paso 1: Clonar el Repositorio

Clona el repositorio desde GitHub:

```bash
git clone https://github.com/Equiodary2/voy-ya.git
cd voy-ya
```

### Paso 2: Instalar Dependencias

Instala todas las dependencias del proyecto:

```bash
pnpm install
```

Este comando instalará:

- Dependencias del frontend (React Native, Expo, etc.)
- Dependencias del backend (Express, tRPC, Socket.io, etc.)
- Dependencias de desarrollo (TypeScript, Vitest, etc.)

**Tiempo estimado**: 5-10 minutos (depende de tu conexión a internet)

### Paso 3: Verificar Instalación

Verifica que la instalación fue exitosa:

```bash
# Verificar que TypeScript compila sin errores
pnpm check

# Salida esperada: 0 errors
```

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Crear Base de Datos PostgreSQL

Abre una terminal y conecta a PostgreSQL:

```bash
# En macOS/Linux
psql -U postgres

# En Windows (si está en PATH)
psql -U postgres
```

Una vez conectado, crea la base de datos:

```sql
-- Crear base de datos
CREATE DATABASE voy_ya;

-- Crear usuario (opcional, si quieres un usuario específico)
CREATE USER voy_ya_user WITH PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE voy_ya TO voy_ya_user;

-- Salir
\q
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
touch .env
```

Abre el archivo `.env` con tu editor favorito y agrega:

```bash
# ===== BACKEND =====
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/voy_ya

# Si usas usuario específico:
# DATABASE_URL=postgresql://voy_ya_user:tu_contraseña_segura@localhost:5432/voy_ya

# ===== AUTENTICACIÓN =====
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret

# ===== FRONTEND =====
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

**Nota**: Reemplaza los valores de `OAUTH_CLIENT_ID` y `OAUTH_CLIENT_SECRET` con tus credenciales reales.

### Paso 3: Ejecutar Migraciones

Ejecuta las migraciones de base de datos:

```bash
pnpm db:push
```

Este comando:

1. Genera los archivos de migración (si es necesario)
2. Ejecuta las migraciones en la base de datos
3. Crea todas las tablas necesarias

**Salida esperada**:

```
✓ Generated migration
✓ Applied migration
✓ Tables created: users, user_profiles, drivers, rides, ratings, payment_methods
```

### Paso 4: Verificar Base de Datos

Verifica que las tablas fueron creadas correctamente:

```bash
# Conectar a la base de datos
psql -U postgres -d voy_ya

# Listar tablas
\dt

# Salir
\q
```

**Salida esperada**:

```
                 List of relations
 Schema |      Name      | Type  |  Owner
--------+----------------+-------+----------
 public | drivers        | table | postgres
 public | payment_methods| table | postgres
 public | ratings        | table | postgres
 public | ride_requests  | table | postgres
 public | rides          | table | postgres
 public | user_profiles  | table | postgres
 public | users          | table | postgres
(7 rows)
```

---

## 🔐 Configuración de Autenticación

### Google OAuth (Manus Auth)

La aplicación utiliza **Manus OAuth** para autenticación con Google.

#### Paso 1: Obtener Credenciales OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ en el proyecto
4. Ve a "Credenciales" y crea una nueva credencial OAuth 2.0
5. Selecciona "Aplicación web" como tipo de aplicación
6. Agrega URIs autorizados:
   - `http://localhost:3000` (desarrollo local)
   - `http://localhost:8081` (desarrollo local web)
   - `https://tu-dominio.com` (producción)

7. Copia el **Client ID** y **Client Secret**

#### Paso 2: Configurar en .env

Agrega las credenciales al archivo `.env`:

```bash
OAUTH_CLIENT_ID=tu_client_id_aqui
OAUTH_CLIENT_SECRET=tu_client_secret_aqui
```

#### Paso 3: Verificar Configuración

La configuración OAuth se carga automáticamente desde `constants/oauth.ts`. Verifica que esté correcta:

```bash
# El servidor debe iniciar sin errores de OAuth
pnpm dev:server
```

**Salida esperada**:

```
[OAuth] Initialized with baseURL: https://api.manus.im
[api] server listening on port 3000
```

---

## 🚀 Ejecución Local

### Opción 1: Ejecutar Todo (Frontend + Backend)

```bash
pnpm dev
```

Este comando inicia:

- **Backend** en `http://localhost:3000`
- **Frontend** en `http://localhost:8081`

**Salida esperada**:

```
[0] > app-template@1.0.0 dev:server
[0] > cross-env NODE_ENV=development tsx watch server/_core/index.ts
[0] [OAuth] Initialized with baseURL: https://api.manus.im
[0] [api] server listening on port 3000

[1] > app-template@1.0.0 dev:metro
[1] > cross-env EXPO_USE_METRO_WORKSPACE_ROOT=1 npx expo start --web --port 8081
[1] Starting Metro Bundler
[1] Waiting on http://localhost:8081
```

### Opción 2: Ejecutar Componentes por Separado

#### Solo Backend

```bash
pnpm dev:server
```

Backend estará disponible en `http://localhost:3000`.

#### Solo Frontend

```bash
pnpm dev:metro
```

Frontend estará disponible en `http://localhost:8081`.

### Acceder a la Aplicación

- **Web**: Abre [http://localhost:8081](http://localhost:8081) en tu navegador
- **API**: Accede a [http://localhost:3000](http://localhost:3000) para ver el servidor tRPC

---

## 📱 Pruebas en Dispositivo Móvil

### Opción 1: Expo Go (Recomendado para Desarrollo)

#### En iOS

```bash
pnpm ios
```

O manualmente:

1. Descarga **Expo Go** desde la App Store
2. Abre la aplicación
3. Escanea el código QR que aparece en la terminal
4. La aplicación se abrirá en tu dispositivo

#### En Android

```bash
pnpm android
```

O manualmente:

1. Descarga **Expo Go** desde Google Play
2. Abre la aplicación
3. Escanea el código QR que aparece en la terminal
4. La aplicación se abrirá en tu dispositivo

### Opción 2: Build de Desarrollo (EAS)

Para crear un build que pueda distribuirse:

```bash
# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

### Opción 3: Emulador Local

#### iOS (macOS)

```bash
# Abre Xcode y crea un simulador, luego:
pnpm ios
```

#### Android

```bash
# Abre Android Studio y crea un emulador, luego:
pnpm android
```

---

## 🏗️ Compilación para Producción

### Paso 1: Preparar Variables de Entorno

Crea un archivo `.env.production`:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/voy_ya
OAUTH_CLIENT_ID=prod_oauth_client_id
OAUTH_CLIENT_SECRET=prod_oauth_client_secret
EXPO_PUBLIC_API_URL=https://api.voyya.app
EXPO_PUBLIC_SOCKET_URL=https://api.voyya.app
```

### Paso 2: Compilar Backend

```bash
pnpm build
```

Esto crea una carpeta `dist/` con el backend compilado.

### Paso 3: Compilar para iOS

```bash
eas build --platform ios --profile production
```

### Paso 4: Compilar para Android

```bash
eas build --platform android --profile production
```

### Paso 5: Desplegar

Sube los builds a las tiendas de aplicaciones:

- **App Store**: Usa Xcode o Transporter
- **Google Play**: Usa Google Play Console

---

## 🧪 Ejecutar Pruebas

### Todas las Pruebas

```bash
pnpm test
```

### Pruebas Específicas

```bash
# Pruebas de cálculo de tarifas
pnpm test pricing.test.ts

# Pruebas de Socket.io
pnpm test socket.test.ts

# Pruebas de geolocalización
pnpm test location.test.ts

# Pruebas de notificaciones
pnpm test notifications.test.ts
```

### Modo Watch

```bash
pnpm test --watch
```

---

## 🐛 Solución de Problemas

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto
PORT=3001 pnpm dev:server
```

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
# macOS
brew services list

# Linux
sudo service postgresql status

# Verificar credenciales en .env
cat .env | grep DATABASE_URL

# Probar conexión manualmente
psql -U postgres -d voy_ya -c "SELECT 1"
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "TypeScript compilation failed"

```bash
# Verificar tipos
pnpm check

# Limpiar cache de TypeScript
rm -rf .tsbuildinfo
pnpm check
```

### Error: "OAuth initialization failed"

```bash
# Verificar credenciales en .env
cat .env | grep OAUTH

# Verificar que las credenciales son correctas en Google Cloud Console
# Reiniciar servidor
pnpm dev:server
```

### La aplicación no se carga en el navegador

```bash
# Limpiar cache de Metro
rm -rf .metro-cache
pnpm dev:metro

# O reiniciar todo
pnpm dev
```

### Errores de permisos en macOS

```bash
# Si tienes problemas con permisos, usa sudo
sudo pnpm install
sudo pnpm dev
```

---

## 📚 Próximos Pasos

Una vez que tengas la aplicación corriendo localmente:

1. **Explora el código**: Revisa la estructura del proyecto en `README.md`
2. **Lee la documentación del backend**: Consulta `server/README.md`
3. **Ejecuta las pruebas**: Asegúrate de que todo funciona correctamente
4. **Realiza cambios**: Comienza a desarrollar nuevas características
5. **Haz commits**: Usa `git commit` para guardar tus cambios

---

## 🆘 Soporte

Si encuentras problemas durante la instalación:

1. Revisa esta guía nuevamente
2. Consulta la sección [Solución de Problemas](#solución-de-problemas)
3. Abre un issue en [GitHub](https://github.com/Equiodary2/voy-ya/issues)
4. Contacta al equipo de soporte

---

**Última actualización**: Diciembre 23, 2024  
**Versión**: 1.0.0
