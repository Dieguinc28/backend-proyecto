const { Producto } = require('../models');
const fs = require('fs');
const path = require('path');

const formatProducto = (producto) => ({
  _id: producto.idproducto.toString(),
  id: producto.idproducto,
  idproducto: producto.idproducto,
  name: producto.nombre,
  nombre: producto.nombre,
  description: producto.descripcion,
  descripcion: producto.descripcion,
  price: parseFloat(producto.precioreferencial),
  precio: parseFloat(producto.precioreferencial),
  precioreferencial: parseFloat(producto.precioreferencial),
  stock: producto.stock,
  image: producto.image,
  imagen: producto.image,
  category: producto.categoria || producto.marca,
  categoria: producto.categoria,
  marca: producto.marca,
  createdAt: producto.fechacreacion,
});

const getAllProductos = async (options = {}) => {
  const where = {};

  if (options.categoria) {
    where.categoria = options.categoria;
  }

  const queryOptions = {
    where,
    order: [['fechacreacion', 'DESC']],
  };

  if (options.limit) {
    queryOptions.limit = options.limit;
  }

  const productos = await Producto.findAll(queryOptions);
  const formattedProducts = productos.map(formatProducto);

  // Si hay filtros, retornar en formato { products: [...] }
  // Si no hay filtros, retornar array directo para compatibilidad
  if (options.categoria || options.limit) {
    return { products: formattedProducts };
  }

  return formattedProducts;
};

const getProductoById = async (id) => {
  const producto = await Producto.findByPk(id);
  return producto ? formatProducto(producto) : null;
};

const createProducto = async (data) => {
  const producto = await Producto.create({
    nombre: data.nombre || data.name,
    descripcion: data.descripcion || data.description,
    precioreferencial: data.precioreferencial || data.price,
    stock: data.stock || 0,
    image: data.image,
    categoria: data.categoria || data.category,
    marca: data.marca || data.category,
    unidad: data.unidad,
  });
  return formatProducto(producto);
};

const updateProducto = async (id, data, imagePath) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    return null;
  }

  const updateData = {
    nombre: data.nombre || data.name,
    descripcion: data.descripcion || data.description,
    precioreferencial: data.precioreferencial || data.price,
    stock: data.stock,
    categoria: data.categoria || data.category,
    marca: data.marca || data.category,
    unidad: data.unidad,
  };

  if (imagePath) {
    if (producto.image && !producto.image.includes('placeholder')) {
      const oldImagePath = path.join(__dirname, '..', producto.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.image = imagePath;
  }

  await producto.update(updateData);
  return formatProducto(producto);
};

const deleteProducto = async (id) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  if (producto.image && !producto.image.includes('placeholder')) {
    const imagePath = path.join(__dirname, '..', producto.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await producto.destroy();
};

const exportProductosCSV = async () => {
  const productos = await Producto.findAll({
    order: [['fechacreacion', 'DESC']],
  });

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (
      stringValue.includes('"') ||
      stringValue.includes(';') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  let csv = 'sep=;\n';
  csv += 'ID;Nombre;Descripcion;Precio;Stock;Marca\n';

  productos.forEach((producto) => {
    const row = [
      producto.idproducto,
      escapeCSV(producto.nombre),
      escapeCSV(producto.descripcion),
      producto.precioreferencial,
      producto.stock,
      escapeCSV(producto.marca),
    ];
    csv += row.join(';') + '\n';
  });

  return csv;
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  exportProductosCSV,
};
