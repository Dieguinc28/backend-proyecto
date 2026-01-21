-- =============================================
-- Script para revisar todos los productos y detectar duplicados
-- =============================================

-- 1. VER TODOS LOS PRODUCTOS ORDENADOS
SELECT 
    idproducto as ID,
    nombre as NOMBRE,
    marca as MARCA,
    descripcion as DESCRIPCION,
    precioreferencial as PRECIO,
    unidad as UNIDAD,
    stock as STOCK,
    categoria as CATEGORIA,
    fechacreacion as FECHA_CREACION
FROM producto
ORDER BY nombre, marca, idproducto;

-- =============================================
-- 2. DETECTAR PRODUCTOS DUPLICADOS (AGRUPADOS)
-- =============================================
SELECT 
    LOWER(TRIM(nombre)) as nombre_normalizado,
    LOWER(TRIM(COALESCE(marca, 'SIN MARCA'))) as marca_normalizada,
    COUNT(*) as cantidad_duplicados,
    STRING_AGG(CAST(idproducto AS TEXT), ', ' ORDER BY idproducto) as ids_productos,
    STRING_AGG(descripcion, ' | ' ORDER BY idproducto) as descripciones,
    MIN(precioreferencial) as precio_minimo,
    MAX(precioreferencial) as precio_maximo,
    SUM(stock) as stock_total
FROM producto
GROUP BY LOWER(TRIM(nombre)), LOWER(TRIM(COALESCE(marca, 'SIN MARCA')))
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC, nombre_normalizado;

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
    p1.unidad as UNIDAD_1,
    p2.unidad as UNIDAD_2,
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
    COUNT(*) as CANTIDAD_PRODUCTOS,
    SUM(stock) as STOCK_TOTAL
FROM producto
GROUP BY categoria
ORDER BY CANTIDAD_PRODUCTOS DESC;

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
    p1.descripcion as DESC_1,
    p2.descripcion as DESC_2
FROM producto p1
INNER JOIN producto p2 ON 
    p1.idproducto < p2.idproducto
    AND LOWER(TRIM(p1.marca)) = LOWER(TRIM(p2.marca))
    AND (
        -- Nombres que empiezan igual
        LOWER(SUBSTRING(p1.nombre, 1, 10)) = LOWER(SUBSTRING(p2.nombre, 1, 10))
        OR
        -- Nombres que contienen palabras similares
        LOWER(p1.nombre) LIKE '%' || LOWER(SPLIT_PART(p2.nombre, ' ', 1)) || '%'
    )
ORDER BY p1.nombre;

-- =============================================
-- 6. RESUMEN GENERAL
-- =============================================
SELECT 
    'Total de Productos' as METRICA,
    COUNT(*) as VALOR
FROM producto
UNION ALL
SELECT 
    'Productos Únicos (sin duplicados)',
    COUNT(DISTINCT LOWER(TRIM(nombre)) || '-' || LOWER(TRIM(COALESCE(marca, ''))))
FROM producto
UNION ALL
SELECT 
    'Productos con Stock',
    COUNT(*)
FROM producto
WHERE stock > 0
UNION ALL
SELECT 
    'Productos sin Stock',
    COUNT(*)
FROM producto
WHERE stock = 0
UNION ALL
SELECT 
    'Categorías Diferentes',
    COUNT(DISTINCT categoria)
FROM producto
UNION ALL
SELECT 
    'Marcas Diferentes',
    COUNT(DISTINCT marca)
FROM producto;
