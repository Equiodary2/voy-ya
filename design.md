# Diseño de Interfaz Móvil - Voy Ya

## Descripción General
"Voy Ya" es una aplicación de ride-sharing moderna con modo oscuro elegante. La aplicación diferencia entre dos tipos de usuarios: **Pasajeros** (solicitan viajes) y **Conductores** (ofrecen viajes). El diseño sigue las directrices de Apple HIG con orientación vertical (9:16) y optimización para uso con una mano.

---

## Paleta de Colores (Modo Oscuro - Primario)

| Elemento | Color | Uso |
|----------|-------|-----|
| Fondo Principal | #0A0E27 | Fondo base de todas las pantallas |
| Superficie Primaria | #1A1F3A | Tarjetas, contenedores principales |
| Superficie Secundaria | #252B45 | Elementos secundarios, listas |
| Acento Primario | #00D9FF | Botones principales, indicadores activos |
| Acento Secundario | #FF6B6B | Cancelaciones, alertas, acciones destructivas |
| Acento Terciario | #4ECDC4 | Confirmaciones, éxito |
| Texto Primario | #FFFFFF | Texto principal |
| Texto Secundario | #A0A8C0 | Texto secundario, descripciones |
| Texto Deshabilitado | #5A6280 | Elementos deshabilitados |
| Borde | #2D3250 | Separadores, bordes sutiles |

---

## Pantallas de la Aplicación

### 1. **Pantalla de Autenticación (Auth)**
**Propósito:** Permitir que nuevos usuarios se registren o inicien sesión con Google OAuth.

**Contenido:**
- Logo de "Voy Ya" centrado (grande, 120x120)
- Título: "Voy Ya" (32pt, bold)
- Subtítulo: "Tu viaje, tu forma" (16pt, secundario)
- Botón "Iniciar sesión con Google" (grande, 44pt altura mínima)
- Botón "Continuar como Pasajero" (alternativa)
- Botón "Continuar como Conductor" (alternativa)
- Texto legal pequeño en la parte inferior

**Flujo:**
- Usuario toca "Iniciar sesión con Google" → Abre OAuth → Redirige a selección de rol
- Usuario toca "Continuar como Pasajero" → Va a Pantalla de Inicio (Pasajero)
- Usuario toca "Continuar como Conductor" → Va a Pantalla de Inicio (Conductor)

---

### 2. **Pantalla de Inicio - Pasajero (Home Rider)**
**Propósito:** Interfaz principal para solicitar viajes.

**Contenido:**
- **Encabezado:** Saludo + nombre de usuario + ubicación actual (16pt)
- **Mapa interactivo:** Mapa de Google Maps mostrando ubicación actual (60% de la pantalla)
- **Barra de búsqueda:** "¿A dónde vamos?" (campo de entrada con ícono de ubicación)
- **Botones rápidos:**
  - "Ir ahora" (acento primario)
  - "Programar viaje" (acento secundario)
- **Tarjetas de viajes recientes:** Últimos destinos frecuentes (horizontal scrollable)
- **Zona de seguridad inferior:** Espacio para tab bar

**Funcionalidad:**
- Muestra ubicación en tiempo real
- Permite buscar destino
- Muestra conductores disponibles cercanos (ícono de auto en el mapa)
- Transiciones suaves al tocar "Ir ahora"

---

### 3. **Pantalla de Solicitud de Viaje (Request Ride)**
**Propósito:** Permitir al pasajero confirmar origen, destino y tipo de vehículo.

**Contenido:**
- **Mapa:** Muestra ruta desde origen a destino (50% de la pantalla)
- **Panel inferior (Bottom Sheet):**
  - Campo "Desde" (ubicación actual, editable)
  - Campo "Hacia" (destino, editable)
  - Selector de tipo de vehículo:
    - "Voy Ya" (económico, ícono de auto pequeño)
    - "Voy Ya Plus" (premium, ícono de auto grande)
  - **Tarjeta de tarifa:**
    - Tarifa estimada: "$X.XX"
    - Tiempo estimado: "15 min"
    - Distancia: "5.2 km"
  - Botón "Solicitar viaje" (grande, acento primario, 44pt)
  - Botón "Cancelar" (gris)

**Funcionalidad:**
- Cálculo automático de tarifa basado en distancia
- Actualización en tiempo real de ETA
- Validación de campos antes de permitir solicitud

---

### 4. **Pantalla de Viaje en Curso - Pasajero (Ride Active Rider)**
**Propósito:** Mostrar seguimiento en tiempo real del viaje.

**Contenido:**
- **Mapa:** Ruta en tiempo real con ubicación del conductor y pasajero (70% de la pantalla)
- **Panel superior:**
  - Nombre del conductor: "Carlos M." (16pt, bold)
  - Calificación: "★ 4.8" (amarillo)
  - Placa del vehículo: "ABC-1234" (gris)
  - Foto de perfil del conductor (circular, 40x40)
- **Panel inferior:**
  - Destino: "Calle Principal 123" (16pt)
  - Tiempo estimado: "8 min" (acento primario)
  - Tarifa estimada: "$12.50"
  - Botón "Contactar conductor" (ícono de teléfono)
  - Botón "Compartir viaje" (ícono de compartir)
  - Botón "Cancelar viaje" (rojo, FF6B6B)

**Funcionalidad:**
- Actualización de ubicación cada 2 segundos (WebSocket/Socket.io)
- Animación suave de movimiento del auto
- Notificaciones cuando el conductor está cerca

---

### 5. **Pantalla de Inicio - Conductor (Home Driver)**
**Propósito:** Interfaz principal para conductores disponibles.

**Contenido:**
- **Encabezado:** "Disponible" / "No disponible" (toggle grande, 44pt)
- **Mapa interactivo:** Mapa mostrando ubicación actual y pasajeros cercanos (60% de la pantalla)
- **Panel inferior:**
  - **Tarjeta de estado:**
    - Ingresos hoy: "$45.50"
    - Viajes completados: "3"
    - Calificación: "★ 4.9"
  - **Botón "Aceptar viaje"** (cuando hay solicitud)
  - **Historial de viajes hoy** (últimos 3 viajes, scrollable)
  - Botón "Configuración" (ícono de engranaje)

**Funcionalidad:**
- Toggle de disponibilidad (on/off)
- Notificaciones de nuevas solicitudes de viaje
- Muestra pasajeros cercanos en el mapa

---

### 6. **Pantalla de Viaje en Curso - Conductor (Ride Active Driver)**
**Propósito:** Mostrar navegación y detalles del viaje para el conductor.

**Contenido:**
- **Mapa:** Ruta hacia pasajero y luego hacia destino (70% de la pantalla)
- **Panel superior:**
  - Nombre del pasajero: "María G." (16pt, bold)
  - Calificación: "★ 4.6"
  - Foto de perfil (circular, 40x40)
- **Panel inferior:**
  - **Fase actual:**
    - "Dirigiéndose al pasajero" o "En viaje"
  - Ubicación del pasajero: "Calle 5ta, Apto 201" (gris)
  - Destino: "Centro Comercial Plaza" (16pt)
  - Botón "He llegado" (cuando está cerca del pasajero)
  - Botón "Iniciar viaje" (cuando el pasajero sube)
  - Botón "Finalizar viaje" (cuando llega al destino)
  - Botón "Llamar pasajero" (ícono de teléfono)
  - Botón "Cancelar viaje" (rojo)

**Funcionalidad:**
- Navegación turn-by-turn integrada
- Actualización de ubicación en tiempo real
- Confirmación de fases del viaje

---

### 7. **Pantalla de Historial de Viajes (Ride History)**
**Propósito:** Mostrar historial de viajes completados.

**Contenido:**
- **Encabezado:** "Historial de viajes" (32pt, bold)
- **Filtros:** "Todos", "Completados", "Cancelados" (segmented control)
- **Lista de viajes:**
  - Cada tarjeta muestra:
    - Fecha y hora: "Hoy, 14:30" (gris)
    - Origen → Destino: "Calle A → Calle B" (16pt)
    - Distancia: "5.2 km" (gris)
    - Tarifa: "$12.50" (acento primario)
    - Duración: "18 min" (gris)
    - Calificación: "★ 4.8" (si aplica)
  - Toque para ver detalles completos

**Funcionalidad:**
- Scroll infinito o paginación
- Detalles completos al tocar una tarjeta
- Opción de reportar viaje

---

### 8. **Pantalla de Perfil de Usuario (Profile)**
**Propósito:** Mostrar información personal y configuración.

**Contenido:**
- **Encabezado de perfil:**
  - Foto de perfil (circular, 80x80)
  - Nombre: "Carlos Mendoza" (20pt, bold)
  - Correo: "carlos@email.com" (gris)
  - Tipo de usuario: "Pasajero" o "Conductor" (etiqueta)
- **Secciones:**
  - **Información Personal:**
    - Teléfono: "+1 234 567 8900"
    - Fecha de nacimiento: "15/03/1990"
    - Género: "Masculino"
  - **Método de Pago:**
    - Tarjeta guardada: "Visa •••• 1234"
    - Botón "Agregar método de pago"
  - **Seguridad:**
    - Cambiar contraseña
    - Autenticación de dos factores (toggle)
  - **Preferencias:**
    - Notificaciones (toggle)
    - Música en viajes (toggle)
    - Compartir datos (toggle)
  - **Ayuda y Soporte:**
    - Centro de ayuda
    - Reportar problema
    - Contactar soporte
  - **Cerrar sesión** (rojo, FF6B6B)

**Funcionalidad:**
- Edición de perfil
- Cambio de foto de perfil
- Gestión de métodos de pago

---

### 9. **Pantalla de Detalles de Viaje (Ride Details)**
**Propósito:** Mostrar detalles completos de un viaje (historial o en curso).

**Contenido:**
- **Encabezado:** Fecha y hora del viaje (20pt, bold)
- **Información del conductor/pasajero:**
  - Foto, nombre, calificación
- **Ruta:**
  - Mapa pequeño mostrando la ruta (40% de la pantalla)
  - Origen, destino, paradas intermedias
- **Detalles del viaje:**
  - Distancia: "5.2 km"
  - Duración: "18 min"
  - Tarifa: "$12.50"
  - Desglose de tarifa (tarifa base + distancia + tiempo)
- **Calificación y comentarios:**
  - Estrellas (1-5)
  - Campo de comentarios
  - Botón "Enviar calificación"
- **Acciones:**
  - Compartir recibo
  - Reportar problema

**Funcionalidad:**
- Visualización de ruta en mapa
- Calificación y comentarios
- Descarga de recibo

---

## Flujos de Usuario Principales

### Flujo 1: Pasajero Solicita Viaje
1. Pasajero abre app → Pantalla de Inicio (Pasajero)
2. Toca "Ir ahora" o busca destino
3. Va a Pantalla de Solicitud de Viaje
4. Confirma origen, destino y tipo de vehículo
5. Toca "Solicitar viaje"
6. Va a Pantalla de Viaje en Curso (Pasajero)
7. Espera a que conductor acepte
8. Conductor llega, pasajero sube
9. Viaje en progreso con seguimiento en tiempo real
10. Llega al destino → Pantalla de Detalles de Viaje
11. Califica al conductor

### Flujo 2: Conductor Acepta Viaje
1. Conductor abre app → Pantalla de Inicio (Conductor)
2. Activa "Disponible"
3. Recibe notificación de nueva solicitud
4. Toca "Aceptar viaje"
5. Va a Pantalla de Viaje en Curso (Conductor)
6. Navega hacia el pasajero
7. Toca "He llegado"
8. Pasajero sube
9. Toca "Iniciar viaje"
10. Navega hacia destino
11. Llega al destino
12. Toca "Finalizar viaje"
13. Va a Pantalla de Detalles de Viaje
14. Califica al pasajero

---

## Especificaciones de Diseño

### Tipografía
- **Título Grande:** 32pt, bold, línea 40pt
- **Título:** 24pt, bold, línea 32pt
- **Subtítulo:** 20pt, bold, línea 28pt
- **Cuerpo:** 16pt, regular, línea 24pt
- **Cuerpo Pequeño:** 14pt, regular, línea 20pt
- **Etiqueta:** 12pt, regular, línea 16pt

### Espaciado (Grid 8pt)
- Padding pequeño: 8pt
- Padding estándar: 16pt
- Padding grande: 24pt
- Padding extra: 32pt
- Gap entre elementos: 8pt, 12pt, 16pt

### Bordes y Radios
- Botones: 12pt
- Tarjetas: 16pt
- Modales/Sheets: 20pt
- Imágenes de perfil: 50% (circular)

### Altura de Toque Mínima
- Todos los botones: 44pt
- Elementos interactivos: 44pt
- Ícono tab bar: 28pt

### Animaciones
- Transición estándar: 300ms, ease-in-out
- Animación de seguimiento: 2 segundos, suave
- Animación de botón presionado: 100ms, scale 0.95
- Animación de entrada de pantalla: 200ms, slide from bottom

---

## Consideraciones de Seguridad y UX

1. **Ubicación en Tiempo Real:** Solicitar permiso al abrir la app
2. **Notificaciones:** Solicitar permiso para notificaciones push
3. **Autenticación:** Google OAuth con verificación de dos factores opcional
4. **Datos Sensibles:** No mostrar ubicación exacta del pasajero hasta que el conductor esté cerca
5. **Cancelación:** Permitir cancelación con confirmación
6. **Modo Oscuro:** Implementado por defecto, sin opción de cambio (diseño moderno)

---

## Notas de Implementación

- Usar **Socket.io** para seguimiento en tiempo real (recomendado sobre WebSockets por compatibilidad)
- Integrar **Google Maps API** para mapas y navegación
- Usar **Google OAuth** para autenticación
- Implementar **cálculo automático de tarifas** basado en distancia y tiempo
- Usar **AsyncStorage** para datos locales (historial, preferencias)
- Usar **React Native Reanimated** para animaciones suaves
- Usar **Expo Location** para geolocalización
- Usar **react-native-maps** para integración de Google Maps
