const { Carrito, Producto } = require('../models');

const getOrCreateCarrito = async (userId) => {
  let carrito = await Carrito.findOne({ where: { idusuario: userId } });
  if (!carrito) {
    carrito = await Carrito.create({ idusuario: userId, items: [] });
  }
  return carrito;
};

const addProductoToCarrito = async (userId, productId, quantity) => {
  const producto = await Producto.findByPk(productId);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  let carrito = await getOrCreateCarrito(userId);
  const items = JSON.parse(JSON.stringify(carrito.items || []));

  const existingItemIndex = items.findIndex(
    (item) => item.productId === productId
  );

  if (existingItemIndex > -1) {
    items[existingItemIndex].quantity += quantity;
  } else {
    items.push({
      productId,
      name: producto.nombre,
      description: producto.descripcion,
      price: parseFloat(producto.precioreferencial),
      image: producto.image,
      quantity,
    });
  }

  await carrito.update({ items });
  await carrito.reload();
  return carrito;
};

const updateProductoQuantity = async (userId, productId, quantity) => {
  const carrito = await Carrito.findOne({ where: { idusuario: userId } });
  if (!carrito) {
    return null;
  }

  const items = carrito.items || [];
  const itemIndex = items.findIndex((item) => item.productId === productId);

  if (itemIndex === -1) {
    return carrito;
  }

  if (quantity <= 0) {
    items.splice(itemIndex, 1);
  } else {
    items[itemIndex].quantity = quantity;
  }

  carrito.items = items;
  carrito.changed('items', true);
  await carrito.save();
  return carrito;
};

const removeProductoFromCarrito = async (userId, productId) => {
  const carrito = await Carrito.findOne({ where: { idusuario: userId } });
  if (!carrito) {
    return null;
  }

  const items = carrito.items || [];
  carrito.items = items.filter((item) => item.productId !== productId);
  carrito.changed('items', true);
  await carrito.save();
  return carrito;
};

const clearCarrito = async (userId) => {
  const carrito = await Carrito.findOne({ where: { idusuario: userId } });
  if (!carrito) {
    return null;
  }

  carrito.items = [];
  carrito.changed('items', true);
  await carrito.save();
  return carrito;
};

const syncCarrito = async (userId, items) => {
  let carrito = await Carrito.findOne({ where: { idusuario: userId } });

  if (!carrito) {
    carrito = await Carrito.create({ idusuario: userId, items: items || [] });
  } else {
    carrito.items = items || [];
    carrito.changed('items', true);
    await carrito.save();
  }

  return carrito;
};

const addMultipleProductos = async (userId, itemsToAdd) => {
  let carrito = await getOrCreateCarrito(userId);
  const items = JSON.parse(JSON.stringify(carrito.items || []));

  for (const item of itemsToAdd) {
    const { productId, quantity } = item;

    const producto = await Producto.findByPk(productId);
    if (!producto) {
      console.warn(`Producto ${productId} no encontrado, saltando...`);
      continue;
    }

    const existingItemIndex = items.findIndex((i) => i.productId === productId);

    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += quantity;
    } else {
      items.push({
        productId,
        name: producto.nombre,
        description: producto.descripcion,
        price: parseFloat(producto.precioreferencial),
        image: producto.image,
        quantity,
      });
    }
  }

  await carrito.update({ items });
  await carrito.reload();
  return carrito;
};

module.exports = {
  getOrCreateCarrito,
  addProductoToCarrito,
  addMultipleProductos,
  updateProductoQuantity,
  removeProductoFromCarrito,
  clearCarrito,
  syncCarrito,
};
