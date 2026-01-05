const {
  RecomendacionPrecio,
  Producto,
  Proveedor,
  Usuario,
} = require('../models');
const { Op } = require('sequelize');

class RecomendacionService {
  constructor() {
    this.io = null;
    this.sincronizacionInterval = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  emitUpdate(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // SINCRONIZACIÓN AUTOMÁTICA
  iniciarSincronizacionAutomatica(intervaloHoras = 1) {
    if (this.sincronizacionInterval) {
      clearInterval(this.sincronizacionInterval);
    }

    const intervaloMs = intervaloHoras * 3600000;

    this.sincronizacionInterval = setInterval(async () => {
      try {
        console.log('Ejecutando sincronización automática...');
        await this.sincronizarDesdePrecioProveedor();
        console.log('Sincronización automática completada');
      } catch (error) {
        console.error('Error en sincronización automática:', error);
      }
    }, intervaloMs);

    console.log(
      `Sincronización automática iniciada (cada ${intervaloHoras} hora(s))`
    );
  }

  detenerSincronizacionAutomatica() {
    if (this.sincronizacionInterval) {
      clearInterval(this.sincronizacionInterval);
      this.sincronizacionInterval = null;
      console.log('Sincronización automática detenida');
    }
  }

  async getAll(filters = {}) {
    const where = {};

    if (filters.disponible !== undefined) {
      where.disponible = filters.disponible;
    }

    if (filters.comprado !== undefined) {
      where.comprado = filters.comprado;
    }

    if (filters.idproducto) {
      where.idproducto = filters.idproducto;
    }

    if (filters.idproveedor) {
      where.idproveedor = filters.idproveedor;
    }

    return await RecomendacionPrecio.findAll({
      where,
      include: [
        { model: Producto },
        { model: Proveedor },
        { model: Usuario, required: false },
      ],
      order: [['precio', 'ASC']],
    });
  }

  async getById(id) {
    return await RecomendacionPrecio.findByPk(id, {
      include: [
        { model: Producto },
        { model: Proveedor },
        { model: Usuario, required: false },
      ],
    });
  }

  async getByProducto(idproducto) {
    return await RecomendacionPrecio.findAll({
      where: {
        idproducto,
        disponible: true,
        comprado: false,
      },
      include: [Proveedor],
      order: [['precio', 'ASC']],
    });
  }

  async create(data) {
    const recomendacion = await RecomendacionPrecio.create(data);
    const recomendacionCompleta = await this.getById(
      recomendacion.idrecomendacion
    );

    this.emitUpdate('recomendacion:created', recomendacionCompleta);

    return recomendacionCompleta;
  }

  async update(id, data) {
    const recomendacion = await RecomendacionPrecio.findByPk(id);
    if (!recomendacion) throw new Error('Recomendacion no encontrada');

    await recomendacion.update(data);
    const recomendacionActualizada = await this.getById(id);

    this.emitUpdate('recomendacion:updated', recomendacionActualizada);

    return recomendacionActualizada;
  }

  async marcarComoComprado(id, idusuario, validarStock = true) {
    const recomendacion = await RecomendacionPrecio.findByPk(id, {
      include: [Producto, Proveedor],
    });

    if (!recomendacion) throw new Error('Recomendacion no encontrada');

    // VALIDACIÓN DE STOCK
    if (validarStock) {
      const producto = recomendacion.Producto;
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Verificar si el producto está activo
      if (!producto.activo) {
        throw new Error('El producto no está disponible');
      }

      // Verificar stock si existe el campo
      if (producto.stock !== undefined && producto.stock <= 0) {
        throw new Error('Producto sin stock disponible');
      }
    }

    // Guardar en historial antes de marcar como comprado
    await this.guardarEnHistorial(recomendacion, idusuario);

    await recomendacion.update({
      comprado: true,
      disponible: false,
      fechacompra: new Date(),
      idusuario: idusuario,
    });

    const recomendacionActualizada = await this.getById(id);

    this.emitUpdate('recomendacion:purchased', {
      id,
      idproducto: recomendacion.idproducto,
      recomendacion: recomendacionActualizada,
    });

    return recomendacionActualizada;
  }

  // HISTORIAL DE COMPRAS
  async guardarEnHistorial(recomendacion, idusuario) {
    const { HistorialCompra } = require('../models');

    try {
      await HistorialCompra.create({
        idrecomendacion: recomendacion.idrecomendacion,
        idproducto: recomendacion.idproducto,
        idproveedor: recomendacion.idproveedor,
        precio: recomendacion.precio,
        idusuario: idusuario,
        fechacompra: new Date(),
      });
    } catch (error) {
      console.error('Error al guardar en historial:', error);
      // No lanzar error para no bloquear la compra
    }
  }

  async getHistorialCompras(filters = {}) {
    const { HistorialCompra } = require('../models');
    const where = {};

    if (filters.idusuario) {
      where.idusuario = filters.idusuario;
    }

    if (filters.idproducto) {
      where.idproducto = filters.idproducto;
    }

    if (filters.fechaDesde) {
      where.fechacompra = {
        [Op.gte]: new Date(filters.fechaDesde),
      };
    }

    if (filters.fechaHasta) {
      where.fechacompra = {
        ...where.fechacompra,
        [Op.lte]: new Date(filters.fechaHasta),
      };
    }

    return await HistorialCompra.findAll({
      where,
      include: [
        { model: Producto },
        { model: Proveedor },
        { model: Usuario, required: false },
      ],
      order: [['fechacompra', 'DESC']],
    });
  }

  async getEstadisticasCompras(idusuario = null) {
    const { HistorialCompra } = require('../models');
    const sequelize = require('../config/database');

    const where = idusuario ? { idusuario } : {};

    const [totalCompras, totalGastado, productosMasComprados] =
      await Promise.all([
        HistorialCompra.count({ where }),

        HistorialCompra.sum('precio', { where }),

        HistorialCompra.findAll({
          where,
          attributes: [
            'idproducto',
            [sequelize.fn('COUNT', sequelize.col('idproducto')), 'cantidad'],
            [sequelize.fn('SUM', sequelize.col('precio')), 'total'],
          ],
          include: [{ model: Producto }],
          group: ['idproducto', 'Producto.idproducto'],
          order: [[sequelize.fn('COUNT', sequelize.col('idproducto')), 'DESC']],
          limit: 10,
        }),
      ]);

    return {
      totalCompras: totalCompras || 0,
      totalGastado: parseFloat(totalGastado || 0),
      productosMasComprados,
    };
  }

  async delete(id) {
    const recomendacion = await RecomendacionPrecio.findByPk(id);
    if (!recomendacion) throw new Error('Recomendacion no encontrada');

    const idproducto = recomendacion.idproducto;
    await recomendacion.destroy();

    this.emitUpdate('recomendacion:deleted', { id, idproducto });

    return { message: 'Recomendacion eliminada' };
  }

  async sincronizarDesdePrecioProveedor() {
    const { Precioproveedor } = require('../models');

    const preciosProveedores = await Precioproveedor.findAll({
      include: [Producto, Proveedor],
    });

    const recomendaciones = [];

    for (const precio of preciosProveedores) {
      const existente = await RecomendacionPrecio.findOne({
        where: {
          idproducto: precio.idproducto,
          idproveedor: precio.idproveedor,
          comprado: false,
        },
      });

      if (!existente) {
        const recomendacion = await RecomendacionPrecio.create({
          idproducto: precio.idproducto,
          idproveedor: precio.idproveedor,
          precio: precio.precio,
          disponible: true,
          comprado: false,
        });
        recomendaciones.push(recomendacion);
      }
    }

    this.emitUpdate('recomendaciones:synced', {
      count: recomendaciones.length,
    });

    return {
      message: 'Sincronizacion completada',
      nuevasRecomendaciones: recomendaciones.length,
    };
  }

  async limpiarComprados(diasAntiguedad = 30) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

    // Obtener registros antes de eliminar para guardar en historial
    const recomendacionesAEliminar = await RecomendacionPrecio.findAll({
      where: {
        comprado: true,
        fechacompra: {
          [Op.lt]: fechaLimite,
        },
      },
    });

    // Asegurar que están en el historial
    for (const rec of recomendacionesAEliminar) {
      await this.guardarEnHistorial(rec, rec.idusuario);
    }

    const eliminados = await RecomendacionPrecio.destroy({
      where: {
        comprado: true,
        fechacompra: {
          [Op.lt]: fechaLimite,
        },
      },
    });

    this.emitUpdate('recomendaciones:cleaned', { count: eliminados });

    return {
      message: 'Limpieza completada',
      eliminados,
    };
  }

  // 🔍 VALIDACIÓN DE DISPONIBILIDAD
  async validarDisponibilidad(idrecomendacion) {
    const recomendacion = await RecomendacionPrecio.findByPk(idrecomendacion, {
      include: [Producto, Proveedor],
    });

    if (!recomendacion) {
      return { disponible: false, motivo: 'Recomendación no encontrada' };
    }

    if (!recomendacion.disponible) {
      return { disponible: false, motivo: 'Marcada como no disponible' };
    }

    if (recomendacion.comprado) {
      return { disponible: false, motivo: 'Ya fue comprada' };
    }

    const producto = recomendacion.Producto;
    if (!producto || !producto.activo) {
      return { disponible: false, motivo: 'Producto no disponible' };
    }

    if (producto.stock !== undefined && producto.stock <= 0) {
      return { disponible: false, motivo: 'Sin stock' };
    }

    return {
      disponible: true,
      producto: producto.nombre,
      proveedor: recomendacion.Proveedor?.nombre,
      precio: recomendacion.precio,
    };
  }

  // OBTENER MEJORES OFERTAS
  async getMejoresOfertas(limite = 10) {
    return await RecomendacionPrecio.findAll({
      where: {
        disponible: true,
        comprado: false,
      },
      include: [
        { model: Producto, where: { activo: true } },
        { model: Proveedor },
      ],
      order: [['precio', 'ASC']],
      limit: limite,
    });
  }
}

module.exports = new RecomendacionService();
