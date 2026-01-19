const {
  sequelize,
  Cotizacion,
  Detallecotizacion,
  Producto,
  Usuario,
  Listaescolar,
  Proveedor,
} = require('../models');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const createCotizacion = async (userId, items) => {
  // Iniciamos la transacción para asegurar la integridad de los datos
  const t = await sequelize.transaction();

  try {
    let total = 0;
    const cotizacionItems = [];
    const detallesData = [];

    // Procesar items, calcular total y verificar stock
    for (const item of items) {
      // Buscamos el producto con bloqueo para evitar condiciones de carrera
      const producto = await Producto.findByPk(item.productId, {
        transaction: t,
        lock: true,
      });

      if (producto) {
        const stockActual = producto.stock || 0;

        // Verificar que hay suficiente stock
        if (stockActual < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". ` +
              `Disponible: ${stockActual}, Solicitado: ${item.quantity}`
          );
        }

        const precioUnitario = parseFloat(producto.precioreferencial);
        const subtotal = precioUnitario * item.quantity;

        cotizacionItems.push({
          productId: String(producto.idproducto),
          name: producto.nombre,
          brand: producto.marca || 'N/A',
          quantity: item.quantity,
          price: precioUnitario,
        });

        detallesData.push({
          idproducto: producto.idproducto,
          cantidad: item.quantity,
          preciounitario: precioUnitario,
          subtotal: subtotal,
        });

        total += subtotal;

        // DESCONTAR STOCK AL CREAR LA COTIZACIÓN
        await producto.decrement('stock', {
          by: item.quantity,
          transaction: t,
        });
      } else {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }
    }

    // Crear la cotización en la base de datos (dentro de la transacción)
    const cotizacion = await Cotizacion.create(
      {
        idusuario: userId,
        items: JSON.stringify(cotizacionItems),
        total,
        estado: 'pendiente',
        fecha: new Date(),
      },
      { transaction: t }
    );

    // Crear los detalles de la cotización (dentro de la transacción)
    for (const detalleData of detallesData) {
      await Detallecotizacion.create(
        {
          idcotizacion: cotizacion.idcotizacion,
          ...detalleData,
        },
        { transaction: t }
      );
    }

    // Si todo salió bien, confirmamos los cambios en la BD
    await t.commit();

    return {
      id: cotizacion.idcotizacion,
      userId,
      items: cotizacionItems,
      total,
      status: 'pendiente',
      createdAt: cotizacion.fechacreacion,
      updatedAt: cotizacion.fechamodificacion,
    };
  } catch (error) {
    // Si hubo error (ej. falta stock), deshacemos todos los cambios
    await t.rollback();
    throw error; // Lanzamos el error para que el controlador lo reciba
  }
};

const processPdfCotizacion = async (userId, file) => {
  const dataBuffer = fs.readFileSync(file.path);
  let text = '';

  // Extraer texto del PDF
  if (file.mimetype === 'application/pdf') {
    try {
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;

      if (!text || text.trim().length < 10) {
        throw new Error('PDF sin texto detectado');
      }
    } catch (error) {
      throw new Error('No se pudo extraer texto del PDF: ' + error.message);
    }
  } else {
    throw new Error('Tipo de archivo no soportado');
  }

  console.log('Texto extraído:', text.substring(0, 200) + '...');

  const productos = await Producto.findAll();
  const foundItems = [];
  const detallesData = [];

  for (const producto of productos) {
    const regex = new RegExp(producto.nombre, 'gi');
    const matches = text.match(regex);

    if (matches) {
      const quantityRegex = new RegExp(
        `(\\d+)\\s*${producto.nombre}|${producto.nombre}\\s*(\\d+)`,
        'gi'
      );
      const quantityMatch = text.match(quantityRegex);
      const quantity = quantityMatch
        ? parseInt(quantityMatch[0].match(/\d+/)[0])
        : 1;

      const precioUnitario = parseFloat(producto.precioreferencial);
      const subtotal = precioUnitario * quantity;

      foundItems.push({
        productId: String(producto.idproducto),
        name: producto.nombre,
        brand: producto.marca || 'N/A',
        quantity,
        price: precioUnitario,
      });

      detallesData.push({
        idproducto: producto.idproducto,
        cantidad: quantity,
        preciounitario: precioUnitario,
        subtotal: subtotal,
      });
    }
  }

  const total = foundItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Guardar la cotización en la base de datos
  const cotizacion = await Cotizacion.create({
    idusuario: userId,
    items: JSON.stringify(foundItems),
    total,
    estado: 'pendiente',
    pdffile: file.filename,
    fecha: new Date(),
  });

  // Crear los detalles de la cotización
  for (const detalleData of detallesData) {
    await Detallecotizacion.create({
      idcotizacion: cotizacion.idcotizacion,
      ...detalleData,
    });
  }

  return {
    message: 'Archivo procesado exitosamente',
    quote: {
      id: cotizacion.idcotizacion,
      userId,
      items: foundItems,
      total,
      status: 'pendiente',
      pdfFile: file.filename,
      createdAt: cotizacion.fechacreacion,
      updatedAt: cotizacion.fechamodificacion,
    },
    itemsFound: foundItems.length,
    extractedText: text.substring(0, 500), // Primeros 500 caracteres para debug
  };
};

const getCotizacionesByUsuario = async (userId) => {
  try {
    const cotizaciones = await Cotizacion.findAll({
      where: { idusuario: userId },
      include: [
        {
          model: Usuario,
          attributes: ['idusuario', 'nombre', 'email'],
        },
        {
          model: Detallecotizacion,
          include: [
            {
              model: Producto,
              attributes: [
                'idproducto',
                'nombre',
                'marca',
                'precioreferencial',
              ],
            },
          ],
        },
      ],
      order: [['fechacreacion', 'DESC']],
    });

    // Transformar al formato esperado por el frontend
    return cotizaciones.map((cot) => {
      const items = cot.Detallecotizacions.map((detalle) => ({
        productId: String(detalle.idproducto),
        name: detalle.Producto.nombre,
        brand: detalle.Producto.marca || 'N/A',
        quantity: detalle.cantidad,
        price: parseFloat(detalle.preciounitario),
      }));

      return {
        id: cot.idcotizacion,
        userId: cot.idusuario,
        user: cot.Usuario
          ? {
              id: cot.Usuario.idusuario,
              name: cot.Usuario.nombre,
              email: cot.Usuario.email,
            }
          : null,
        items: items,
        total: parseFloat(cot.total),
        status: cot.estado || 'pendiente',
        createdAt: cot.fechacreacion,
        updatedAt: cot.fechamodificacion,
      };
    });
  } catch (error) {
    console.error('Error obteniendo cotizaciones del usuario:', error);
    return [];
  }
};

const getAllCotizaciones = async () => {
  try {
    const cotizaciones = await Cotizacion.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['idusuario', 'nombre', 'email'],
        },
        {
          model: Detallecotizacion,
          include: [
            {
              model: Producto,
              attributes: [
                'idproducto',
                'nombre',
                'marca',
                'precioreferencial',
              ],
            },
          ],
        },
      ],
      order: [['fechacreacion', 'DESC']],
    });

    // Transformar al formato esperado por el frontend
    return cotizaciones.map((cot) => {
      const items = cot.Detallecotizacions.map((detalle) => ({
        productId: String(detalle.idproducto),
        name: detalle.Producto.nombre,
        brand: detalle.Producto.marca || 'N/A',
        quantity: detalle.cantidad,
        price: parseFloat(detalle.preciounitario),
      }));

      return {
        id: cot.idcotizacion,
        userId: cot.idusuario,
        user: cot.Usuario
          ? {
              id: cot.Usuario.idusuario,
              name: cot.Usuario.nombre,
              email: cot.Usuario.email,
            }
          : null,
        items: items,
        total: parseFloat(cot.total),
        status: cot.estado || 'pendiente',
        createdAt: cot.fechacreacion,
        updatedAt: cot.fechamodificacion,
      };
    });
  } catch (error) {
    console.error('Error obteniendo todas las cotizaciones:', error);
    return [];
  }
};

const updateCotizacionStatus = async (id, status) => {
  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [
        {
          model: Usuario,
          attributes: ['idusuario', 'nombre', 'email'],
        },
        {
          model: Detallecotizacion,
          include: [
            {
              model: Producto,
              attributes: [
                'idproducto',
                'nombre',
                'marca',
                'precioreferencial',
                'stock',
              ],
            },
          ],
        },
      ],
      transaction: t,
    });

    if (!cotizacion) {
      await t.rollback();
      return null;
    }

    const estadoAnterior = cotizacion.estado;

    // --- DEVOLVER STOCK SI SE RECHAZA O CANCELA UNA COTIZACIÓN PENDIENTE ---
    // El stock ya se descontó al crear, así que solo devolvemos si se rechaza/cancela
    if (
      (status === 'rechazada' || status === 'cancelada') &&
      estadoAnterior === 'pendiente'
    ) {
      for (const detalle of cotizacion.Detallecotizacions) {
        const producto = await Producto.findByPk(detalle.idproducto, {
          transaction: t,
          lock: true,
        });

        if (producto) {
          // Devolvemos el stock
          await producto.increment('stock', {
            by: detalle.cantidad,
            transaction: t,
          });
        }
      }
    }

    // Actualizamos el estado de la cotización
    cotizacion.estado = status;
    await cotizacion.save({ transaction: t });

    await t.commit();

    const items = cotizacion.Detallecotizacions.map((detalle) => ({
      productId: String(detalle.idproducto),
      name: detalle.Producto.nombre,
      brand: detalle.Producto.marca || 'N/A',
      quantity: detalle.cantidad,
      price: parseFloat(detalle.preciounitario),
    }));

    return {
      id: cotizacion.idcotizacion,
      userId: cotizacion.idusuario,
      user: cotizacion.Usuario
        ? {
            id: cotizacion.Usuario.idusuario,
            name: cotizacion.Usuario.nombre,
            email: cotizacion.Usuario.email,
          }
        : null,
      items: items,
      total: parseFloat(cotizacion.total),
      status: cotizacion.estado,
      createdAt: cotizacion.fechacreacion,
      updatedAt: cotizacion.fechamodificacion,
    };
  } catch (error) {
    await t.rollback();
    console.error('Error actualizando estado de cotización:', error);
    throw error;
  }
};

module.exports = {
  createCotizacion,
  processPdfCotizacion,
  getCotizacionesByUsuario,
  getAllCotizaciones,
  updateCotizacionStatus,
};
