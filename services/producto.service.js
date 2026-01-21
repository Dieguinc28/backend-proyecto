const { Producto } = require('../models');
const fs = require('fs');
const path = require('path');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Diccionario de sinónimos para búsqueda
const SINONIMOS = {
  boligrafo: ['lapicero', 'pluma', 'esfero', 'birome', 'boli'],
  lapicero: ['boligrafo', 'pluma', 'esfero', 'birome', 'boli'],
  lapiz: ['grafito', 'lapis'],
  marcador: ['plumon', 'rotulador', 'resaltador', 'plumones'],
  plumon: ['marcador', 'rotulador', 'resaltador', 'plumones'],
  colores: ['lapices de colores', 'pinturas', 'crayones'],
  crayones: ['crayolas', 'colores de cera'],
  crayolas: ['crayones', 'colores de cera'],
  tijera: ['tijeras', 'cortadora'],
  tijeras: ['tijera', 'cortadora'],
  goma: ['pegamento', 'cola', 'adhesivo', 'pega'],
  pegamento: ['goma', 'cola', 'adhesivo', 'pega'],
  cuaderno: ['libreta', 'block', 'bloc', 'agenda'],
  libreta: ['cuaderno', 'block', 'bloc'],
  folder: ['carpeta', 'portafolio', 'archivador'],
  carpeta: ['folder', 'portafolio', 'archivador'],
  borrador: ['goma de borrar', 'borra'],
  sacapuntas: ['tajador', 'afilador', 'tajalapiz'],
  tajador: ['sacapuntas', 'afilador'],
  mochila: ['maleta', 'bolso', 'morral'],
  estuche: ['cartuchera', 'lapicera', 'porta lapices'],
  cartuchera: ['estuche', 'lapicera'],
};

// Función para expandir búsqueda con sinónimos
const expandirBusquedaConSinonimos = (termino) => {
  const palabras = termino.toLowerCase().split(/\s+/);
  const expandidas = new Set([termino.toLowerCase()]);

  palabras.forEach((palabra) => {
    if (SINONIMOS[palabra]) {
      SINONIMOS[palabra].forEach((sin) => expandidas.add(sin));
    }
    Object.entries(SINONIMOS).forEach(([key, valores]) => {
      if (valores.includes(palabra)) {
        expandidas.add(key);
      }
    });
  });

  return Array.from(expandidas);
};

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
  unidad: producto.unidad || 'unidad',
  createdAt: producto.fechacreacion,
});

const getAllProductos = async (options = {}) => {
  const where = {};
  const {
    categoria,
    limit = 12,
    page = 1,
    search,
    marca,
    minPrice,
    maxPrice,
    sortBy = 'fechacreacion',
    sortOrder = 'DESC',
  } = options;

  // Filtro por categoría
  if (categoria) {
    where.categoria = categoria;
  }

  // Filtro por marca
  if (marca) {
    where.marca = marca;
  }

  // Filtro por búsqueda (nombre o descripción) con sinónimos
  if (search) {
    const terminosExpandidos = expandirBusquedaConSinonimos(search);

    // Crear condiciones OR para cada término (original + sinónimos)
    const searchConditions = terminosExpandidos.flatMap((termino) => [
      { nombre: { [Op.iLike]: `%${termino}%` } },
      { descripcion: { [Op.iLike]: `%${termino}%` } },
      { marca: { [Op.iLike]: `%${termino}%` } },
      { categoria: { [Op.iLike]: `%${termino}%` } },
    ]);

    where[Op.or] = searchConditions;
  }

  // Filtro por rango de precios
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.precioreferencial = {};
    if (minPrice !== undefined) {
      where.precioreferencial[Op.gte] = minPrice;
    }
    if (maxPrice !== undefined) {
      where.precioreferencial[Op.lte] = maxPrice;
    }
  }

  // Validar campo de ordenamiento
  const validSortFields = [
    'fechacreacion',
    'nombre',
    'precioreferencial',
    'stock',
    'marca',
    'categoria',
  ];
  const orderField = validSortFields.includes(sortBy)
    ? sortBy
    : 'fechacreacion';
  const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Calcular offset para paginación
  const offset = (page - 1) * limit;

  // Obtener total de productos y productos paginados
  const { count, rows: productos } = await Producto.findAndCountAll({
    where,
    order: [[orderField, orderDirection]],
    limit: parseInt(limit),
    offset: offset,
  });

  const formattedProducts = productos.map(formatProducto);
  const totalPages = Math.ceil(count / limit);

  return {
    products: formattedProducts,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getProductoById = async (id) => {
  const producto = await Producto.findByPk(id);
  return producto ? formatProducto(producto) : null;
};

const createProducto = async (data) => {
  // Validar si ya existe un producto con el mismo nombre y marca
  const nombreNormalizado = (data.nombre || data.name || '')
    .trim()
    .toLowerCase();
  const marcaNormalizada = (data.marca || '').trim().toLowerCase();

  if (nombreNormalizado) {
    const productoExistente = await Producto.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('nombre')),
        nombreNormalizado,
      ),
    });

    if (productoExistente) {
      // Si existe un producto con el mismo nombre, verificar si también tiene la misma marca
      const marcaExistente = (productoExistente.marca || '')
        .trim()
        .toLowerCase();
      if (marcaExistente === marcaNormalizada) {
        throw new Error(
          `Ya existe un producto con el nombre "${data.nombre || data.name}" y marca "${data.marca}"`,
        );
      }
    }
  }

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

  // Validar si ya existe otro producto con el mismo nombre y marca
  const nombreNormalizado = (data.nombre || data.name || '')
    .trim()
    .toLowerCase();
  const marcaNormalizada = (data.marca || '').trim().toLowerCase();

  if (nombreNormalizado) {
    const productoExistente = await Producto.findOne({
      where: {
        idproducto: { [Op.ne]: id }, // Excluir el producto actual
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('nombre')),
            nombreNormalizado,
          ),
        ],
      },
    });

    if (productoExistente) {
      const marcaExistente = (productoExistente.marca || '')
        .trim()
        .toLowerCase();
      if (marcaExistente === marcaNormalizada) {
        throw new Error(
          `Ya existe otro producto con el nombre "${data.nombre || data.name}" y marca "${data.marca}"`,
        );
      }
    }
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
  getProductosDestacados,
  getCategorias,
  getMarcas,
  searchProductos,
  getProductosSimilares,
};

async function getProductosDestacados(limite = 8) {
  // Obtener productos con stock, ordenados por precio (mejores ofertas)
  const productos = await Producto.findAll({
    where: {
      stock: { [Op.gt]: 0 },
    },
    order: [
      ['precioreferencial', 'ASC'], // Mejores precios primero
      ['fechacreacion', 'DESC'], // Más recientes
    ],
    limit: limite,
  });

  return productos.map(formatProducto);
}

// Obtener todas las categorías únicas
async function getCategorias() {
  const categorias = await Producto.findAll({
    attributes: ['categoria'],
    group: ['categoria'],
    where: {
      categoria: { [Op.ne]: null },
    },
    order: [['categoria', 'ASC']],
  });

  return categorias.map((p) => p.categoria).filter(Boolean);
}

// Obtener todas las marcas únicas
async function getMarcas() {
  const marcas = await Producto.findAll({
    attributes: ['marca'],
    group: ['marca'],
    where: {
      marca: { [Op.ne]: null },
    },
    order: [['marca', 'ASC']],
  });

  return marcas.map((p) => p.marca).filter(Boolean);
}

// Buscar productos con sugerencias para autocompletado
async function searchProductos(query, limit = 10) {
  const productos = await Producto.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${query}%` } },
        { descripcion: { [Op.iLike]: `%${query}%` } },
        { marca: { [Op.iLike]: `%${query}%` } },
        { categoria: { [Op.iLike]: `%${query}%` } },
      ],
    },
    order: [
      // Priorizar coincidencias en nombre
      [
        Producto.sequelize.literal(
          `CASE WHEN LOWER(nombre) LIKE '${query.toLowerCase()}%' THEN 0 ELSE 1 END`,
        ),
        'ASC',
      ],
      ['nombre', 'ASC'],
    ],
    limit: limit,
  });

  const formattedProducts = productos.map(formatProducto);

  // Extraer sugerencias únicas de los nombres
  const suggestions = [...new Set(productos.map((p) => p.nombre))].slice(0, 5);

  return {
    suggestions,
    products: formattedProducts,
  };
}

// Obtener productos similares basados en categoría y marca
async function getProductosSimilares(productId, limit = 10) {
  const productoBase = await Producto.findByPk(productId);

  if (!productoBase) {
    return { principal: null, variantes: [] };
  }

  // Buscar productos similares por nombre (variantes del mismo producto)
  // Por ejemplo: "Tijera grande", "Tijera mediana", "Tijera pequeña"
  const palabrasClave = productoBase.nombre
    .split(' ')
    .filter((p) => p.length > 3);

  const whereConditions = [];

  // Coincidencia por categoría
  if (productoBase.categoria) {
    whereConditions.push({ categoria: productoBase.categoria });
  }

  // Coincidencia por marca
  if (productoBase.marca) {
    whereConditions.push({ marca: productoBase.marca });
  }

  // Coincidencia por palabras clave del nombre
  if (palabrasClave.length > 0) {
    whereConditions.push({
      [Op.or]: palabrasClave.map((palabra) => ({
        nombre: { [Op.iLike]: `%${palabra}%` },
      })),
    });
  }

  const productosSimilares = await Producto.findAll({
    where: {
      idproducto: { [Op.ne]: productId },
      [Op.or]: whereConditions,
    },
    order: [
      // Priorizar misma marca y categoría
      [
        Producto.sequelize.literal(`CASE 
        WHEN marca = '${productoBase.marca || ''}' AND categoria = '${productoBase.categoria || ''}' THEN 0
        WHEN marca = '${productoBase.marca || ''}' THEN 1
        WHEN categoria = '${productoBase.categoria || ''}' THEN 2
        ELSE 3
      END`),
        'ASC',
      ],
      ['precioreferencial', 'ASC'],
    ],
    limit: limit,
  });

  return {
    principal: formatProducto(productoBase),
    variantes: productosSimilares.map(formatProducto),
  };
}
