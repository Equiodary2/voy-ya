# Documentación de API - Voy Ya

Esta documentación describe todos los endpoints de la API tRPC disponibles en **Voy Ya**, incluyendo parámetros, respuestas y ejemplos de uso.

---

## 📋 Tabla de Contenidos

1. [Introducción a tRPC](#introducción-a-trpc)
2. [Autenticación](#autenticación)
3. [Usuarios](#usuarios)
4. [Conductores](#conductores)
5. [Viajes](#viajes)
6. [Calificaciones](#calificaciones)
7. [Métodos de Pago](#métodos-de-pago)
8. [Disponibles](#disponibles)
9. [Errores](#errores)
10. [Ejemplos Completos](#ejemplos-completos)

---

## 🔌 Introducción a tRPC

**tRPC** es un framework que proporciona APIs type-safe end-to-end sin necesidad de generar código. Permite llamar a funciones del servidor directamente desde el cliente con autocompletado y validación de tipos.

### Características

- **Type-safe**: Los tipos se infieren automáticamente del servidor al cliente
- **Validación**: Usa Zod para validar inputs automáticamente
- **Errores claros**: Los errores incluyen información detallada
- **Caching**: React Query integrado para caching automático

### Cliente tRPC

Todas las llamadas a la API se hacen a través del cliente tRPC en `lib/trpc.ts`:

```typescript
import { trpc } from "@/lib/trpc";

// Queries (GET)
const { data, isLoading } = trpc.users.getProfile.useQuery();

// Mutations (POST/PUT/DELETE)
const mutation = trpc.users.updateProfile.useMutation();
await mutation.mutateAsync({ name: "Nuevo Nombre" });
```

---

## 🔐 Autenticación

### Conceptos

- **publicProcedure**: Accesible sin autenticación
- **protectedProcedure**: Requiere usuario autenticado
- **Contexto**: Información del usuario actual disponible en `ctx.user`

### Usuario Autenticado

Cuando un usuario está autenticado, el contexto incluye:

```typescript
interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string;
  role: "user" | "admin";
  lastSignedIn: Date;
}
```

### Manejo de Errores de Autenticación

```typescript
try {
  await trpc.users.getProfile.useQuery();
} catch (error) {
  if (error.data?.code === "UNAUTHORIZED") {
    // Usuario no autenticado
    router.push("/login");
  }
}
```

---

## 👤 Usuarios

Endpoints para gestionar perfiles de usuario.

### `users.getProfile()`

Obtiene el perfil del usuario autenticado.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**: Ninguno

**Respuesta**:

```typescript
{
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  bio: string | null;
  rating: number;
  totalRides: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Ejemplo**:

```typescript
const { data: profile } = trpc.users.getProfile.useQuery();

console.log(profile?.name);        // "Juan Pérez"
console.log(profile?.rating);      // 4.8
console.log(profile?.totalRides);  // 42
```

---

### `users.updateProfile(data)`

Actualiza la información del perfil del usuario.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: PUT  
**Parámetros**:

```typescript
{
  name?: string;
  phone?: string;
  bio?: string;
  profileImage?: string; // URL de imagen
}
```

**Respuesta**: Perfil actualizado (mismo formato que `getProfile()`)

**Ejemplo**:

```typescript
const updateMutation = trpc.users.updateProfile.useMutation();

await updateMutation.mutateAsync({
  name: "Juan Carlos Pérez",
  phone: "+34 600 123 456",
  bio: "Conductor profesional con 5 años de experiencia",
});
```

---

### `users.addPaymentMethod(data)`

Agrega un nuevo método de pago al usuario.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: POST  
**Parámetros**:

```typescript
{
  type: "credit_card" | "debit_card" | "wallet";
  cardNumber: string;
  expiryDate: string; // MM/YY
  cvv: string;
  cardholderName: string;
  isDefault?: boolean;
}
```

**Respuesta**:

```typescript
{
  id: number;
  userId: number;
  type: string;
  last4Digits: string;
  expiryDate: string;
  cardholderName: string;
  isDefault: boolean;
  createdAt: Date;
}
```

**Ejemplo**:

```typescript
const addPaymentMutation = trpc.users.addPaymentMethod.useMutation();

await addPaymentMutation.mutateAsync({
  type: "credit_card",
  cardNumber: "4111111111111111",
  expiryDate: "12/25",
  cvv: "123",
  cardholderName: "Juan Pérez",
  isDefault: true,
});
```

---

## 🚗 Conductores

Endpoints para gestionar información de conductores.

### `drivers.getStatus()`

Obtiene el estado actual del conductor autenticado.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**: Ninguno

**Respuesta**:

```typescript
{
  id: number;
  userId: number;
  licenseNumber: string;
  vehicleType: "economy" | "comfort" | "premium";
  vehiclePlate: string;
  vehicleColor: string;
  isAvailable: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  totalRides: number;
  rating: number;
  earnings: number;
  createdAt: Date;
}
```

**Ejemplo**:

```typescript
const { data: driverStatus } = trpc.drivers.getStatus.useQuery();

console.log(driverStatus?.isAvailable);    // true
console.log(driverStatus?.vehicleType);   // "comfort"
console.log(driverStatus?.earnings);      // 1250.50
```

---

### `drivers.setAvailable(available)`

Establece la disponibilidad del conductor.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: PUT  
**Parámetros**:

```typescript
{
  available: boolean;
}
```

**Respuesta**: Estado actualizado del conductor

**Ejemplo**:

```typescript
const setAvailableMutation = trpc.drivers.setAvailable.useMutation();

// Establecer como disponible
await setAvailableMutation.mutateAsync({ available: true });

// Establecer como no disponible
await setAvailableMutation.mutateAsync({ available: false });
```

---

### `drivers.getStats()`

Obtiene estadísticas de ganancias y desempeño del conductor.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**: Ninguno

**Respuesta**:

```typescript
{
  totalEarnings: number;
  totalRides: number;
  averageRating: number;
  totalHours: number;
  acceptanceRate: number;
  cancellationRate: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
}
```

**Ejemplo**:

```typescript
const { data: stats } = trpc.drivers.getStats.useQuery();

console.log(stats?.totalEarnings);      // 5250.75
console.log(stats?.totalRides);         // 128
console.log(stats?.averageRating);      // 4.9
console.log(stats?.acceptanceRate);     // 0.95 (95%)
```

---

## 🚕 Viajes

Endpoints para gestionar viajes.

### `rides.create(data)`

Crea una nueva solicitud de viaje.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: POST  
**Parámetros**:

```typescript
{
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleType: "economy" | "comfort" | "premium";
  estimatedDistance: number; // km
  estimatedDuration: number; // minutos
}
```

**Respuesta**:

```typescript
{
  id: number;
  passengerId: number;
  driverId: number | null;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  pickupLocation: { latitude: number; longitude: number; address: string };
  dropoffLocation: { latitude: number; longitude: number; address: string };
  vehicleType: string;
  estimatedFare: number;
  actualFare: number | null;
  distance: number;
  duration: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}
```

**Ejemplo**:

```typescript
const createRideMutation = trpc.rides.create.useMutation();

const ride = await createRideMutation.mutateAsync({
  pickupLocation: {
    latitude: -34.9011,
    longitude: -56.1645,
    address: "Calle Principal 123, Montevideo",
  },
  dropoffLocation: {
    latitude: -34.8776,
    longitude: -56.1711,
    address: "Avenida Libertador 456, Montevideo",
  },
  vehicleType: "comfort",
  estimatedDistance: 5.2,
  estimatedDuration: 12,
});

console.log(ride.id);              // 42
console.log(ride.estimatedFare);   // 125.50
```

---

### `rides.getActive()`

Obtiene el viaje activo del usuario (si existe).

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**: Ninguno

**Respuesta**: Objeto de viaje (mismo formato que `create()`) o `null`

**Ejemplo**:

```typescript
const { data: activeRide } = trpc.rides.getActive.useQuery();

if (activeRide) {
  console.log(activeRide.status);        // "in_progress"
  console.log(activeRide.driverId);      // 15
  console.log(activeRide.estimatedFare); // 125.50
}
```

---

### `rides.complete(rideId)`

Marca un viaje como completado.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: PUT  
**Parámetros**:

```typescript
{
  rideId: number;
}
```

**Respuesta**: Viaje actualizado

**Ejemplo**:

```typescript
const completeRideMutation = trpc.rides.complete.useMutation();

await completeRideMutation.mutateAsync({ rideId: 42 });
```

---

### `rides.cancel(rideId)`

Cancela un viaje.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: PUT  
**Parámetros**:

```typescript
{
  rideId: number;
  reason?: string;
}
```

**Respuesta**: Viaje actualizado con estado "cancelled"

**Ejemplo**:

```typescript
const cancelRideMutation = trpc.rides.cancel.useMutation();

await cancelRideMutation.mutateAsync({
  rideId: 42,
  reason: "Cambié de opinión",
});
```

---

### `rides.getHistory(limit?, offset?)`

Obtiene el historial de viajes del usuario.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**:

```typescript
{
  limit?: number;    // Máximo 50, default 20
  offset?: number;   // Para paginación, default 0
}
```

**Respuesta**: Array de viajes

**Ejemplo**:

```typescript
const { data: rideHistory } = trpc.rides.getHistory.useQuery({
  limit: 10,
  offset: 0,
});

rideHistory?.forEach((ride) => {
  console.log(ride.id, ride.status, ride.actualFare);
});
```

---

## ⭐ Calificaciones

Endpoints para gestionar calificaciones de viajes.

### `ratings.create(data)`

Crea una calificación para un viaje completado.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: POST  
**Parámetros**:

```typescript
{
  rideId: number;
  rating: number;        // 1-5 estrellas
  comment?: string;      // Máximo 500 caracteres
  tags?: string[];       // Ej: ["limpio", "seguro", "amable"]
}
```

**Respuesta**:

```typescript
{
  id: number;
  rideId: number;
  raterId: number;
  ratedUserId: number;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: Date;
}
```

**Ejemplo**:

```typescript
const createRatingMutation = trpc.ratings.create.useMutation();

await createRatingMutation.mutateAsync({
  rideId: 42,
  rating: 5,
  comment: "Excelente conductor, muy amable y profesional",
  tags: ["limpio", "seguro", "amable"],
});
```

---

### `ratings.getForDriver(driverId)`

Obtiene todas las calificaciones de un conductor.

**Tipo**: `publicProcedure` (sin autenticación requerida)  
**Método**: GET  
**Parámetros**:

```typescript
{
  driverId: number;
}
```

**Respuesta**: Array de calificaciones

**Ejemplo**:

```typescript
const { data: driverRatings } = trpc.ratings.getForDriver.useQuery({
  driverId: 15,
});

const averageRating = driverRatings?.reduce((sum, r) => sum + r.rating, 0) / driverRatings?.length;
console.log(averageRating); // 4.8
```

---

## 💳 Métodos de Pago

Endpoints para gestionar métodos de pago.

### `paymentMethods.list()`

Obtiene todos los métodos de pago del usuario.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**: Ninguno

**Respuesta**: Array de métodos de pago

**Ejemplo**:

```typescript
const { data: paymentMethods } = trpc.paymentMethods.list.useQuery();

paymentMethods?.forEach((method) => {
  console.log(method.type, method.last4Digits, method.isDefault);
});
```

---

### `paymentMethods.setDefault(methodId)`

Establece un método de pago como predeterminado.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: PUT  
**Parámetros**:

```typescript
{
  methodId: number;
}
```

**Respuesta**: Método de pago actualizado

**Ejemplo**:

```typescript
const setDefaultMutation = trpc.paymentMethods.setDefault.useMutation();

await setDefaultMutation.mutateAsync({ methodId: 5 });
```

---

### `paymentMethods.delete(methodId)`

Elimina un método de pago.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: DELETE  
**Parámetros**:

```typescript
{
  methodId: number;
}
```

**Respuesta**: `{ success: true }`

**Ejemplo**:

```typescript
const deleteMethodMutation = trpc.paymentMethods.delete.useMutation();

await deleteMethodMutation.mutateAsync({ methodId: 5 });
```

---

## 🎯 Disponibles

Endpoints para gestionar viajes disponibles (para conductores).

### `availableRides.list()`

Obtiene la lista de viajes disponibles cercanos al conductor.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: GET  
**Parámetros**: Ninguno

**Respuesta**: Array de viajes disponibles

```typescript
{
  id: number;
  passengerId: number;
  passengerName: string;
  passengerRating: number;
  pickupLocation: { latitude: number; longitude: number; address: string };
  dropoffLocation: { latitude: number; longitude: number; address: string };
  distance: number;
  estimatedFare: number;
  urgency: "low" | "normal" | "urgent";
  createdAt: Date;
}
```

**Ejemplo**:

```typescript
const { data: availableRides } = trpc.availableRides.list.useQuery();

availableRides?.forEach((ride) => {
  console.log(ride.passengerName, ride.estimatedFare, ride.urgency);
});
```

---

### `availableRides.accept(rideId)`

Acepta un viaje disponible.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: POST  
**Parámetros**:

```typescript
{
  rideId: number;
}
```

**Respuesta**: Viaje actualizado con estado "accepted"

**Ejemplo**:

```typescript
const acceptRideMutation = trpc.availableRides.accept.useMutation();

await acceptRideMutation.mutateAsync({ rideId: 42 });
```

---

### `availableRides.reject(rideId)`

Rechaza un viaje disponible.

**Tipo**: `protectedProcedure` (requiere autenticación)  
**Método**: POST  
**Parámetros**:

```typescript
{
  rideId: number;
  reason?: string;
}
```

**Respuesta**: `{ success: true }`

**Ejemplo**:

```typescript
const rejectRideMutation = trpc.availableRides.reject.useMutation();

await rejectRideMutation.mutateAsync({
  rideId: 42,
  reason: "Está muy lejos",
});
```

---

## ❌ Errores

La API devuelve errores con códigos y mensajes descriptivos.

### Códigos de Error Comunes

| Código | Significado | Acción |
|--------|-------------|--------|
| `UNAUTHORIZED` | Usuario no autenticado | Redirigir a login |
| `FORBIDDEN` | Usuario no tiene permiso | Mostrar mensaje de error |
| `NOT_FOUND` | Recurso no encontrado | Mostrar 404 |
| `BAD_REQUEST` | Datos inválidos | Validar entrada del usuario |
| `INTERNAL_SERVER_ERROR` | Error del servidor | Reintentar o contactar soporte |

### Manejo de Errores

```typescript
try {
  await trpc.rides.create.mutateAsync(data);
} catch (error) {
  if (error.data?.code === "BAD_REQUEST") {
    console.error("Datos inválidos:", error.message);
  } else if (error.data?.code === "UNAUTHORIZED") {
    router.push("/login");
  } else {
    console.error("Error desconocido:", error.message);
  }
}
```

---

## 📝 Ejemplos Completos

### Ejemplo 1: Solicitar un Viaje (Pasajero)

```typescript
import { trpc } from "@/lib/trpc";
import { useState } from "react";

function RequestRideScreen() {
  const [loading, setLoading] = useState(false);
  const createRideMutation = trpc.rides.create.useMutation();

  const handleRequestRide = async () => {
    setLoading(true);
    try {
      const ride = await createRideMutation.mutateAsync({
        pickupLocation: {
          latitude: -34.9011,
          longitude: -56.1645,
          address: "Mi ubicación",
        },
        dropoffLocation: {
          latitude: -34.8776,
          longitude: -56.1711,
          address: "Destino",
        },
        vehicleType: "comfort",
        estimatedDistance: 5.2,
        estimatedDuration: 12,
      });

      console.log("Viaje creado:", ride.id);
      console.log("Tarifa estimada:", ride.estimatedFare);
    } catch (error) {
      console.error("Error al solicitar viaje:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title="Solicitar Viaje"
      onPress={handleRequestRide}
      disabled={loading}
    />
  );
}
```

---

### Ejemplo 2: Aceptar un Viaje (Conductor)

```typescript
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

function AvailableRidesScreen() {
  const { data: availableRides } = trpc.availableRides.list.useQuery();
  const acceptMutation = trpc.availableRides.accept.useMutation();

  const handleAcceptRide = async (rideId: number) => {
    try {
      await acceptMutation.mutateAsync({ rideId });
      console.log("Viaje aceptado");
    } catch (error) {
      console.error("Error al aceptar viaje:", error);
    }
  };

  return (
    <FlatList
      data={availableRides}
      renderItem={({ item }) => (
        <View>
          <Text>{item.passengerName}</Text>
          <Text>${item.estimatedFare}</Text>
          <Button
            title="Aceptar"
            onPress={() => handleAcceptRide(item.id)}
          />
        </View>
      )}
    />
  );
}
```

---

### Ejemplo 3: Calificar un Viaje

```typescript
import { trpc } from "@/lib/trpc";
import { useState } from "react";

function RateRideScreen({ rideId }: { rideId: number }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createRatingMutation = trpc.ratings.create.useMutation();

  const handleSubmitRating = async () => {
    try {
      await createRatingMutation.mutateAsync({
        rideId,
        rating,
        comment,
        tags: ["limpio", "seguro"],
      });
      console.log("Calificación enviada");
    } catch (error) {
      console.error("Error al enviar calificación:", error);
    }
  };

  return (
    <View>
      <StarRating value={rating} onChange={setRating} />
      <TextInput
        placeholder="Comentario (opcional)"
        value={comment}
        onChangeText={setComment}
        maxLength={500}
      />
      <Button title="Enviar Calificación" onPress={handleSubmitRating} />
    </View>
  );
}
```

---

## 🔗 Referencias

- [Documentación de tRPC](https://trpc.io)
- [Documentación de Zod](https://zod.dev)
- [Documentación de React Query](https://tanstack.com/query/latest)
- [Documentación de Expo](https://docs.expo.dev)

---

**Última actualización**: Diciembre 23, 2024  
**Versión**: 1.0.0
