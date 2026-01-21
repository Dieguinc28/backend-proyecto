-- =============================================
-- Script para identificar y eliminar productos duplicados
-- =============================================

-- 1. IDENTIFICAR PRODUCTOS DUPLICADOS
-- Este query muestra productos que tienen el mismo nombre y marca
SELECT 
    p1.idproducto,
    p1.nombre,
    p1.marca,
    p1.descripcion,
    p1.precioreferencial,
    p1.stock,
    p1.fechacreacion
FROM producto p1
INNER JOIN producto p2 ON 
    LOWER(TRIM(p1.nombre)) = LOWER(TRIM(p2.nombre))
    AND LOWER(TRIM(COALESCE(p1.marca, ''))) = LOWER(TRIM(COALESCE(p2.marca, '')))
    AND p1.idproducto < p2.idproducto
ORDER BY p1.nombre, p1.idproducto;

-- 2. ELIMINAR PRODUCTOS DUPLICADOS (MANTENER EL MÁS ANTIGUO)
-- ADVERTENCIA: Este comando eliminará permanentemente los productos duplicados
-- Descomenta las siguientes líneas solo si estás seguro de querer eliminar los duplicados

/*
DELETE FROM producto
WHERE idproducto IN (
    SELECT p2.idproducto
    FROM producto p1
    INNER JOIN producto p2 ON 
        LOWER(TRIM(p1.nombre)) = LOWER(TRIM(p2.nombre))
        AND LOWER(TRIM(COALESCE(p1.marca, ''))) = LOWER(TRIM(COALESCE(p2.marca, '')))
        AND p1.idproducto < p2.idproducto
);
*/

-- 3. VERIFICAR PRODUCTOS DESPUÉS DE LA LIMPIEZA
SELECT 
    idproducto,
    nombre,
    marca,
    descripcion,
    precioreferencial,
    stock,
    unidad,
    categoria
FROM producto
ORDER BY nombre, marca;

-- 4. CONTAR PRODUCTOS POR NOMBRE Y MARCA
SELECT 
    LOWER(TRIM(nombre)) as nombre_normalizado,
    LOWER(TRIM(COALESCE(marca, ''))) as marca_normalizada,
    COUNT(*) as cantidad
FROM producto
GROUP BY LOWER(TRIM(nombre)), LOWER(TRIM(COALESCE(marca, '')))
HAVING COUNT(*) > 1
ORDER BY cantidad DESC, nombre_normalizado;
