const recomendacionService = require('../services/recomendacion.service');
const { Producto } = require('../models'); 
const { Op } = require('sequelize'); // Importante: Importar Op de la librería

// --- 1. OBTENER TODAS ---
exports.getAll = async (req, res) => {
  try {
    const filters = {
      disponible: req.query.disponible === 'true' ? true : req.query.disponible === 'false' ? false : undefined,
      comprado: req.query.comprado === 'true' ? true : req.query.comprado === 'false' ? false : undefined,
      idproducto: req.query.idproducto,
      idproveedor: req.query.idproveedor,
    };
    const recomendaciones = await recomendacionService.getAll(filters);
    res.json(recomendaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. OBTENER POR ID ---
exports.getById = async (req, res) => {
  try {
    const recomendacion = await recomendacionService.getById(req.params.id);
    if (!recomendacion) {
      return res.status(404).json({ error: 'Recomendacion no encontrada' });
    }
    res.json(recomendacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. RECOMENDACIONES POR PRODUCTO (LÓGICA BLINDADA) ---
exports.getByProducto = async (req, res) => {
  try {
    const { idproducto } = req.params;

    // A. Buscamos el producto actual
    const productoActual = await Producto.findByPk(idproducto);

    if (!productoActual) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // B. Preparar palabra clave (Nombre)
    const nombreLimpio = productoActual.nombre.trim();
    let palabraClave = nombreLimpio.split(' ')[0];

    // Singularizar (quitar 's' o 'es')
    if (palabraClave.length > 3) {
        if (palabraClave.endsWith('es')) {
            palabraClave = palabraClave.slice(0, -2);
        } else if (palabraClave.endsWith('s')) {
            palabraClave = palabraClave.slice(0, -1);
        }
    }

    // LOG DE DEPURACIÓN (Mira esto en tu terminal)
    console.log(`--- BUSCANDO ALTERNATIVAS ---`);
    console.log(`Producto Base: ${productoActual.nombre} (Marca: ${productoActual.marca})`);
    console.log(`Palabra Clave: "${palabraClave}"`);

    // Si la palabra clave falla, devolvemos array vacío
    if (!palabraClave || palabraClave.length < 3) {
        console.log("Palabra clave muy corta, cancelando búsqueda.");
        return res.json([]);
    }

    // C. BÚSQUEDA ESTRICTA (Op.and)
    // Esto obliga a que se cumplan TODAS las condiciones.
    const recomendaciones = await Producto.findAll({
      where: {
        [Op.and]: [
            // 1. Que contenga la palabra clave (Ej: "Bolígrafo")
            { nombre: { [Op.iLike]: `%${palabraClave}%` } },
            
            // 2. Que sea de la misma categoría (para no mezclar peras con manzanas)
            { categoria: productoActual.categoria },
            
            // 3. Que la marca sea DIFERENTE a la actual
            { marca: { [Op.ne]: productoActual.marca } },

            // 4. Que no sea el mismo producto exacto
            { idproducto: { [Op.ne]: idproducto } },

            // 5. Que tenga stock
            { stock: { [Op.gt]: 0 } }
        ]
      },
      limit: 3 // Máximo 3 recomendaciones
    });

    console.log(`Encontrados: ${recomendaciones.length} productos.`);
    res.json(recomendaciones);

  } catch (error) {
    console.error('Error en recomendación:', error);
    res.status(500).json({ error: error.message });
  }
};

// --- RESTO DE FUNCIONES (NECESARIAS PARA QUE NO DE ERROR EL ROUTER) ---
exports.create = async (req, res) => {
  try {
    const recomendacion = await recomendacionService.create(req.body);
    res.status(201).json(recomendacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const recomendacion = await recomendacionService.update(req.params.id, req.body);
    res.json(recomendacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await recomendacionService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.marcarComoComprado = async (req, res) => {
  try {
    const idusuario = req.user?.idusuario || req.body.idusuario;
    const recomendacion = await recomendacionService.marcarComoComprado(req.params.id, idusuario);
    res.json(recomendacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.sincronizar = async (req, res) => {
  try {
    const result = await recomendacionService.sincronizarDesdePrecioProveedor();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.limpiarComprados = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const result = await recomendacionService.limpiarComprados(dias);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.validarDisponibilidad = async (req, res) => {
  try {
    const result = await recomendacionService.validarDisponibilidad(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMejoresOfertas = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const ofertas = await recomendacionService.getMejoresOfertas(limite);
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistorialCompras = async (req, res) => {
  try {
    const filters = {
      idusuario: req.query.idusuario || req.user?.idusuario,
      idproducto: req.query.idproducto,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta,
    };
    const historial = await recomendacionService.getHistorialCompras(filters);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEstadisticasCompras = async (req, res) => {
  try {
    const idusuario = req.query.idusuario || req.user?.idusuario;
    const estadisticas = await recomendacionService.getEstadisticasCompras(idusuario);
    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.iniciarSincronizacionAutomatica = async (req, res) => {
  try {
    const horas = parseInt(req.body.horas) || 1;
    recomendacionService.iniciarSincronizacionAutomatica(horas);
    res.json({ message: `Sincronización automática iniciada (cada ${horas} hora(s))` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.detenerSincronizacionAutomatica = async (req, res) => {
  try {
    recomendacionService.detenerSincronizacionAutomatica();
    res.json({ message: 'Sincronización automática detenida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
