const { Producto } = require('../models');

async function fixProductNames() {
  try {
    console.log('\n========================================');
    console.log('CORRIGIENDO NOMBRES DE PRODUCTOS');
    console.log('========================================\n');

    // 1. BOLÍGRAFOS INDIVIDUALES
    console.log('1. Corrigiendo bolígrafos individuales...');
    await Producto.update(
      { nombre: 'Bolígrafo Azul Punta Fina 🟦' },
      { where: { idproducto: 8 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Azul Punta Gruesa 🟦' },
      { where: { idproducto: 54 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Negro Punta Fina ⬛' },
      { where: { idproducto: 9 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Negro Punta Gruesa ⬛' },
      { where: { idproducto: 55 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Rojo Punta Fina 🟥' },
      { where: { idproducto: 10 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Rojo Punta Gruesa 🟥' },
      { where: { idproducto: 56 } },
    );

    // 2. BOLÍGRAFOS EN PAQUETE
    console.log('2. Corrigiendo bolígrafos en paquete...');
    await Producto.update(
      { nombre: 'Bolígrafo Negro Paquete x24 Punta Fina ⬛' },
      { where: { idproducto: 65 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Negro Paquete x24 Punta Gruesa ⬛' },
      { where: { idproducto: 66 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Rojo Paquete x24 Punta Fina 🟥' },
      { where: { idproducto: 64 } },
    );
    await Producto.update(
      { nombre: 'Bolígrafo Rojo Paquete x24 Punta Gruesa 🟥' },
      { where: { idproducto: 57 } },
    );

    // 3. CARTULINAS
    console.log('3. Corrigiendo cartulinas...');
    const cartulinas = [
      { id: 48, nombre: 'Cartulina Bristol Celeste Pliego 🟦' },
      { id: 60, nombre: 'Cartulina Bristol Celeste A4 🟦' },
      { id: 45, nombre: 'Cartulina Bristol Morado Pliego 🟪' },
      { id: 61, nombre: 'Cartulina Bristol Morado A4 🟪' },
      { id: 46, nombre: 'Cartulina Bristol Naranja Pliego 🟧' },
      { id: 62, nombre: 'Cartulina Bristol Naranja A4 🟧' },
      { id: 43, nombre: 'Cartulina Bristol Negra Pliego ⬛' },
      { id: 59, nombre: 'Cartulina Bristol Negra A4 ⬛' },
      { id: 47, nombre: 'Cartulina Bristol Rojo Pliego 🟥' },
      { id: 53, nombre: 'Cartulina Bristol Rojo A4 🟥' },
      { id: 49, nombre: 'Cartulina Bristol Rosada Pliego ⬜' },
      { id: 52, nombre: 'Cartulina Bristol Rosada A4 ⬜' },
      { id: 50, nombre: 'Cartulina Bristol Verde Pliego 🟩' },
      { id: 51, nombre: 'Cartulina Bristol Verde A4 🟩' },
    ];

    for (const cartulina of cartulinas) {
      await Producto.update(
        { nombre: cartulina.nombre },
        { where: { idproducto: cartulina.id } },
      );
    }

    console.log('\n✓ Nombres corregidos exitosamente!');
    console.log(
      '\nAhora los productos se agruparán correctamente por variantes.',
    );
    console.log('Por ejemplo:');
    console.log(
      '  - Bolígrafo Azul (mostrará Punta Fina y Punta Gruesa como variantes)',
    );
    console.log(
      '  - Cartulina Bristol Celeste (mostrará Pliego y A4 como variantes)',
    );

    console.log('\n========================================');
    console.log('CORRECCIÓN COMPLETADA');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixProductNames();
