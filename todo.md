# Voy Ya - Project TODO

## Fase 1: Configuración Base y Autenticación
- [x] Generar logo personalizado de "Voy Ya"
- [x] Actualizar app.config.ts con nombre y logo
- [x] Configurar tema de modo oscuro en constants/theme.ts
- [ ] Implementar Google OAuth con Replit Auth
- [ ] Crear pantalla de autenticación (Auth)
- [ ] Crear selección de rol (Pasajero/Conductor)

## Fase 2: Base de Datos y Modelos
- [x] Diseñar esquema PostgreSQL para usuarios
- [x] Diseñar esquema PostgreSQL para viajes
- [x] Diseñar esquema PostgreSQL para conductores disponibles
- [x] Crear modelos TypeScript para tipos de datos
- [x] Implementar migraciones de base de datos

## Fase 3: API Backend
- [x] Crear rutas API para gestión de usuarios
- [x] Crear rutas API para solicitud de viajes
- [x] Crear rutas API para aceptación de viajes (conductor)
- [x] Crear rutas API para historial de viajes
- [x] Crear rutas API para perfiles de usuario
- [x] Crear rutas API para cálculo de tarifas
- [x] Implementar validación de datos en backend

## Fase 4: Integración de Mapas y Geolocalización
- [ ] Integrar Google Maps API
- [ ] Implementar geolocalización con Expo Location
- [ ] Crear componente de mapa interactivo
- [ ] Implementar búsqueda de ubicaciones
- [ ] Implementar cálculo de distancia y ruta

## Fase 5: Sistema de Seguimiento en Tiempo Real
- [ ] Configurar Socket.io en backend
- [ ] Implementar eventos de actualización de ubicación
- [ ] Implementar eventos de aceptación de viaje
- [ ] Implementar eventos de finalización de viaje
- [ ] Crear hook de Socket.io en frontend

## Fase 6: Interfaz de Pasajero
- [ ] Crear pantalla de inicio (Pasajero)
- [ ] Crear pantalla de solicitud de viaje
- [ ] Crear pantalla de viaje en curso (Pasajero)
- [ ] Crear pantalla de historial de viajes
- [ ] Crear pantalla de detalles de viaje
- [ ] Implementar calificación de conductor

## Fase 7: Interfaz de Conductor
- [ ] Crear pantalla de inicio (Conductor)
- [ ] Crear pantalla de viaje en curso (Conductor)
- [ ] Crear pantalla de historial de viajes (Conductor)
- [ ] Crear pantalla de detalles de viaje (Conductor)
- [ ] Implementar toggle de disponibilidad
- [ ] Implementar notificaciones de nuevos viajes

## Fase 8: Perfil de Usuario
- [ ] Crear pantalla de perfil
- [ ] Implementar edición de perfil
- [ ] Implementar cambio de foto de perfil
- [ ] Implementar gestión de métodos de pago
- [ ] Implementar configuración de preferencias

## Fase 9: Cálculo de Tarifas
- [ ] Implementar fórmula de tarifa (base + distancia + tiempo)
- [ ] Crear API para cálculo de tarifa estimada
- [ ] Implementar actualización en tiempo real de tarifa
- [ ] Implementar desglose de tarifa en UI

## Fase 10: Animaciones y Transiciones
- [ ] Implementar animaciones de entrada de pantalla
- [ ] Implementar animaciones de botones
- [ ] Implementar animación de seguimiento de auto en mapa
- [ ] Implementar transiciones suaves entre pantallas

## Fase 11: Notificaciones y Alertas
- [ ] Implementar notificaciones push para nuevos viajes
- [ ] Implementar notificaciones de llegada del conductor
- [ ] Implementar alertas de cancelación
- [ ] Implementar alertas de error

## Fase 12: Pruebas y Ajustes Finales
- [ ] Pruebas end-to-end de flujo de pasajero
- [ ] Pruebas end-to-end de flujo de conductor
- [ ] Pruebas de seguimiento en tiempo real
- [ ] Pruebas de cálculo de tarifas
- [ ] Pruebas de rendimiento
- [ ] Ajustes de UI/UX basados en pruebas
- [ ] Optimización de animaciones
- [ ] Corrección de bugs

## Fase 13: Documentación y Entrega
- [ ] Documentar API backend
- [ ] Documentar estructura del proyecto
- [ ] Crear guía de usuario
- [ ] Crear guía de instalación
- [ ] Preparar proyecto para entrega
