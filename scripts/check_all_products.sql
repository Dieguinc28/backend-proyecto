-- =============================================
-- SCRIPT COMPLETO PARA REVISAR TODOS LOS PRODUCTOS
-- =============================================

-- 1. VER TODOS LOS PRODUCTOS (ORDENADOS POR NOMBRE)
SELECT 
    idproducto as ID,
    nombre as NOMBRE,
    marca as MARCA,
    descripcion as DESCRIPCION,
    precioreferencial as PRECIO,
    unidad as UNIDAD,
    stock as STOCK,
    categoria as CATEGORIA,
    TO_CHAR(fechacreacion, 'YYYY-MM-DD HH24:MI') as FECHA_CREACION
FROM producto
ORDER BY nombre, marca, idproducto;

-- =============================================
-- 2. IDENTIFICAR PRODUCTOS DUPLICADOS (AGRUPADOS)
-- =============================================
SELECT 
    LOWER(TRIM(nombre)) as NOMBRE_NORMALIZADO,
    LOWER(TRIM(COALESCE(marca, 'SIN MARCA'))) as MARCA_NORMALIZADA,
    COUNT(*) as CANTIDAD_DUPLICADOS,
    STRING_AGG(CAST(idproducto AS TEXT), ', ' ORDER BY idproducto) as IDS_DUPLICADOS,
    STRING_AGG(descripcion, ' | ' ORDER BY idproducto) as DESCRIPCIONES,
    STRING_AGG(CAST(precioreferencial AS TEXT), ', ' ORDER BY idproducto) as PRECIOS
FROM producto
GROUP BY LOWER(TRIM(nombre)), LOWER(TRIM(COALESCE(marca, 'SIN MARCA')))
HAVING COUNT(*) > 1
ORDER BY CANTIDAD_DUPLICADOS DESC, NOMBRE_NORMALIZADO;

-- =============================================
-- 3. DETALLE DE PRODUCTOS DUPLICADOS
-- =============================================
SELECT 
    p1.idproducto as ID_1,
    p2.idproducto as ID_2,
    p1.nombre as NOMBRE,
    p1.marca as MARCA,
    p1.descripcion as DESC_1,
    p2.descripcion as DESC_2,
    p1.precioreferencial as PRECIO_1,
    p2.precioreferencial as PRECIO_2,
    p1.stock as STOCK_1,
    p2.stock as STOCK_2,
    p1.fechacreacion as FECHA_1,
    p2.fechacreacion as FECHA_2
FROM producto p1
INNER JOIN producto p2 ON 
    LOWER(TRIM(p1.nombre)) = LOWER(TRIM(p2.nombre))
    AND LOWER(TRIM(COALESCE(p1.marca, ''))) = LOWER(TRIM(COALESCE(p2.marca, '')))
    AND p1.idproducto < p2.idproducto
ORDER BY p1.nombre, p1.idproducto;

-- =============================================
-- 4. CONTAR PRODUCTOS POR CATEGORÍA
-- =============================================
SELECT 
    COALESCE(categoria, 'SIN CATEGORÍA') as CATEGORIA,
    COUNT(*) as TOTAL_PRODUCTOS,
    SUM(stock) as STOCK_TOTAL
FROM producto
GROUP BY categoria
ORDER BY TOTAL_PRODUCTOS DESC;

-- =============================================
-- 5. PRODUCTOS CON NOMBRES SIMILARES (POSIBLES DUPLICADOS)
-- =============================================
-- Busca productos que tengan nombres muy parecidos
SELECT 
    p1.idproducto as ID_1,
    p1.nombre as NOMBRE_1,
    p2.idproducto as ID_2,
    p2.nombre as NOMBRE_2,
    p1.marca as MARCA,
    SIMILARITY(LOWER(p1.nombre), LOWER(p2.nombre)) as SIMILITUD
FROM producto p1
CROSS JOIN producto p2
WHERE p1.idproducto < p2.idproducto
    AND LOWER(TRIM(COALESCE(p1.marca, ''))) = LOWER(TRIM(COALESCE(p2.marca, '')))
    AND (
        LOWER(p1.nombre) LIKE '%' || LOWER(p2.nombre) || '%'
        OR LOWER(p2.nombre) LIKE '%' || LOWER(p1.nombre) || '%'
        OR LEVENSHTEIN(LOWER(p1.nombre), LOWER(p2.nombre)) < 5
    )
ORDER BY p1.nombre;

-- =============================================
-- 6. RESUMEN GENERAL
-- =============================================
SELECT 
    'TOTAL PRODUCTOS' as METRICA,
    COUNT(*) as VALOR
FROM producto
UNION ALL
SELECT 
    'PRODUCTOS ÚNICOS (NOMBRE + MARCA)' as METRICA,
    COUNT(DISTINCT LOWER(TRIM(nombre)) || '-' || LOWER(TRIM(COALESCE(marca, '')))) as VALOR
FROM producto
UNION ALL
SELECT 
    'PRODUCTOS DUPLICADOS' as METRICA,
    COUNT(*) as VALOR
FROM (
    SELECT 1
    FROM producto
    GROUP BY LOWER(TRIM(nombre)), LOWER(TRIM(COALESCE(marca, '')))
    HAVING COUNT(*) > 1
) sub
UNION ALL
SELECT 
    'STOCK TOTAL' as METRICA,
    SUM(stock) as VALOR
FROM producto;

-- =============================================
-- 7. PRODUCTOS CON DESCRIPCIONES CONCATENADAS O RARAS
-- =============================================
SELECT 
    idproducto as ID,
    nombre as NOMBRE,
    marca as MARCA,
    descripcion as DESCRIPCION,
    LENGTH(descripcion) as LONGITUD_DESC
FROM producto
WHERE 
    descripcion LIKE '%Punta Gruesa Punta Fina%'
    OR descripcion LIKE '%⬛%'
    OR descripcion LIKE '%-%-%'
    OR LENGTH(descripcion) > 100
ORDER BY LENGTH(descripcion) DESC;

-- =============================================
-- INSTRUCCIONES PARA ELIMINAR DUPLICADOS
-- =============================================
/*
Para eliminar productos duplicados, primero identifica cuáles quieres mantener.
Luego ejecuta:

DELETE FROM producto WHERE idproducto IN (ID1, ID2, ID3...);

Por ejemplo, si quieres eliminar los productos con ID 15 y 20:
DELETE FROM producto WHERE idproducto IN (15, 20);

IMPORTANTE: Asegúrate de hacer un backup antes de eliminar!
*/
