const carritoService = require('../services/carrito.service');

const getCarrito = async (req, res) => {
  try {
    const carrito = await carritoService.getOrCreateCarrito(req.user.userId);
    res.json(carrito);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener carrito', error: error.message });
  }
};

const addToCarrito = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const carrito = await carritoService.addProductoToCarrito(
      req.user.userId,
      productId,
      quantity
    );
    res.json(carrito);
  } catch (error) {
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error al agregar producto al carrito',
      error: error.message,
    });
  }
};

const updateCarrito = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const carrito = await carritoService.updateProductoQuantity(
      req.user.userId,
      productId,
      quantity
    );
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar carrito' });
  }
};

const removeFromCarrito = async (req, res) => {
  try {
    const { productId } = req.params;
    const carrito = await carritoService.removeProductoFromCarrito(
      req.user.userId,
      productId
    );
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto del carrito' });
  }
};

const clearCarrito = async (req, res) => {
  try {
    const carrito = await carritoService.clearCarrito(req.user.userId);
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ message: 'Error al limpiar carrito' });
  }
};

const syncCarrito = async (req, res) => {
  try {
    const { items } = req.body;
    const carrito = await carritoService.syncCarrito(req.user.userId, items);
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ message: 'Error al sincronizar carrito' });
  }
};

const addMultipleToCarrito = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Se requiere un array de items con productId y quantity',
      });
    }

    const carrito = await carritoService.addMultipleProductos(
      req.user.userId,
      items
    );

    res.json(carrito);
  } catch (error) {
    res.status(500).json({
      message: 'Error al agregar productos al carrito',
      error: error.message,
    });
  }
};

module.exports = {
  getCarrito,
  addToCarrito,
  addMultipleToCarrito,
  updateCarrito,
  removeFromCarrito,
  clearCarrito,
  syncCarrito,
};
