# 📊 Implementación de Reportes y Facturas - Sistema de Gimnasio

## ✅ Componentes Implementados

### 1. **ReportesTab.jsx** - Sistema de Reportes y Analíticas

Un componente completo de reportes con visualizaciones gráficas interactivas.

#### Características:

- **📈 Gráficos de Ingresos**:

  - Gráfico de área para ingresos mensuales
  - Gráfico de pastel para ventas por producto
  - Tabla de top compradores

- **👥 Análisis de Usuarios**:

  - Gráfico de barras de usuarios nuevos por mes
  - Estadísticas de crecimiento

- **🛒 Reportes de Productos**:

  - Productos más vendidos (gráfico horizontal)
  - Tabla detallada con posiciones y métricas
  - Ingresos totales por producto

- **💪 Rutinas Populares**:

  - Tabla de rutinas más asignadas
  - Filtrado por objetivo y nivel
  - Contador de usuarios por rutina

- **⚠️ Sistema de Alertas**:
  - Membresías por vencer (próximos 7 días)
  - Usuarios inactivos (más de 30 días)
  - Badges con códigos de color

#### APIs Integradas:

```javascript
reportesAPI.getIngresosMensuales();
reportesAPI.getUsuariosNuevos();
reportesAPI.getProductosMasVendidos();
reportesAPI.getRutinasPopulares();
reportesAPI.getMembresiasPorVencer();
reportesAPI.getUsuariosInactivos();
reportesAPI.getVentasPorUsuario();
reportesAPI.getVentasPorProducto();
```

---

### 2. **FacturasTab.jsx** - Gestión de Facturas

Sistema completo de gestión de facturas con CRUD y filtros.

#### Características:

- **📋 Listado de Facturas**:
  - Tabla completa con todas las facturas
  - Filtros por estado, fecha desde/hasta
  - Badges de estado con códigos de color
- **🧾 Crear Factura**:
  - Formulario con todos los campos
  - Cálculo automático de totales
  - Validación de datos
- **👁️ Ver Detalles**:

  - Modal con información completa
  - Desglose de subtotal, impuestos, descuentos
  - Información del cliente

- **📊 Estadísticas**:
  - Total de facturas
  - Facturas pagadas/pendientes
  - Monto total recaudado

#### APIs Integradas:

```javascript
facturasAPI.getFacturas(filtros);
facturasAPI.getFactura(id);
facturasAPI.createFactura(data);
facturasAPI.updateFactura(id, data);
facturasAPI.deleteFactura(id);
```

---

## 🔧 Archivos Modificados

### 1. **src/services/api.js**

Agregadas las siguientes APIs:

```javascript
// REPORTES
export const reportesAPI = {
  getIngresosMensuales,
  getUsuariosNuevos,
  getProductosMasVendidos,
  getRutinasPopulares,
  getMembresiasPorVencer,
  getUsuariosInactivos,
  getVentasPorUsuario,
  getVentasPorProducto,
};

// FACTURAS
export const facturasAPI = {
  getFacturas,
  getFactura,
  createFactura,
  updateFactura,
  deleteFactura,
};

// RBAC (Sistema de Roles y Permisos)
export const rbacAPI = {
  getRoles,
  getPermisos,
  getRolPermisos,
  getUsuarioRoles,
  asignarRol,
  revocarRol,
  createRol,
  createPermiso,
  getEstadisticas,
  getMe,
};
```

### 2. **src/utils/api.js**

Agregadas funciones compatibles para reportes y facturas con headers de autenticación.

### 3. **src/pages/Dashboard.jsx**

- Agregados imports de `ReportesTab` y `FacturasTab`
- Nuevos botones en sidebar:
  - 📊 Reportes (con ícono FiBarChart2)
  - 🧾 Facturas (con ícono FiFileText)
- Renderizado condicional de los nuevos componentes

### 4. **src/config.js** ⚠️ (Corregido anteriormente)

- Agregado token de autenticación a `checkBackendConnection()`

---

## 🎨 Características de UI/UX

### Gráficos y Visualizaciones:

- **Recharts** para gráficos interactivos
- Gráficos de área (AreaChart)
- Gráficos de barras (BarChart)
- Gráficos de pastel (PieChart)
- Tooltips personalizados
- Leyendas y labels automáticos

### Diseño:

- Cards con Chakra UI
- Tabs para organización
- Badges con códigos de color semánticos
- Responsive design (móvil/tablet/desktop)
- Spinners de carga
- Alertas y mensajes de estado

### Interactividad:

- Filtros en tiempo real
- Botones de actualizar
- Modales para crear/editar
- Confirmaciones de eliminación
- Toast notifications

---

## 📋 Endpoints del Backend Utilizados

### Reportes:

- `GET /reportes/ingresos-mensuales`
- `GET /reportes/usuarios-nuevos-mensuales`
- `GET /reportes/productos-mas-vendidos`
- `GET /reportes/rutinas-populares`
- `GET /reportes/usuarios-con-membresia-por-vencer`
- `GET /reportes/usuarios-inactivos`
- `GET /reportes/ventas-por-usuario`
- `GET /reportes/ventas-por-producto`

### Facturas:

- `GET /facturas?estado=&fecha_desde=&fecha_hasta=`
- `GET /facturas/:id`
- `POST /facturas`
- `PUT /facturas/:id`
- `DELETE /facturas/:id`

### RBAC (Disponible pero no implementado en UI aún):

- `GET /rbac/roles`
- `GET /rbac/permisos`
- `GET /rbac/usuarios/:id/roles`
- `POST /rbac/usuarios/:id/roles`
- `DELETE /rbac/usuarios/:id/roles/:rolNombre`
- `GET /me`

---

## 🚀 Cómo Usar

### 1. Acceder a Reportes:

1. Iniciar sesión en el sistema
2. Ir al Dashboard
3. Click en el botón "📊 Reportes" en el sidebar
4. Navegar por los tabs:
   - Ingresos
   - Usuarios
   - Productos
   - Rutinas
   - Alertas

### 2. Gestionar Facturas:

1. Click en "🧾 Facturas" en el sidebar
2. Ver estadísticas en los cards superiores
3. Aplicar filtros por estado o fechas
4. Crear nueva factura con el botón "+ Nueva Factura"
5. Ver detalles o eliminar facturas desde la tabla

### 3. Crear una Factura:

1. Click en "+ Nueva Factura"
2. Seleccionar usuario
3. Ingresar descripción
4. Completar subtotal, impuestos, descuento
5. El total se calcula automáticamente
6. Seleccionar fechas y estado
7. Click en "Crear Factura"

---

## 🔐 Seguridad

Todas las peticiones incluyen el token de autenticación:

```javascript
headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
}
```

---

## 📊 Métricas y KPIs Mostrados

### Reportes de Ingresos:

- Total de ingresos del año
- Ingresos mensuales (gráfico)
- Top compradores
- Ventas por producto

### Reportes de Usuarios:

- Total usuarios nuevos del año
- Crecimiento mensual
- Distribución activos/inactivos

### Reportes de Productos:

- Productos más vendidos
- Unidades vendidas
- Ingresos por producto
- Rankings con medallas

### Alertas Proactivas:

- Membresías por vencer (7 días)
- Usuarios inactivos (30+ días)
- Días restantes
- Códigos de color por urgencia

---

## 🎯 Próximas Mejoras Sugeridas

1. **Sistema RBAC UI**:

   - Componente para gestión de roles
   - Asignación de permisos
   - Visualización de jerarquías

2. **Exportar Reportes**:

   - PDF
   - Excel
   - CSV

3. **Gráficos Adicionales**:

   - Comparativas año anterior
   - Proyecciones
   - Tendencias

4. **Facturas Mejoradas**:

   - Generar PDF de factura
   - Envío por email
   - Recordatorios automáticos
   - Pagos en línea

5. **Dashboard Mejorado**:
   - Widgets personalizables
   - Drag & drop
   - Filtros de fecha
   - Vista ejecutiva

---

## ✅ Testing Checklist

- [x] Conexión con backend verificada
- [x] Tokens de autenticación incluidos
- [x] Manejo de errores implementado
- [x] Spinners de carga
- [x] Notificaciones toast
- [x] Responsive design
- [x] Validación de formularios
- [x] Sin errores de ESLint
- [x] Código documentado

---

## 📦 Dependencias Utilizadas

- **Chakra UI**: Componentes y diseño
- **Recharts**: Gráficos interactivos
- **React Icons**: Iconos (FiBarChart2, FiFileText, etc.)
- **React Router**: Navegación

---

## 👨‍💻 Autor

Implementación completa del sistema de reportes y facturas para el Sistema de Gestión de Gimnasio.

**Fecha**: Enero 2026
