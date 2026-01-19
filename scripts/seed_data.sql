-- =============================================
-- Script de ingreso de datos iniciales
-- Sistema de Listas Escolares
-- =============================================

-- Limpiar datos existentes (opcional, descomentar si es necesario)
-- TRUNCATE TABLE historialcompra, recomendacionprecio, recomendacion, ventas, detallecotizacion, cotizacion, itemlista, listaescolar, precioproveedor, carrito, producto, proveedor, usuario, estado RESTART IDENTITY CASCADE;

-- =============================================
-- 1. ESTADOS
-- =============================================
INSERT INTO estado (idestado, nombreestado, fechacreacion, fechamodificacion) VALUES
(1, 'Activo', NOW(), NOW()),
(2, 'Inactivo', NOW(), NOW()),
(3, 'Pendiente', NOW(), NOW()),
(4, 'Completado', NOW(), NOW()),
(5, 'Cancelado', NOW(), NOW())
ON CONFLICT (idestado) DO NOTHING;

SELECT setval('estado_idestado_seq', (SELECT MAX(idestado) FROM estado));

-- =============================================
-- 2. PROVEEDORES
-- =============================================
INSERT INTO proveedor (idproveedor, nombre, direccion, telefono, email, fechacreacion, fechamodificacion) VALUES
(1, 'Papelería El Estudiante', 'Av. Principal 123, Centro', '555-0101', 'ventas@elestudiante.com', NOW(), NOW()),
(2, 'Distribuidora Escolar ABC', 'Calle Comercio 456', '555-0102', 'contacto@escolarabc.com', NOW(), NOW()),
(3, 'Librería Don Bosco', 'Plaza Central 789', '555-0103', 'info@donbosco.com', NOW(), NOW()),
(4, 'Mayorista Papelero', 'Zona Industrial Lote 12', '555-0104', 'mayorista@papelero.com', NOW(), NOW()),
(5, 'Office Depot', 'Centro Comercial Norte', '555-0105', 'ventas@officedepot.com', NOW(), NOW())
ON CONFLICT (idproveedor) DO NOTHING;

SELECT setval('proveedor_idproveedor_seq', (SELECT MAX(idproveedor) FROM proveedor));

-- =============================================
-- 3. PRODUCTOS
-- =============================================
INSERT INTO producto (idproducto, nombre, marca, precioreferencial, unidad, descripcion, categoria, stock, image, fechacreacion, fechamodificacion) VALUES
-- Cuadernos
(1, 'Cuaderno Universitario 100 hojas', 'Norma', 3.50, 'unidad', 'Cuaderno universitario rayado de 100 hojas', 'Cuadernos', 150, NULL, NOW(), NOW()),
(2, 'Cuaderno Universitario 200 hojas', 'Norma', 5.50, 'unidad', 'Cuaderno universitario rayado de 200 hojas', 'Cuadernos', 100, NULL, NOW(), NOW()),
(3, 'Cuaderno Cuadriculado 100 hojas', 'Scribe', 3.75, 'unidad', 'Cuaderno cuadriculado para matemáticas', 'Cuadernos', 120, NULL, NOW(), NOW()),
(4, 'Cuaderno de Dibujo', 'Canson', 4.25, 'unidad', 'Cuaderno de dibujo 50 hojas', 'Cuadernos', 80, NULL, NOW(), NOW()),
-- Lápices y bolígrafos
(5, 'Lápiz HB No. 2', 'Faber Castell', 0.50, 'unidad', 'Lápiz grafito HB', 'Escritura', 500, NULL, NOW(), NOW()),
(6, 'Caja de Lápices de Colores x12', 'Faber Castell', 4.50, 'caja', 'Caja de 12 lápices de colores', 'Arte', 200, NULL, NOW(), NOW()),
(7, 'Caja de Lápices de Colores x24', 'Faber Castell', 8.00, 'caja', 'Caja de 24 lápices de colores', 'Arte', 150, NULL, NOW(), NOW()),
(8, 'Bolígrafo Azul', 'Bic', 0.75, 'unidad', 'Bolígrafo tinta azul', 'Escritura', 400, NULL, NOW(), NOW()),
(9, 'Bolígrafo Negro', 'Bic', 0.75, 'unidad', 'Bolígrafo tinta negra', 'Escritura', 400, NULL, NOW(), NOW()),
(10, 'Bolígrafo Rojo', 'Bic', 0.75, 'unidad', 'Bolígrafo tinta roja', 'Escritura', 300, NULL, NOW(), NOW()),
-- Útiles varios
(11, 'Borrador Blanco', 'Pelikan', 0.50, 'unidad', 'Borrador de nata blanco', 'Escritura', 300, NULL, NOW(), NOW()),
(12, 'Sacapuntas Metálico', 'Maped', 0.75, 'unidad', 'Sacapuntas de metal', 'Escritura', 250, NULL, NOW(), NOW()),
(13, 'Regla 30cm', 'Maped', 1.25, 'unidad', 'Regla plástica transparente 30cm', 'Geometría', 200, NULL, NOW(), NOW()),
(14, 'Escuadra 45°', 'Maped', 1.50, 'unidad', 'Escuadra plástica 45 grados', 'Geometría', 180, NULL, NOW(), NOW()),
(15, 'Escuadra 60°', 'Maped', 1.50, 'unidad', 'Escuadra plástica 60 grados', 'Geometría', 180, NULL, NOW(), NOW()),
(16, 'Compás Escolar', 'Maped', 3.50, 'unidad', 'Compás metálico con lápiz', 'Geometría', 100, NULL, NOW(), NOW()),
(17, 'Transportador', 'Maped', 1.00, 'unidad', 'Transportador plástico 180°', 'Geometría', 200, NULL, NOW(), NOW()),
-- Pegamentos y tijeras
(18, 'Pegamento en Barra', 'Pritt', 1.75, 'unidad', 'Pegamento en barra 20g', 'Adhesivos', 250, NULL, NOW(), NOW()),
(19, 'Pegamento Líquido', 'Resistol', 1.50, 'unidad', 'Pegamento líquido 100ml', 'Adhesivos', 200, NULL, NOW(), NOW()),
(20, 'Tijeras Escolares', 'Maped', 2.25, 'unidad', 'Tijeras punta redonda', 'Corte', 150, NULL, NOW(), NOW()),
-- Marcadores y resaltadores
(21, 'Marcadores de Colores x12', 'Crayola', 5.50, 'caja', 'Caja de 12 marcadores lavables', 'Arte', 120, NULL, NOW(), NOW()),
(22, 'Resaltador Amarillo', 'Stabilo', 1.25, 'unidad', 'Resaltador fluorescente amarillo', 'Escritura', 200, NULL, NOW(), NOW()),
(23, 'Resaltador Verde', 'Stabilo', 1.25, 'unidad', 'Resaltador fluorescente verde', 'Escritura', 180, NULL, NOW(), NOW()),
(24, 'Resaltador Rosa', 'Stabilo', 1.25, 'unidad', 'Resaltador fluorescente rosa', 'Escritura', 180, NULL, NOW(), NOW()),
-- Carpetas y folders
(25, 'Carpeta 3 Aros', 'Artesco', 4.50, 'unidad', 'Carpeta de 3 aros tamaño carta', 'Organización', 100, NULL, NOW(), NOW()),
(26, 'Folder Manila Carta', 'Fortec', 0.25, 'unidad', 'Folder manila tamaño carta', 'Organización', 500, NULL, NOW(), NOW()),
(27, 'Folder Manila Oficio', 'Fortec', 0.30, 'unidad', 'Folder manila tamaño oficio', 'Organización', 400, NULL, NOW(), NOW()),
(28, 'Sobre Manila Carta', 'Fortec', 0.20, 'unidad', 'Sobre manila tamaño carta', 'Organización', 300, NULL, NOW(), NOW()),
-- Papel
(29, 'Resma Papel Bond A4', 'Chamex', 6.50, 'resma', 'Resma de 500 hojas papel bond A4', 'Papel', 80, NULL, NOW(), NOW()),
(30, 'Papel Construcción Colores', 'Canson', 3.00, 'paquete', 'Paquete de 20 hojas de colores', 'Arte', 100, NULL, NOW(), NOW())
ON CONFLICT (idproducto) DO NOTHING;

SELECT setval('producto_idproducto_seq', (SELECT MAX(idproducto) FROM producto));

-- =============================================
-- 4. USUARIOS
-- Las contraseñas están hasheadas con bcrypt (10 rounds)
-- Contraseña para TODOS los usuarios: "password123"
-- Hash: $2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S
-- =============================================
INSERT INTO usuario (idusuario, idestado, nombre, contrasena, email, rol, fechacreacion, fechamodificacion) VALUES
(1, 1, 'Administrador', '$2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S', 'admin@sistema.com', 'admin', NOW(), NOW()),
(2, 1, 'María García', '$2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S', 'maria.garcia@email.com', 'cliente', NOW(), NOW()),
(3, 1, 'Juan Pérez', '$2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S', 'juan.perez@email.com', 'cliente', NOW(), NOW()),
(4, 1, 'Ana Martínez', '$2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S', 'ana.martinez@email.com', 'cliente', NOW(), NOW()),
(5, 1, 'Carlos López', '$2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S', 'carlos.lopez@email.com', 'cliente', NOW(), NOW()),
(6, 2, 'Usuario Inactivo', '$2a$10$gzLTqulYFqJV0x7D4x51Duv2K93AQHU9qKj2Lh3I8xPtSQAQWyd4S', 'inactivo@email.com', 'cliente', NOW(), NOW())
ON CONFLICT (idusuario) DO UPDATE SET 
  contrasena = EXCLUDED.contrasena,
  fechamodificacion = NOW();

SELECT setval('usuario_idusuario_seq', (SELECT MAX(idusuario) FROM usuario));

-- =============================================
-- CREDENCIALES DE ACCESO
-- =============================================
-- Email: admin@sistema.com        | Password: password123 | Rol: admin
-- Email: maria.garcia@email.com   | Password: password123 | Rol: cliente
-- Email: juan.perez@email.com     | Password: password123 | Rol: cliente
-- Email: ana.martinez@email.com   | Password: password123 | Rol: cliente
-- Email: carlos.lopez@email.com   | Password: password123 | Rol: cliente
-- Email: inactivo@email.com       | Password: password123 | Rol: cliente (inactivo)
