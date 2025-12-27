# 🏋️ Sistema de Entrenadores - Documentación

## ✅ Implementación Completada

El sistema de entrenadores está completamente integrado con el backend de tu aplicación.

## 📦 Archivos Actualizados

### 1. [src/utils/api.js](src/utils/api.js)

Funciones API agregadas para entrenadores:

#### Gestión Básica de Entrenadores

```javascript
import {
  getEntrenadores, // GET /entrenadores (con filtros)
  getEntrenador, // GET /entrenadores/:id
  createEntrenador, // POST /entrenadores
  updateEntrenador, // PUT /entrenadores/:id
  deleteEntrenador, // DELETE /entrenadores/:id
} from "./utils/api";
```

#### Horarios

```javascript
import {
  getHorariosEntrenador, // GET /entrenadores/:id/horarios
  createHorarioEntrenador, // POST /entrenadores/:id/horarios
  deleteHorarioEntrenador, // DELETE /entrenadores/:id/horarios/:horario_id
} from "./utils/api";
```

#### Clientes del Entrenador

```javascript
import {
  getClientesEntrenador, // GET /entrenadores/:entrenador_id/clientes
  asignarClienteEntrenador, // POST /entrenadores/:entrenador_id/clientes/:usuario_id
  quitarClienteEntrenador, // DELETE /entrenadores/:entrenador_id/clientes/:usuario_id
} from "./utils/api";
```

#### Sesiones

```javascript
import {
  getSesionesEntrenador, // GET /entrenadores/:entrenador_id/sesiones
  createSesionEntrenador, // POST /entrenadores/:entrenador_id/sesiones
  updateSesion, // PUT /sesiones/:id
} from "./utils/api";
```

#### Valoraciones

```javascript
import {
  getValoracionesEntrenador, // GET /entrenadores/:entrenador_id/valoraciones
  createValoracionEntrenador, // POST /entrenadores/:entrenador_id/valoraciones
} from "./utils/api";
```

#### Estadísticas

```javascript
import {
  getEstadisticasEntrenadores, // GET /entrenadores/estadisticas
} from "./utils/api";
```

### 2. [src/components/EntrenadoresTab.jsx](src/components/EntrenadoresTab.jsx)

Componente completamente actualizado con:

- ✅ Conexión al backend (eliminado localStorage)
- ✅ CRUD completo de entrenadores
- ✅ Filtros por especialidad y estado
- ✅ Búsqueda en tiempo real
- ✅ Formulario mejorado con validaciones

## 🎯 Funcionalidades Implementadas

### Gestión de Entrenadores

- ✅ Listar todos los entrenadores
- ✅ Filtrar por especialidad (fuerza, cardio, crossfit, hipertrofia, etc.)
- ✅ Filtrar por estado (activo/inactivo)
- ✅ Crear nuevos entrenadores
- ✅ Editar entrenadores existentes
- ✅ Eliminar entrenadores
- ✅ Búsqueda por nombre o email

### Campos del Entrenador

- **Nombre** (requerido)
- **Email** (requerido)
- **Teléfono**
- **Especialidad** (requerido): fuerza, cardio, crossfit, hipertrofia, pérdida de peso, funcional, yoga, pilates
- **Años de experiencia** (requerido)
- **Estado** (requerido): activo/inactivo
- **Certificaciones**: Texto libre para NSCA, ACSM, ACE, NASM, etc.
- **Biografía**: Descripción del entrenador

## 📝 Ejemplos de Uso

### Listar Entrenadores

```javascript
// Todos los entrenadores
const entrenadores = await getEntrenadores();

// Filtrar por especialidad
const fuerzaEntrenadores = await getEntrenadores({ especialidad: "fuerza" });

// Filtrar por estado
const activos = await getEntrenadores({ estado: "activo" });

// Combinar filtros
const cardioActivos = await getEntrenadores({
  especialidad: "cardio",
  estado: "activo",
});
```

### Crear Entrenador

```javascript
const nuevoEntrenador = await createEntrenador({
  nombre: "Carlos Fitness",
  email: "carlos@gym.com",
  telefono: "555-1234",
  especialidad: "fuerza",
  experiencia_anos: 5,
  estado: "activo",
  certificaciones: "NSCA, ACSM, ACE",
  bio: "Entrenador especializado en fuerza con 5 años de experiencia",
});
```

### Actualizar Entrenador

```javascript
await updateEntrenador(entrenadorId, {
  estado: "inactivo",
  certificaciones: "NSCA, ACSM, ACE, NASM",
});
```

### Gestionar Horarios

```javascript
// Ver horarios del entrenador
const horarios = await getHorariosEntrenador(entrenadorId);

// Crear nuevo horario
await createHorarioEntrenador(entrenadorId, {
  dia_semana: "lunes",
  hora_inicio: "09:00",
  hora_fin: "12:00",
  disponible: true,
});

// Eliminar horario
await deleteHorarioEntrenador(entrenadorId, horarioId);
```

### Gestionar Clientes

```javascript
// Ver clientes del entrenador
const clientes = await getClientesEntrenador(entrenadorId);

// Asignar cliente a entrenador
await asignarClienteEntrenador(entrenadorId, usuarioId, {
  fecha_inicio: "2025-01-01",
  objetivo: "Ganar masa muscular",
  notas: "Cliente principiante",
});

// Quitar cliente del entrenador
await quitarClienteEntrenador(entrenadorId, usuarioId);
```

### Gestionar Sesiones

```javascript
// Ver sesiones del entrenador
const sesiones = await getSesionesEntrenador(entrenadorId);

// Crear nueva sesión
await createSesionEntrenador(entrenadorId, {
  usuario_id: 1,
  fecha: "2025-01-15",
  hora_inicio: "10:00",
  duracion_minutos: 60,
  tipo: "entrenamiento",
  notas: "Sesión de fuerza",
});

// Actualizar sesión
await updateSesion(sesionId, {
  estado: "completada",
  notas_sesion: "Excelente progreso",
});
```

### Valoraciones

```javascript
// Ver valoraciones del entrenador
const valoraciones = await getValoracionesEntrenador(entrenadorId);

// Crear valoración
await createValoracionEntrenador(entrenadorId, {
  usuario_id: 1,
  puntuacion: 5,
  comentario: "Excelente entrenador, muy profesional",
});
```

### Estadísticas

```javascript
// Obtener estadísticas generales
const stats = await getEstadisticasEntrenadores();

// Resultado ejemplo:
// {
//     total_entrenadores: 10,
//     activos: 8,
//     inactivos: 2,
//     total_clientes: 45,
//     promedio_valoracion: 4.7,
//     especialidades: {
//         fuerza: 3,
//         cardio: 2,
//         crossfit: 2,
//         hipertrofia: 3
//     }
// }
```

## 🎨 Interfaz de Usuario

### Tab de Entrenadores

El componente incluye:

- **Botón "Nuevo Entrenador"**: Abre modal para crear
- **Barra de búsqueda**: Buscar por nombre o email
- **Filtro de especialidad**: Dropdown con todas las especialidades
- **Filtro de estado**: Activo/Inactivo/Todos
- **Tabla de entrenadores**: Con avatar, información y acciones
- **Modal de formulario**: Para crear/editar con todos los campos

### Acciones Disponibles

- ✏️ **Editar**: Modificar información del entrenador
- 🗑️ **Eliminar**: Borrar entrenador (con confirmación)

## 🔄 Flujo de Trabajo Típico

### 1. Agregar Nuevo Entrenador

1. Click en "Nuevo Entrenador"
2. Completar formulario:
   - Nombre y email (requeridos)
   - Especialidad y experiencia
   - Certificaciones y biografía
3. Click en "Crear"

### 2. Gestionar Horarios del Entrenador

```javascript
// Agregar horarios de lunes a viernes
const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];
for (const dia of diasSemana) {
  await createHorarioEntrenador(entrenadorId, {
    dia_semana: dia,
    hora_inicio: "08:00",
    hora_fin: "17:00",
    disponible: true,
  });
}
```

### 3. Asignar Clientes

```javascript
// Asignar múltiples clientes a un entrenador
const clienteIds = [1, 2, 3, 4];
for (const clienteId of clienteIds) {
  await asignarClienteEntrenador(entrenadorId, clienteId, {
    fecha_inicio: new Date().toISOString().split("T")[0],
    objetivo: "Entrenamiento personalizado",
  });
}
```

### 4. Registrar Sesión de Entrenamiento

```javascript
await createSesionEntrenador(entrenadorId, {
  usuario_id: clienteId,
  fecha: "2025-01-15",
  hora_inicio: "10:00",
  duracion_minutos: 60,
  tipo: "entrenamiento",
  notas: "Rutina de piernas",
});

// Después de completar la sesión
await updateSesion(sesionId, {
  estado: "completada",
  notas_sesion: "Cliente completó todos los ejercicios correctamente",
});
```

## 📊 Características del Sistema

### Especialidades Disponibles

- 💪 Fuerza
- 🏃 Cardio
- 🏋️ CrossFit
- 📈 Hipertrofia
- 📉 Pérdida de peso
- 🤸 Funcional
- 🧘 Yoga
- 🧘 Pilates

### Estados del Entrenador

- ✅ **Activo**: Disponible para asignar clientes y sesiones
- ❌ **Inactivo**: No disponible (vacaciones, licencia, etc.)

## 🎓 Certificaciones Comunes

- **NSCA**: National Strength and Conditioning Association
- **ACSM**: American College of Sports Medicine
- **ACE**: American Council on Exercise
- **NASM**: National Academy of Sports Medicine
- **CrossFit Level 1/2/3**
- **ISSA**: International Sports Sciences Association

## 🔐 Validaciones

### Backend (según estructura típica)

- Nombre: requerido, mínimo 3 caracteres
- Email: requerido, formato válido, único
- Especialidad: requerido, valor válido
- Experiencia: número >= 0
- Estado: 'activo' o 'inactivo'

### Frontend

- ✅ Campos requeridos marcados visualmente
- ✅ Validación de email
- ✅ Números solo en experiencia
- ✅ Confirmación antes de eliminar

## 💡 Mejoras Futuras Sugeridas

1. **Vista detallada del entrenador**

   - Modal con pestañas para horarios, clientes, sesiones, valoraciones
   - Gráficos de desempeño

2. **Calendario de disponibilidad**

   - Vista semanal/mensual de horarios
   - Reserva de sesiones

3. **Dashboard de métricas**

   - Clientes activos por entrenador
   - Sesiones completadas
   - Promedio de valoraciones
   - Ingresos generados

4. **Sistema de notificaciones**

   - Recordatorios de sesiones
   - Nuevas asignaciones de clientes

5. **Gestión de pagos**
   - Comisiones por sesión
   - Reportes financieros

## ⚡ Estado Actual

| Funcionalidad     | Backend | Frontend     | Estado           |
| ----------------- | ------- | ------------ | ---------------- |
| CRUD Entrenadores | ✅      | ✅           | Completo         |
| Horarios          | ✅      | 📋 API lista | Usar manualmente |
| Clientes          | ✅      | 📋 API lista | Usar manualmente |
| Sesiones          | ✅      | 📋 API lista | Usar manualmente |
| Valoraciones      | ✅      | 📋 API lista | Usar manualmente |
| Estadísticas      | ✅      | 📋 API lista | Usar manualmente |

## 🚀 Próximos Pasos

Para implementar las funcionalidades avanzadas (horarios, clientes, sesiones), podrías:

1. Crear componentes específicos para cada función
2. Agregar modales detallados con pestañas
3. Implementar vistas de calendario
4. Agregar dashboards de métricas

¡El sistema base está listo y funcionando! 🎉
