# 🚀 Guía Rápida: Cómo Usar el Módulo de Usuarios Mejorado

## 📋 Tabla de Contenidos

1. [Vista General](#vista-general)
2. [Panel de Estadísticas](#panel-de-estadísticas)
3. [Filtros Avanzados](#filtros-avanzados)
4. [Crear Nuevo Cliente](#crear-nuevo-cliente)
5. [Gestionar Clientes](#gestionar-clientes)
6. [Casos de Uso Comunes](#casos-de-uso-comunes)

---

## 🎯 Vista General

Al abrir la pestaña de **Clientes/Usuarios**, verás:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 PANEL DE ESTADÍSTICAS (5 Tarjetas)                     │
├─────────────────────────────────────────────────────────────┤
│  🔍 BARRA DE HERRAMIENTAS                                   │
│  [+ Nuevo Cliente] [🔄 Actualizar] [🔍 Buscar...] [Filtros]│
├─────────────────────────────────────────────────────────────┤
│  📋 TABLA DE CLIENTES                                       │
│  ID | Nombre | Email | Teléfono | Género | Membresía ...   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Panel de Estadísticas

### 5 Métricas en Tiempo Real:

#### 1. 🟢 Total Clientes

- **Número grande**: Total de clientes en el sistema
- **Texto pequeño**: Cantidad de activos
- **Color**: Verde

#### 2. 🟠 Por Vencer

- **Número**: Membresías que vencen en los próximos 7 días
- **Texto**: "Próximos 7 días"
- **Color**: Naranja
- **Acción**: Contactar para renovación

#### 3. 🔴 Vencidas

- **Número**: Membresías ya vencidas
- **Texto**: "Renovación pendiente"
- **Color**: Rojo
- **Acción**: Renovar urgente

#### 4. 🔵 Visitas Hoy

- **Número**: Clientes que visitaron hoy
- **Texto**: "Registradas"
- **Color**: Azul
- **Útil para**: Control de asistencia

#### 5. ⚫ Inactivos

- **Número**: Usuarios inactivos
- **Texto**: "Sin actividad"
- **Color**: Gris
- **Útil para**: Campañas de reactivación

---

## 🔍 Filtros Avanzados

### 1️⃣ Búsqueda Rápida

```
🔍 [Buscar clientes...] ❌
```

- Escribe nombre, apellido, email o teléfono
- Búsqueda en tiempo real (espera 350ms)
- Presiona ❌ para limpiar

**Ejemplos:**

- `Juan` - Busca todos los Juan
- `gmail.com` - Busca emails de Gmail
- `3001234567` - Busca por teléfono

### 2️⃣ Filtro de Estado

```
[Todos los estados ▼]
```

Opciones:

- **Todos los estados** - Ver todos
- **Activos** - Solo usuarios activos
- **Inactivos** - Solo usuarios inactivos

### 3️⃣ Filtro de Membresía

```
[Todas las membresías ▼]
```

Opciones:

- Todas las membresías
- Diaria
- Semanal
- Quincenal
- Mensual
- Anual

### 4️⃣ Filtro de Vencidas

```
☑️ Solo vencidas
```

- Marca para ver **solo** membresías vencidas
- Útil para renovaciones masivas

### 5️⃣ Contador de Resultados

```
🔵 127 clientes
```

- Badge azul que muestra cuántos clientes coinciden con tus filtros

---

## ➕ Crear Nuevo Cliente

### Paso 1: Abrir Modal

Clic en botón verde **[+ Nuevo Cliente]**

### Paso 2: Llenar Formulario

#### Datos Básicos (Obligatorios)

```
Nombre:      [_____________] *
Apellido:    [_____________]
Email:       [_____________] *
Contraseña:  [_____________] * (mínimo 6 caracteres)
```

#### Datos de Contacto

```
Teléfono:        [_____________]
Fecha Nacimiento: [__/__/____]
Género:          [Masculino ▼]
```

#### Membresía

```
Tipo:   [DIARIA ▼]  (Diaria/Semanal/Quincenal/Mensual/Anual)
Precio: [_____________] $
Método: [Efectivo ▼]  (Efectivo/Tarjeta/Transferencia)

☑️ Registrar pago inicial
```

### Paso 3: Guardar

- Clic en **[Crear Cliente]**
- Si marcaste "Registrar pago", se creará automáticamente el pago
- Verás notificación de éxito

### 🎯 Resultado:

- Cliente creado en la base de datos
- Fecha de vencimiento calculada automáticamente
- Pago registrado (si lo marcaste)
- Aparece en la tabla inmediatamente

---

## 🎛️ Gestionar Clientes

### Acciones Disponibles (Menú ⋮)

Para cada cliente, haz clic en el botón **⋮** para ver:

#### 1. 👁️ Ver Detalles

- Información completa del cliente
- Rutinas asignadas
- Historial de visitas

#### 2. ✏️ Editar

- Modificar datos personales
- Cambiar tipo de membresía
- Actualizar precio
- Renovar membresía

#### 3. 🏃 Registrar Visita

```
Cliente visita el gimnasio
    ↓
Clic en "Registrar Visita"
    ↓
Contador aumenta +1
Última visita actualizada
```

#### 4. 💳 Registrar Pago

- Pago de membresía
- Pago de producto
- Pago de sesión
- Método de pago

#### 5. 📋 Asignar Rutina

- Seleccionar rutina disponible
- Asignar al cliente
- Ver en detalles

#### 6. ✅ Activar / ⛔ Desactivar

- Cambiar estado del cliente
- No elimina datos
- Reversible

#### 7. 🗑️ Eliminar

- Elimina permanentemente
- ⚠️ Acción irreversible

---

## 💡 Casos de Uso Comunes

### Caso 1: Renovar Membresías que Vencen Pronto

```
1. Marcar: ☑️ Solo vencidas
2. Filtrar: [Por Vencer ▼]
3. Para cada cliente:
   - Clic en ⋮ → Editar
   - Marcar: ☑️ Renovar membresía
   - Ingresar precio
   - Guardar
```

### Caso 2: Buscar Cliente Específico

```
1. Escribir nombre en búsqueda: [Juan Pérez]
2. Esperar 350ms
3. Ver resultados filtrados
```

### Caso 3: Ver Solo Clientes Mensuales Activos

```
1. Estado: [Activos ▼]
2. Membresía: [MENSUAL ▼]
3. Ver resultados en tabla
```

### Caso 4: Registrar Visita Matutina

```
1. Cliente llega al gimnasio
2. Buscar: [Nombre del cliente]
3. Clic en ⋮ → Registrar Visita
4. ✅ Confirmación
```

### Caso 5: Nuevo Cliente con Pago

```
1. [+ Nuevo Cliente]
2. Llenar datos
3. Tipo: [MENSUAL ▼]
4. Precio: [50000]
5. ☑️ Registrar pago inicial
6. [Crear Cliente]
7. ✅ Cliente + Pago creados
```

### Caso 6: Campaña de Renovación Masiva

```
1. Filtro: ☑️ Solo vencidas
2. Ver lista completa
3. Para cada uno:
   - Contactar por teléfono
   - Renovar membresía
   - Registrar pago
```

---

## 🔄 Actualización de Datos

### Automática

- **Cada 5 segundos**: Se actualiza la tabla automáticamente
- No necesitas hacer nada
- Verás los cambios en tiempo real

### Manual

- Clic en **[🔄 Actualizar]**
- Fuerza actualización inmediata
- Útil después de hacer cambios

---

## 📱 Atajos y Tips

### Búsqueda Rápida

- **No esperes**: Escribe y automáticamente busca
- **Limpia rápido**: Clic en ❌
- **Busca parcial**: "Juan" encuentra "Juan Pérez" y "Juana Díaz"

### Filtros Combinados

Puedes combinar múltiples filtros:

```
Estado: [Activos]
+ Membresía: [MENSUAL]
+ Búsqueda: [gmail]
= Clientes activos con membresía mensual y email Gmail
```

### Contador Visual

El badge azul **🔵 127 clientes** te indica:

- Cuántos resultados tienes
- Si los filtros funcionan
- Si tu búsqueda encontró algo

---

## ⚠️ Advertencias y Consideraciones

### ⚠️ Eliminar Cliente

- **Permanente**: No se puede deshacer
- **Alternativa**: Mejor usa "Desactivar"
- **Datos**: Se pierden todos los registros

### ⚠️ Cambiar Estado

- **Reversible**: Puedes reactivar después
- **Visible**: Cliente sigue en la base
- **Recomendado**: Mejor que eliminar

### ⚠️ Renovar Membresía

- **Fecha**: Se calcula automáticamente
- **Pago**: Marca la casilla para registrar
- **Precio**: Verifica antes de guardar

---

## 🐛 Solución de Problemas

### No se ven clientes

1. Verifica filtros (quita ☑️ Solo vencidas)
2. Limpia búsqueda (clic en ❌)
3. Cambia a "Todos los estados"
4. Clic en [🔄 Actualizar]

### Búsqueda no encuentra nada

1. Verifica ortografía
2. Intenta con menos letras
3. Prueba con email o teléfono
4. Limpia y vuelve a intentar

### Error al crear cliente

1. Verifica email único (no duplicado)
2. Contraseña mínimo 6 caracteres
3. Precio solo si marcas "Registrar pago"
4. Revisa consola del navegador (F12)

### Estadísticas incorrectas

1. Espera actualización automática (5 segundos)
2. Clic en [🔄 Actualizar]
3. Recarga página (F5)

---

## 📊 Interpretación de Colores

### Badges de Membresía

- 🟣 **Púrpura**: Anual
- 🔵 **Azul**: Quincenal
- 🟢 **Verde**: Semanal
- 🟠 **Naranja**: Diaria

### Badges de Género

- 🔵 **Azul**: Masculino
- 🔴 **Rosa**: Femenino
- ⚫ **Gris**: Otro

### Estados de Membresía

- 🟢 **Verde**: Activa (más de 15 días)
- 🟡 **Amarillo**: 8-15 días para vencer
- 🟠 **Naranja**: Vence en 7 días o menos
- 🔴 **Rojo**: Vencida

---

## 🎯 Mejores Prácticas

### 1. Registro de Visitas

✅ Registra cada visita del cliente

- Ayuda a estadísticas
- Control de asistencia
- Identifica clientes inactivos

### 2. Renovaciones Anticipadas

✅ Renueva antes del vencimiento

- Contacta 7 días antes
- Ofrece descuentos por adelantado
- Evita pérdida de clientes

### 3. Limpieza de Base de Datos

✅ Desactiva en lugar de eliminar

- Mantiene historial
- Permite reactivación
- Estadísticas más precisas

### 4. Verificación de Datos

✅ Revisa antes de guardar

- Email único y válido
- Teléfono correcto
- Precio de membresía coherente

---

## 📞 Ayuda Adicional

### Logs en Consola

Presiona **F12** para ver:

- Peticiones al backend
- Errores detallados
- Estado de la conexión
- Datos recibidos

### Mensajes del Sistema

- ✅ **Verde**: Éxito
- ⚠️ **Amarillo**: Advertencia
- ❌ **Rojo**: Error
- ℹ️ **Azul**: Información

---

**¿Necesitas más ayuda?** Revisa el archivo `MEJORAS_USUARIOS_FRONTEND.md` para detalles técnicos.
