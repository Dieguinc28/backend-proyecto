# Backend - Sistema de Cotizaciones

Backend desarrollado con Node.js, Express y PostgreSQL usando Sequelize ORM.

## Arquitectura

Arquitectura MVC con capa de servicios:

- **Routes** → **Controllers** → **Services** → **Models** → **Database**

## Estructura de Archivos

### Controllers (Controladores)

- `auth.controller.js` - Autenticación y registro
- `usuario.controller.js` - Gestión de usuarios
- `producto.controller.js` - Gestión de productos
- `cotizacion.controller.js` - Gestión de cotizaciones
- `carrito.controller.js` - Gestión del carrito de compras

### Services (Servicios - Lógica de Negocio)

- `auth.service.js` - Lógica de autenticación
- `usuario.service.js` - Lógica de usuarios
- `producto.service.js` - Lógica de productos
- `cotizacion.service.js` - Lógica de cotizaciones
- `carrito.service.js` - Lógica del carrito

### Models (Modelos de Base de Datos)

- `usuario.model.js` - Usuarios del sistema
- `producto.model.js` - Productos disponibles
- `carrito.model.js` - Carritos de compra
- `cotizacion.model.js` - Cotizaciones
- `estado.model.js` - Estados del sistema
- `listaescolar.model.js` - Listas escolares
- `itemlista.model.js` - Items de listas
- `proveedor.model.js` - Proveedores
- `precioproveedor.model.js` - Precios por proveedor
- `detallecotizacion.model.js` - Detalles de cotizaciones
- `ventas.model.js` - Ventas realizadas

### Routes (Rutas API)

- `auth.route.js` - `/api/auth/*`
- `users.route.js` - `/api/users/*`
- `products.route.js` - `/api/products/*`
- `quotes.route.js` - `/api/quotes/*`
- `cart.route.js` - `/api/cart/*`
- `pdfQuote.route.js` - `/api/pdf-quote/*`

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npm run migrate

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start
```

## Variables de Entorno

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_db
DB_USER=usuario
DB_PASSWORD=password
JWT_SECRET=tu_secreto_jwt
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

### Usuarios (Admin)

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos

- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `DELETE /api/products/:id` - Eliminar producto (Admin)
- `GET /api/products/export/csv` - Exportar CSV (Admin)

### Carrito

- `GET /api/cart` - Obtener carrito
- `POST /api/cart/add` - Agregar producto
- `PUT /api/cart/update` - Actualizar cantidad
- `DELETE /api/cart/remove/:productId` - Eliminar producto
- `DELETE /api/cart/clear` - Limpiar carrito
- `POST /api/cart/sync` - Sincronizar carrito

### Cotizaciones

- `POST /api/quotes` - Crear cotización
- `POST /api/quotes/upload-pdf` - Procesar PDF
- `GET /api/quotes/my-quotes` - Mis cotizaciones
- `GET /api/quotes` - Todas (Admin)
- `PATCH /api/quotes/:id/status` - Actualizar estado (Admin)

## Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación:

- Token válido por 7 días
- Roles: `admin` y `cliente`
- Middleware `auth` para rutas protegidas
- Middleware `isAdmin` para rutas de administrador

## Convenciones de Código

- **Archivos**: `nombre.tipo.js` (ej: `auth.controller.js`)
- **Modelos**: Nombres en español, minúsculas
- **Campos DB**: Español, minúsculas
- **Rutas**: Inglés (estándar REST)
- **Respuestas**: JSON con mensajes en español

## Base de Datos

PostgreSQL con Sequelize ORM

- Migraciones automáticas con `sync()`
- Relaciones definidas en `models/index.js`
- Timestamps automáticos

## Documentación Adicional

- `ESTRUCTURA.md` - Arquitectura del sistema
- `SETUP_APIS.md` - Configuración de APIs gratuitas

## Sistema de Recomendaciones (WebSockets)

Sistema en tiempo real para gestionar recomendaciones de precios con sincronización automática, validación de stock e historial permanente.

### Características

✅ **Sincronización Automática**: Sincroniza precios cada X horas (configurable)
✅ **Validación de Stock**: Verifica disponibilidad antes de comprar
✅ **Historial Permanente**: Guarda todas las compras para análisis
✅ **WebSockets**: Notificaciones en tiempo real
✅ **Estadísticas**: Reportes de compras y productos más vendidos

### Configuración

```env
# .env
SYNC_INTERVAL_HOURS=1  # Sincronizar cada 1 hora
FRONTEND_URL=http://localhost:3000
```

### Endpoints de Recomendaciones

#### Básicos

- `GET /api/recomendaciones` - Listar todas
- `GET /api/recomendaciones/mejores-ofertas` - Top ofertas
- `GET /api/recomendaciones/:id` - Obtener por ID
- `GET /api/recomendaciones/:id/validar` - Validar disponibilidad
- `GET /api/recomendaciones/producto/:idproducto` - Por producto

#### Historial y Estadísticas

- `GET /api/recomendaciones/historial/compras` - Historial de compras
- `GET /api/recomendaciones/historial/estadisticas` - Estadísticas

#### Operaciones

- `POST /api/recomendaciones` - Crear (Admin)
- `PUT /api/recomendaciones/:id` - Actualizar (Admin)
- `PATCH /api/recomendaciones/:id/comprar` - Marcar como comprado
- `DELETE /api/recomendaciones/:id` - Eliminar (Admin)

#### Sincronización

- `POST /api/recomendaciones/sincronizar` - Sincronizar manual (Admin)
- `POST /api/recomendaciones/sincronizar/iniciar` - Iniciar auto-sync (Admin)
- `POST /api/recomendaciones/sincronizar/detener` - Detener auto-sync (Admin)

#### Limpieza

- `POST /api/recomendaciones/limpiar` - Limpiar antiguos (Admin)

### Eventos WebSocket

```javascript
// Conectar
socket.emit('recomendaciones:subscribe');

// Eventos recibidos
socket.on('recomendacion:created', (data) => {
  /* Nueva recomendación */
});
socket.on('recomendacion:updated', (data) => {
  /* Actualizada */
});
socket.on('recomendacion:purchased', (data) => {
  /* Comprada */
});
socket.on('recomendacion:deleted', (data) => {
  /* Eliminada */
});
socket.on('recomendaciones:synced', (data) => {
  /* Sincronización completada */
});
socket.on('recomendaciones:cleaned', (data) => {
  /* Limpieza completada */
});
```

### Flujo de Compra

```javascript
// 1. Validar disponibilidad
GET / api / recomendaciones / 123 / validar;
// Respuesta: { disponible: true, producto: "...", precio: 2500 }

// 2. Marcar como comprado
PATCH / api / recomendaciones / 123 / comprar;
Body: {
  idusuario: 1;
}

// 3. Se guarda automáticamente en historial
// 4. Se actualiza stock del producto
// 5. Se notifica a todos los clientes vía WebSocket
```

### Scripts de Inicialización

```bash
# Crear tabla de historial
node scripts/createHistorialCompraTable.js

# Crear tabla de recomendaciones
node scripts/createRecomendacionesTable.js
```

### Documentación Completa

Ver `MEJORAS_RECOMENDACIONES.md` para documentación detallada sobre:

- Sincronización automática
- Validación de stock
- Historial de compras
- Estadísticas y reportes
- Ejemplos de uso en frontend
