# 🔌 Configuración de Conexión Frontend-Backend

## ✅ Configuración Completada

### URLs Configuradas:

- **Frontend**: http://localhost:5173 (Vite)
- **Backend**: http://localhost:3001

### Archivos Actualizados:

1. ✅ `/src/services/api.js` - API principal con todos los endpoints
2. ✅ `/src/utils/api.js` - Funciones completas de ejercicios, rutinas, usuarios y productos
3. ✅ `/src/utils/auth.js` - Autenticación (login/register)
4. ✅ `/src/config.js` - Verificación de conexión
5. ✅ `/src/App.jsx` - Verificación automática al cargar
6. ✅ `/src/components/EjerciciosTab.jsx` - Nuevo componente para gestionar ejercicios
7. ✅ `/src/pages/Dashboard.jsx` - Agregado tab de Ejercicios

## 🚀 Cómo Usar

### 1. Iniciar el Backend

```bash
cd C:\Users\sebas\OneDrive\Escritorio\ejemplo_backEnd
node index.js
```

### 2. Iniciar el Frontend

```bash
cd "C:\Users\sebas\OneDrive\Escritorio\Componente front-end del proyecto formativo y proyectos de clase (listas de chequeo)\gimnasio"
npm run dev
```

## 📋 Endpoints Disponibles en el Frontend

### Autenticación

```javascript
import { loginUser, registerUser } from "./utils/auth";

// Login
await loginUser({ email, password });

// Registro
await registerUser({ name, email, password });
```

### Ejercicios (NUEVO)

```javascript
import {
  getEjercicios,
  getEjercicio,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio,
} from "./utils/api";

// Listar ejercicios (con filtros opcionales)
const ejercicios = await getEjercicios();
const pechoFuerza = await getEjercicios({
  grupo_muscular: "pecho",
  tipo: "fuerza",
});
const principiantes = await getEjercicios({ nivel: "principiante" });

// Ejercicio específico
const ejercicio = await getEjercicio(id);

// Crear ejercicio
await createEjercicio({
  nombre: "Press de banca",
  descripcion: "Ejercicio para pecho",
  grupo_muscular: "pecho",
  tipo: "fuerza",
  nivel: "intermedio",
  equipo_necesario: "Barra, banco",
  instrucciones: "Acuéstate en el banco...",
});

// Actualizar ejercicio
await updateEjercicio(id, { nombre: "Press de banca inclinado" });

// Eliminar ejercicio
await deleteEjercicio(id);
```

### Rutinas (NUEVO)

```javascript
import {
  getRutinas,
  getRutina,
  createRutina,
  updateRutina,
  deleteRutina,
  addEjercicioToRutina,
  updateEjercicioInRutina,
  deleteEjercicioFromRutina,
  getEstadisticasRutinas,
  assignRutinaToUsuario,
  getRutinasUsuario,
  updateAsignacionRutina,
} from "./utils/api";

// Listar rutinas (con filtros opcionales)
const rutinas = await getRutinas();
const hipertrofia = await getRutinas({
  objetivo: "hipertrofia",
  nivel: "intermedio",
});
const publicas = await getRutinas({ tipo: "publica" });

// Rutina específica con ejercicios
const rutina = await getRutina(id);

// Crear rutina
await createRutina({
  nombre: "Rutina Full Body",
  descripcion: "Rutina para principiantes",
  objetivo: "fuerza",
  nivel: "principiante",
  duracion_semanas: 8,
  frecuencia_por_semana: 3,
  tipo: "publica",
});

// Actualizar rutina
await updateRutina(id, { nombre: "Rutina Full Body Actualizada" });

// Eliminar rutina
await deleteRutina(id);

// Agregar ejercicio a rutina
await addEjercicioToRutina(rutinaId, {
  ejercicio_id: 1,
  series: 3,
  repeticiones: 10,
  descanso_segundos: 60,
  orden: 1,
});

// Actualizar ejercicio en rutina
await updateEjercicioInRutina(rutinaId, ejercicioId, {
  series: 4,
  repeticiones: 12,
});

// Eliminar ejercicio de rutina
await deleteEjercicioFromRutina(rutinaId, ejercicioId);

// Estadísticas de rutinas
const stats = await getEstadisticasRutinas();

// Asignar rutina a usuario
await assignRutinaToUsuario(usuarioId, rutinaId, {
  fecha_inicio: "2025-01-01",
  notas: "Rutina inicial",
});

// Ver rutinas de usuario
const rutinasUsuario = await getRutinasUsuario(usuarioId);

// Actualizar progreso de rutina asignada
await updateAsignacionRutina(usuarioId, asignacionId, {
  progreso: 75,
  completada: false,
});
```

### Usuarios

import {
getUsuarios,
getUsuario,
updateUsuario,
deleteUsuario,
cambiarEstadoUsuario,
registrarVisita,
getEstadisticasUsuarios,
} from "./utils/api";

// Listar usuarios
const usuarios = await getUsuarios();

// Usuario específico
const usuario = await getUsuario(id);

// Actualizar usuario
await updateUsuario(id, { nombre, email, telefono });

// Cambiar estado
await cambiarEstadoUsuario(id, "activo"); // 'activo' o 'inactivo'

// Registrar visita
await registrarVisita(id);

// Estadísticas
const stats = await getEstadisticasUsuarios();

````

### Productos

```javascript
import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  venderProducto,
  getEstadisticasProductos,
  getVentas,
} from "./utils/api";

// Listar productos (con filtros opcionales)
const productos = await getProductos();
const suplementos = await getProductos({ categoria: "suplementos" });
const stockBajo = await getProductos({ stock_bajo: true });

// Producto específico
const producto = await getProducto(id);

// Crear producto
await createProducto({
  nombre: "Proteína Whey",
  descripcion: "Proteína de suero",
  categoria: "suplementos",
  stock: 50,
  stock_minimo: 10,
  precio_compra: 35000,
  precio_venta: 50000,
});

// Actualizar producto
await updateProducto(id, { stock: 60, precio_venta: 52000 });

// Eliminar producto
await deleteProducto(id);

// Vender producto
await venderProducto(id, 5); // vender 5 unidades

// Estadísticas de productos
const stats = await getEstadisticasProductos();

// Historial de ventas
const ventas = await getVentas();
````

## 🔧 Verificar Conexión

Al cargar la aplicación, automáticamente verifica la conexión con el backend.
Revisa la consola del navegador para ver:

- ✅ "Conexión exitosa con el backend"
- ❌ "No se pudo conectar con el backend"

## ⚠️ Solución de Problemas

### Error de CORS

Si ves errores de CORS en la consola, necesitas agregar en tu backend (index.js):

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### Backend no responde

1. Verifica que el backend esté corriendo: http://localhost:3001
2. Verifica que no haya otros procesos usando el puerto 3001
3. Revisa la consola del backend por errores

### Frontend no conecta

1. Verifica que esté corriendo en http://localhost:5173
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que ambos servidores estén corriendo

## 📝 Ejemplo de Uso Completo

```javascript
// En cualquier componente
import { loginUser } from "../utils/auth";
import { getUsuarios, registrarVisita } from "../utils/api";

// Login
try {
  const user = await loginUser({
    email: "admin@gym.com",
    password: "12345",
  });
  console.log("Login exitoso:", user);
} catch (error) {
  console.error("Error en login:", error.message);
}

// Listar usuarios
try {
  const usuarios = await getUsuarios();
  console.log("Usuarios:", usuarios);
} catch (error) {
  console.error("Error:", error.message);
}

// Registrar visita
try {
  await registrarVisita(1);
  console.log("Visita registrada");
} catch (error) {
  console.error("Error:", error.message);
}
```

## 🎯 Estado Actual

✅ Backend configurado y corriendo en puerto 3001
✅ Frontend configurado con todas las funciones API
✅ Verificación automática de conexión
✅ Manejo de errores implementado
✅ Autenticación configurada

¡Todo listo para usar! 🚀
