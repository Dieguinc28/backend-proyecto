const { Proveedor, Precioproveedor, Producto } = require('../models');

class ProveedorService {
  async getAll() {
    return await Proveedor.findAll({
      include: [
        {
          model: Precioproveedor,
          include: [Producto],
        },
      ],
    });
  }

  async getById(id) {
    return await Proveedor.findByPk(id, {
      include: [
        {
          model: Precioproveedor,
          include: [Producto],
        },
      ],
    });
  }

  async create(data) {
    return await Proveedor.create(data);
  }

  async update(id, data) {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) throw new Error('Proveedor no encontrado');
    return await proveedor.update(data);
  }

  async delete(id) {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) throw new Error('Proveedor no encontrado');
    await proveedor.destroy();
    return { message: 'Proveedor eliminado' };
  }
}

module.exports = new ProveedorService();
