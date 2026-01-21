const productoService = require('../services/producto.service');
const cloudinaryService = require('../services/cloudinary.service');

const getAllProductos = async (req, res) => {
  try {
    const {
      categoria,
      limit,
      page = 1,
      search,
      marca,
      minPrice,
      maxPrice,
      sortBy = 'fechacreacion',
      sortOrder = 'DESC',
    } = req.query;

    const productos = await productoService.getAllProductos({
      categoria,
      limit: limit ? parseInt(limit) : 12,
      page: parseInt(page),
      search,
      marca,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getProductosDestacados = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 8;
    const productos = await productoService.getProductosDestacados(limite);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos destacados' });
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
            },
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
            },
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
      imagePath,
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

// Obtener todas las categorías únicas
const getCategorias = async (req, res) => {
  try {
    const categorias = await productoService.getCategorias();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Obtener todas las marcas únicas
const getMarcas = async (req, res) => {
  try {
    const marcas = await productoService.getMarcas();
    res.json(marcas);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({ message: 'Error al obtener marcas' });
  }
};

// Buscar productos con sugerencias (para autocompletado)
const searchProductos = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [], products: [] });
    }

    const results = await productoService.searchProductos(q, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    res.status(500).json({ message: 'Error en la búsqueda' });
  }
};

// Obtener productos similares (para el componente de variantes/opciones)
const getProductosSimilares = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const productos = await productoService.getProductosSimilares(
      id,
      parseInt(limit),
    );
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos similares:', error);
    res.status(500).json({ message: 'Error al obtener productos similares' });
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  exportProductosCSV,
  getProductosDestacados,
  getCategorias,
  getMarcas,
  searchProductos,
  getProductosSimilares,
};
