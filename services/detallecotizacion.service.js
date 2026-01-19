const { Detallecotizacion, Cotizacion, Producto } = require('../models');

class DetallecotizacionService {
  async getAll() {
    return await Detallecotizacion.findAll({
      include: [Cotizacion, Producto],
    });
  }

  async getById(id) {
    return await Detallecotizacion.findByPk(id, {
      include: [Cotizacion, Producto],
    });
  }

  async getByCotizacion(idcotizacion) {
    return await Detallecotizacion.findAll({
      where: { idcotizacion },
      include: [Producto],
    });
  }

  async create(data) {
    return await Detallecotizacion.create(data);
  }

  async update(id, data) {
    const detalle = await Detallecotizacion.findByPk(id);
    if (!detalle) throw new Error('Detalle no encontrado');
    return await detalle.update(data);
  }

  async delete(id) {
    const detalle = await Detallecotizacion.findByPk(id);
    if (!detalle) throw new Error('Detalle no encontrado');
    await detalle.destroy();
    return { message: 'Detalle eliminado' };
  }
}

module.exports = new DetallecotizacionService();
