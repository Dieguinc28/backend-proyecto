const productoService = require('../services/producto.service');
const cloudinaryService = require('../services/cloudinary.service');

const getAllProductos = async (req, res) => {
  try {
    const { categoria, limit } = req.query;
    const productos = await productoService.getAllProductos({
      categoria,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getProductoById = async (req, res) => {
  try {
    const producto = await productoService.getProductoById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

const createProducto = async (req, res) => {
  try {
    // Validar campos requeridos
    if (!req.body.nombre || req.body.nombre.trim() === '') {
      return res.status(400).json({
        message: 'El nombre del producto es requerido',
      });
    }

    if (
      !req.body.precioreferencial ||
      parseFloat(req.body.precioreferencial) <= 0
    ) {
      return res.status(400).json({
        message: 'El precio referencial debe ser mayor a 0',
      });
    }

    let imagePath = req.body.image || '/placeholder-product.jpg';

    // Si hay archivo, intentar subir a Cloudinary primero
    if (req.file) {
      if (cloudinaryService.enabled) {
        try {
          const result = await cloudinaryService.uploadFile(
            req.file.buffer || require('fs').readFileSync(req.file.path),
            {
              folder: 'productos',
              public_id: `product-${Date.now()}`,
            }
          );
          imagePath = result.url;
        } catch (cloudError) {
          console.error('Error subiendo a Cloudinary:', cloudError);
          imagePath = `/uploads/products/${req.file.filename}`;
        }
      } else {
        imagePath = `/uploads/products/${req.file.filename}`;
      }
    }

    const producto = await productoService.createProducto({
      ...req.body,
      image: imagePath,
    });
    res.status(201).json(producto);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al crear producto', error: error.message });
  }
};

const updateProducto = async (req, res) => {
  try {
    let imagePath = null;

    // Si hay archivo, intentar subir a Cloudinary primero
    if (req.file) {
      if (cloudinaryService.enabled) {
        try {
          const result = await cloudinaryService.uploadFile(
            req.file.buffer || require('fs').readFileSync(req.file.path),
            {
              folder: 'productos',
              public_id: `product-${Date.now()}`,
            }
          );
          imagePath = result.url;
        } catch (cloudError) {
          console.error('Error subiendo a Cloudinary:', cloudError);
          imagePath = `/uploads/products/${req.file.filename}`;
        }
      } else {
        imagePath = `/uploads/products/${req.file.filename}`;
      }
    }

    const producto = await productoService.updateProducto(
      req.params.id,
      req.body,
      imagePath
    );
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    await productoService.deleteProducto(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

const exportProductosCSV = async (req, res) => {
  try {
    const csv = await productoService.exportProductosCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=productos.csv');
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ message: 'Error al exportar productos' });
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  exportProductosCSV,
};
