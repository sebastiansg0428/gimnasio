# 🚀 MEJORAS PARA EL MÓDULO DE PAGOS - FRONTEND

## 📊 Estado Actual vs Mejoras Propuestas

### ✅ **Ya Implementado:**

1. Listado de pagos con filtros básicos
2. Crear nuevo pago
3. Ver detalles de pago
4. Cancelar/Eliminar pago
5. Estadísticas básicas de pagos y membresías
6. Renovar membresía

### 🆕 **MEJORAS A IMPLEMENTAR:**

---

## 1. 📅 **FILTROS POR RANGO DE FECHAS**

**Endpoint Backend:** `GET /pagos?fecha_desde=2026-01-01&fecha_hasta=2026-01-31`

### Implementación:

```jsx
// Ya agregado en tu código:
const [fechaDesde, setFechaDesde] = useState("");
const [fechaHasta, setFechaHasta] = useState("");

// Función para aplicar filtros:
async function aplicarFiltrosFecha() {
  const filtros = {};
  if (fechaDesde) filtros.fecha_desde = fechaDesde;
  if (fechaHasta) filtros.fecha_hasta = fechaHasta;
  if (filtroEstado !== "todos") filtros.estado = filtroEstado;
  if (filtroTipo !== "todos") filtros.tipo_pago = filtroTipo;

  const pagosData = await pagosAPI.getPagos(filtros);
  setPagos(pagosData);
}
```

### UI Sugerido:

```jsx
<HStack>
  <Input
    type="date"
    value={fechaDesde}
    onChange={(e) => setFechaDesde(e.target.value)}
    placeholder="Fecha desde"
  />
  <Input
    type="date"
    value={fechaHasta}
    onChange={(e) => setFechaHasta(e.target.value)}
    placeholder="Fecha hasta"
  />
  <Button onClick={aplicarFiltrosFecha}>Aplicar</Button>
</HStack>
```

---

## 2. ✏️ **EDITAR PAGOS**

**Endpoint Backend:** `PUT /pagos/:id`

### Implementación:

```jsx
const [pagoEditando, setPagoEditando] = useState(null);
const {
  isOpen: isEditOpen,
  onOpen: onEditOpen,
  onClose: onEditClose,
} = useDisclosure();

async function handleEditarPago() {
  try {
    await pagosAPI.updatePago(pagoEditando.id, {
      monto: pagoEditando.monto,
      estado: pagoEditando.estado,
      metodo_pago: pagoEditando.metodo_pago,
      concepto: pagoEditando.concepto,
    });

    toast({
      title: "Pago actualizado exitosamente",
      status: "success",
      duration: 3000,
    });

    await cargarDatos();
    onEditClose();
  } catch (error) {
    toast({
      title: "Error al actualizar pago",
      description: error.message,
      status: "error",
    });
  }
}
```

### Agregar Botón en Tabla:

```jsx
<IconButton
  icon={<FiEdit3 />}
  size="sm"
  variant="ghost"
  colorScheme="orange"
  onClick={() => {
    setPagoEditando(pago);
    onEditOpen();
  }}
  title="Editar pago"
/>
```

---

## 3. 📊 **ESTADÍSTICAS DE PRODUCTOS**

**Endpoint Backend:** `GET /pagos/estadisticas/productos`

### Implementación:

```jsx
const [estadisticasProductos, setEstadisticasProductos] = useState(null);

// En cargarDatos():
const estadisticasProductosData = await fetch(
  "http://localhost:3001/pagos/estadisticas/productos"
)
  .then((r) => (r.ok ? r.json() : null))
  .catch((err) => null);

setEstadisticasProductos(estadisticasProductosData);
```

### UI - Nueva Tarjeta:

```jsx
<Card>
  <CardBody>
    <Heading size="md" mb={4}>
      Ventas de Productos
    </Heading>
    <SimpleGrid columns={3} spacing={4}>
      <Box textAlign="center" p={4} bg="blue.50" borderRadius="md">
        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
          {estadisticasProductos?.totalVendido || 0}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Unidades Vendidas
        </Text>
      </Box>
      <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
        <Text fontSize="2xl" fontWeight="bold" color="green.600">
          ${estadisticasProductos?.ingresoTotal || 0}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Ingresos Totales
        </Text>
      </Box>
      <Box textAlign="center" p={4} bg="purple.50" borderRadius="md">
        <Text fontSize="2xl" fontWeight="bold" color="purple.600">
          {estadisticasProductos?.productosVendidos || 0}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Productos Diferentes
        </Text>
      </Box>
    </SimpleGrid>
  </CardBody>
</Card>
```

---

## 4. 📈 **REPORTES DE INGRESOS MENSUALES**

**Endpoint Backend:** `GET /reportes/ingresos-mensuales`

### Implementación:

```jsx
const [ingresosMensuales, setIngresosMensuales] = useState([]);

// En cargarDatos():
const ingresosData = await fetch(
  "http://localhost:3001/reportes/ingresos-mensuales"
)
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => []);

setIngresosMensuales(ingresosData);
```

### UI - Gráfico de Líneas:

```jsx
<Card>
  <CardBody>
    <Heading size="md" mb={4}>
      Ingresos Mensuales 2026
    </Heading>
    <Box h="300px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ingresosMensuales}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#48BB78"
            strokeWidth={2}
            name="Ingresos"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </CardBody>
</Card>
```

---

## 5. 👥 **FILTRO POR USUARIO**

**Endpoint Backend:** `GET /pagos?usuario_id=1`

### Implementación:

```jsx
const [filtroUsuario, setFiltroUsuario] = useState('')

// En los filtros:
<Select
    placeholder="Filtrar por cliente"
    value={filtroUsuario}
    onChange={(e) => setFiltroUsuario(e.target.value)}
>
    {usuarios.map(u => (
        <option key={u.id} value={u.id}>
            {u.nombre} {u.apellido}
        </option>
    ))}
</Select>

// Al cargar datos:
if (filtroUsuario) filtros.usuario_id = filtroUsuario
```

---

## 6. 📊 **ESTADÍSTICAS DE SESIONES**

**Endpoint Backend:** `GET /pagos/estadisticas/sesiones`

### Implementación:

```jsx
const [estadisticasSesiones, setEstadisticasSesiones] = useState(null);

// Agregar en cargarDatos():
const estadisticasSesionesData = await fetch(
  "http://localhost:3001/pagos/estadisticas/sesiones"
)
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null);

setEstadisticasSesiones(estadisticasSesionesData);
```

### UI:

```jsx
<Card>
  <CardBody>
    <Heading size="md" mb={4}>
      Sesiones de Entrenamiento
    </Heading>
    <SimpleGrid columns={2} spacing={4}>
      <Box textAlign="center" p={4} bg="orange.50" borderRadius="md">
        <Text fontSize="2xl" fontWeight="bold" color="orange.600">
          {estadisticasSesiones?.totalSesiones || 0}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Sesiones Vendidas
        </Text>
      </Box>
      <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
        <Text fontSize="2xl" fontWeight="bold" color="green.600">
          ${estadisticasSesiones?.ingresoTotal || 0}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Ingresos por Sesiones
        </Text>
      </Box>
    </SimpleGrid>
  </CardBody>
</Card>
```

---

## 7. 🏆 **TOP CLIENTES (VENTAS POR USUARIO)**

**Endpoint Backend:** `GET /reportes/ventas-por-usuario`

### Implementación:

```jsx
const [topClientes, setTopClientes] = useState([]);

// En cargarDatos():
const ventasUsuarios = await fetch(
  "http://localhost:3001/reportes/ventas-por-usuario"
)
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => []);

setTopClientes(ventasUsuarios.slice(0, 10)); // Top 10
```

### UI - Nueva Pestaña:

```jsx
<TabPanel>
  <VStack spacing={4} align="stretch">
    <Heading size="md">Top 10 Clientes</Heading>
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Posición</Th>
          <Th>Cliente</Th>
          <Th>Total Pagos</Th>
          <Th>Total Gastado</Th>
        </Tr>
      </Thead>
      <Tbody>
        {topClientes.map((cliente, index) => (
          <Tr key={cliente.id}>
            <Td>
              <Badge colorScheme={index < 3 ? "yellow" : "gray"}>
                #{index + 1}
              </Badge>
            </Td>
            <Td>
              {cliente.nombre} {cliente.apellido}
            </Td>
            <Td>{cliente.totalPagos}</Td>
            <Td fontWeight="bold" color="green.600">
              ${cliente.totalGastado.toLocaleString("es-CO")}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </VStack>
</TabPanel>
```

---

## 8. 🎯 **PRODUCTOS MÁS VENDIDOS**

**Endpoint Backend:** `GET /reportes/ventas-por-producto`

### Implementación:

```jsx
const [productosMasVendidos, setProductosMasVendidos] = useState([]);

// En cargarDatos():
const ventasProductos = await fetch(
  "http://localhost:3001/reportes/ventas-por-producto"
)
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => []);

setProductosMasVendidos(ventasProductos.slice(0, 5)); // Top 5
```

### UI - Gráfico de Barras:

```jsx
<Card>
  <CardBody>
    <Heading size="md" mb={4}>
      Top 5 Productos Más Vendidos
    </Heading>
    <Box h="300px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={productosMasVendidos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="cantidadVendida" fill="#4299E1" name="Unidades" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </CardBody>
</Card>
```

---

## 9. 🔔 **ALERTAS Y NOTIFICACIONES**

### Membresías por Vencer:

```jsx
const [membresiasPorVencer, setMembresiasPorVencer] = useState([]);

// En cargarDatos():
const porVencer = await fetch(
  "http://localhost:3001/reportes/usuarios-con-membresia-por-vencer"
)
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => []);

setMembresiasPorVencer(porVencer);
```

### UI - Alert Banner:

```jsx
{
  membresiasPorVencer.length > 0 && (
    <Alert status="warning" borderRadius="md" mb={4}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>⚠️ Membresías por Vencer</AlertTitle>
        <AlertDescription>
          {membresiasPorVencer.length} clientes tienen membresías que vencen
          pronto
        </AlertDescription>
      </Box>
      <Button size="sm" colorScheme="orange">
        Ver Lista
      </Button>
    </Alert>
  );
}
```

---

## 10. 💾 **EXPORTAR DATOS**

### Botón de Exportar:

```jsx
function exportarAExcel() {
  const datos = pagosFiltrados.map((p) => ({
    ID: p.id,
    Cliente: usuarios.find((u) => u.id === p.usuario_id)?.nombre,
    Tipo: p.tipo_pago,
    Monto: p.monto,
    Método: p.metodo_pago,
    Estado: p.estado,
    Fecha: p.fecha_pago,
    Concepto: p.concepto,
  }));

  // Convertir a CSV
  const csv = convertirACSV(datos);
  descargarCSV(csv, "pagos.csv");
}

function convertirACSV(datos) {
  const headers = Object.keys(datos[0]).join(",");
  const rows = datos.map((d) => Object.values(d).join(","));
  return [headers, ...rows].join("\n");
}

function descargarCSV(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
}
```

### UI:

```jsx
<Button
  leftIcon={<FiDownload />}
  onClick={exportarAExcel}
  variant="outline"
  colorScheme="blue"
>
  Exportar a Excel
</Button>
```

---

## 📝 **PRIORIDADES DE IMPLEMENTACIÓN:**

### 🔴 **Alta Prioridad (Implementar Ya):**

1. ✅ Filtros por rango de fechas (fecha_desde, fecha_hasta)
2. ✏️ Editar pagos existentes
3. 📊 Estadísticas de productos y sesiones

### 🟡 **Media Prioridad (Próximas Semanas):**

4. 👥 Filtro por usuario específico
5. 📈 Reportes de ingresos mensuales con gráficos
6. 🏆 Top clientes y productos más vendidos

### 🟢 **Baja Prioridad (Mejoras Futuras):**

7. 🔔 Sistema de alertas y notificaciones
8. 💾 Exportar datos a Excel/CSV
9. 📊 Dashboard avanzado con múltiples gráficos
10. 🔍 Búsqueda avanzada con múltiples criterios

---

## 🚀 **RESUMEN DE ENDPOINTS A USAR:**

```javascript
// PAGOS
✅ GET /pagos?fecha_desde&fecha_hasta&usuario_id&tipo_pago&estado
✅ GET /pagos/:id
✅ POST /pagos
🆕 PUT /pagos/:id - IMPLEMENTAR
✅ DELETE /pagos/:id
✅ POST /pagos/renovar-membresia

// ESTADÍSTICAS
✅ GET /pagos/estadisticas
✅ GET /pagos/estadisticas/membresias
🆕 GET /pagos/estadisticas/productos - IMPLEMENTAR
🆕 GET /pagos/estadisticas/sesiones - IMPLEMENTAR

// REPORTES
🆕 GET /reportes/ingresos-mensuales - IMPLEMENTAR
🆕 GET /reportes/ventas-por-usuario - IMPLEMENTAR
🆕 GET /reportes/ventas-por-producto - IMPLEMENTAR
🆕 GET /reportes/usuarios-con-membresia-por-vencer - IMPLEMENTAR
```

---

## 💡 **PRÓXIMO PASO SUGERIDO:**

Implementa primero los **filtros de fecha** que ya están parcialmente en tu código, luego agrega la funcionalidad de **editar pagos** para tener un CRUD completo.

---

**Fecha:** 5 de enero de 2026  
**Sistema:** Gestión de Gimnasio - Módulo Pagos  
**Estado:** 📝 Documento de Mejoras
