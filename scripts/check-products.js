const { Producto } = require('../models');
const { Sequelize } = require('sequelize');

async function checkProducts() {
  try {
    console.log('\n========================================');
    console.log('REVISIÓN DE PRODUCTOS EN LA BASE DE DATOS');
    console.log('========================================\n');

    // Obtener todos los productos
    const productos = await Producto.findAll({
      order: [
        ['nombre', 'ASC'],
        ['marca', 'ASC'],
        ['idproducto', 'ASC'],
      ],
    });

    console.log('=== TODOS LOS PRODUCTOS ===\n');
    console.log('Total de productos:', productos.length);
    console.log('');

    productos.forEach((p) => {
      console.log(
        `ID: ${p.idproducto.toString().padEnd(4)} | ${p.nombre.padEnd(40)} | Marca: ${(p.marca || 'N/A').padEnd(15)} | Unidad: ${(p.unidad || 'unidad').padEnd(10)} | Precio: $${p.precioreferencial} | Stock: ${p.stock}`,
      );
    });

    // Detectar duplicados usando query raw
    console.log('\n\n=== PRODUCTOS DUPLICADOS (AGRUPADOS) ===\n');

    const [duplicados] = await Producto.sequelize.query(`
      SELECT 
        LOWER(TRIM(nombre)) as nombre_normalizado,
        LOWER(TRIM(COALESCE(marca, 'SIN MARCA'))) as marca_normalizada,
        COUNT(*) as cantidad,
        STRING_AGG(CAST(idproducto AS TEXT), ', ' ORDER BY idproducto) as ids_productos,
        STRING_AGG(descripcion, ' | ' ORDER BY idproducto) as descripciones
      FROM producto
      GROUP BY LOWER(TRIM(nombre)), LOWER(TRIM(COALESCE(marca, 'SIN MARCA')))
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC, nombre_normalizado
    `);

    if (duplicados.length > 0) {
      console.log(
        `Se encontraron ${duplicados.length} grupos de productos duplicados:\n`,
      );
      duplicados.forEach((d, index) => {
        console.log(
          `${index + 1}. "${d.nombre_normalizado}" - Marca: "${d.marca_normalizada}"`,
        );
        console.log(`   Cantidad de duplicados: ${d.cantidad}`);
        console.log(`   IDs: ${d.ids_productos}`);
        console.log(`   Descripciones: ${d.descripciones}`);
        console.log('');
      });
    } else {
      console.log('✓ No se encontraron productos duplicados');
    }

    // Resumen por categoría
    console.log('\n=== RESUMEN POR CATEGORÍA ===\n');
    const [categorias] = await Producto.sequelize.query(`
      SELECT 
        COALESCE(categoria, 'SIN CATEGORÍA') as categoria,
        COUNT(*) as cantidad,
        SUM(stock) as stock_total
      FROM producto
      GROUP BY categoria
      ORDER BY cantidad DESC
    `);

    categorias.forEach((c) => {
      console.log(
        `${c.categoria.padEnd(20)} | Productos: ${c.cantidad.toString().padEnd(4)} | Stock Total: ${c.stock_total}`,
      );
    });

    // Resumen por unidad
    console.log('\n=== RESUMEN POR UNIDAD ===\n');
    const [unidades] = await Producto.sequelize.query(`
      SELECT 
        COALESCE(unidad, 'unidad') as unidad,
        COUNT(*) as cantidad
      FROM producto
      GROUP BY unidad
      ORDER BY cantidad DESC
    `);

    unidades.forEach((u) => {
      console.log(`${u.unidad.padEnd(15)} | Productos: ${u.cantidad}`);
    });

    console.log('\n========================================');
    console.log('FIN DE LA REVISIÓN');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkProducts();
