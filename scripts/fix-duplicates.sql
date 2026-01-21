-- =============================================
-- Script para consolidar productos duplicados
-- Combina el nombre con la descripción para hacerlos únicos
-- =============================================

-- IMPORTANTE: Haz un backup de tu base de datos antes de ejecutar este script

BEGIN;

-- 1. BOLÍGRAFOS INDIVIDUALES (Punta Fina vs Punta Gruesa)
UPDATE producto SET nombre = 'Bolígrafos Azul Punta Fina 🟦' WHERE idproducto = 8;
UPDATE producto SET nombre = 'Bolígrafos Azul Punta Gruesa 🟦' WHERE idproducto = 54;

UPDATE producto SET nombre = 'Bolígrafo Negro Punta Fina ⬛' WHERE idproducto = 9;
UPDATE producto SET nombre = 'Bolígrafo Negro Punta Gruesa ⬛' WHERE idproducto = 55;

UPDATE producto SET nombre = 'Bolígrafo Rojo Punta Fina 🟥' WHERE idproducto = 10;
UPDATE producto SET nombre = 'Bolígrafo Rojo Punta Gruesa 🟥' WHERE idproducto = 56;

-- 2. BOLÍGRAFOS EN PAQUETE (Punta Fina vs Punta Gruesa)
UPDATE producto SET nombre = 'Bolígrafos Negro Paquete x24 Punta Fina ⬛' WHERE idproducto = 65;
UPDATE producto SET nombre = 'Bolígrafos Negro Paquete x24 Punta Gruesa ⬛' WHERE idproducto = 66;

UPDATE producto SET nombre = 'Bolígrafos Rojo Paquete x24 Punta Fina 🟥' WHERE idproducto = 64;
UPDATE producto SET nombre = 'Bolígrafos Rojo Paquete x24 Punta Gruesa 🟥' WHERE idproducto = 57;

-- 3. CARTULINAS (Pliego vs A4)
UPDATE producto SET nombre = 'Cartulina Bristol Celeste Pliego 🟦' WHERE idproducto = 48;
UPDATE producto SET nombre = 'Cartulina Bristol Celeste A4 🟦' WHERE idproducto = 60;

UPDATE producto SET nombre = 'Cartulina Bristol Morado Pliego 🟪' WHERE idproducto = 45;
UPDATE producto SET nombre = 'Cartulina Bristol Morado A4 🟪' WHERE idproducto = 61;

UPDATE producto SET nombre = 'Cartulina Bristol Naranja Pliego 🟧' WHERE idproducto = 46;
UPDATE producto SET nombre = 'Cartulina Bristol Naranja A4 🟧' WHERE idproducto = 62;

UPDATE producto SET nombre = 'Cartulina Bristol Negra Pliego ⬛' WHERE idproducto = 43;
UPDATE producto SET nombre = 'Cartulina Bristol Negra A4 ⬛' WHERE idproducto = 59;

UPDATE producto SET nombre = 'Cartulina Bristol Rojo Pliego 🟥' WHERE idproducto = 47;
UPDATE producto SET nombre = 'Cartulina Bristol Rojo A4 🟥' WHERE idproducto = 53;

UPDATE producto SET nombre = 'Cartulina Bristol Rosada Pliego ⬜' WHERE idproducto = 49;
UPDATE producto SET nombre = 'Cartulina Bristol Rosada A4 ⬜' WHERE idproducto = 52;

UPDATE producto SET nombre = 'Cartulina Bristol Verde Pliego 🟩' WHERE idproducto = 50;
UPDATE producto SET nombre = 'Cartulina Bristol Verde A4 🟩' WHERE idproducto = 51;

-- 4. LIMPIAR DESCRIPCIONES (ya que ahora están en el nombre)
UPDATE producto SET descripcion = 'Bolígrafo de tinta azul con punta fina' WHERE idproducto = 8;
UPDATE producto SET descripcion = 'Bolígrafo de tinta azul con punta gruesa' WHERE idproducto = 54;

UPDATE producto SET descripcion = 'Bolígrafo de tinta negra con punta fina' WHERE idproducto = 9;
UPDATE producto SET descripcion = 'Bolígrafo de tinta negra con punta gruesa' WHERE idproducto = 55;

UPDATE producto SET descripcion = 'Bolígrafo de tinta roja con punta fina' WHERE idproducto = 10;
UPDATE producto SET descripcion = 'Bolígrafo de tinta roja con punta gruesa' WHERE idproducto = 56;

UPDATE producto SET descripcion = 'Paquete de 24 bolígrafos negros con punta fina' WHERE idproducto = 65;
UPDATE producto SET descripcion = 'Paquete de 24 bolígrafos negros con punta gruesa' WHERE idproducto = 66;

UPDATE producto SET descripcion = 'Paquete de 24 bolígrafos rojos con punta fina' WHERE idproducto = 64;
UPDATE producto SET descripcion = 'Paquete de 24 bolígrafos rojos con punta gruesa' WHERE idproducto = 57;

UPDATE producto SET descripcion = 'Cartulina bristol celeste tamaño pliego' WHERE idproducto = 48;
UPDATE producto SET descripcion = 'Cartulina bristol celeste tamaño A4' WHERE idproducto = 60;

UPDATE producto SET descripcion = 'Cartulina bristol morado tamaño pliego' WHERE idproducto = 45;
UPDATE producto SET descripcion = 'Cartulina bristol morado tamaño A4' WHERE idproducto = 61;

UPDATE producto SET descripcion = 'Cartulina bristol naranja tamaño pliego' WHERE idproducto = 46;
UPDATE producto SET descripcion = 'Cartulina bristol naranja tamaño A4' WHERE idproducto = 62;

UPDATE producto SET descripcion = 'Cartulina bristol negra tamaño pliego' WHERE idproducto = 43;
UPDATE producto SET descripcion = 'Cartulina bristol negra tamaño A4' WHERE idproducto = 59;

UPDATE producto SET descripcion = 'Cartulina bristol rojo tamaño pliego' WHERE idproducto = 47;
UPDATE producto SET descripcion = 'Cartulina bristol rojo tamaño A4' WHERE idproducto = 53;

UPDATE producto SET descripcion = 'Cartulina bristol rosada tamaño pliego' WHERE idproducto = 49;
UPDATE producto SET descripcion = 'Cartulina bristol rosada tamaño A4' WHERE idproducto = 52;

UPDATE producto SET descripcion = 'Cartulina bristol verde tamaño pliego' WHERE idproducto = 50;
UPDATE producto SET descripcion = 'Cartulina bristol verde tamaño A4' WHERE idproducto = 51;

COMMIT;

-- Verificar los cambios
SELECT idproducto, nombre, marca, descripcion, precioreferencial, unidad, stock
FROM producto
WHERE idproducto IN (8, 9, 10, 43, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 64, 65, 66)
ORDER BY nombre;
