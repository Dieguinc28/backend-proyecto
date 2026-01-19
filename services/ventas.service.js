const {
  Ventas,
  Detallecotizacion,
  Cotizacion,
  Producto,
} = require('../models');

class VentasService {
  async getAll() {
    return await Ventas.findAll({
      include: [
        {
          model: Detallecotizacion,
          include: [Cotizacion, Producto],
        },
      ],
    });
  }

  async getById(id) {
    return await Ventas.findByPk(id, {
      include: [
        {
          model: Detallecotizacion,
          include: [Cotizacion, Producto],
        },
      ],
    });
  }

  async create(data) {
    return await Ventas.create(data);
  }

  async update(id, data) {
    const venta = await Ventas.findByPk(id);
    if (!venta) throw new Error('Venta no encontrada');
    return await venta.update(data);
  }

  async delete(id) {
    const venta = await Ventas.findByPk(id);
    if (!venta) throw new Error('Venta no encontrada');
    await venta.destroy();
    return { message: 'Venta eliminada' };
  }
}

module.exports = new VentasService();
