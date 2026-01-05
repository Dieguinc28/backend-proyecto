const { Precioproveedor, Producto, Proveedor } = require('../models');

class PrecioproveedorService {
  async getAll() {
    return await Precioproveedor.findAll({
      include: [Producto, Proveedor],
    });
  }

  async getById(id) {
    return await Precioproveedor.findByPk(id, {
      include: [Producto, Proveedor],
    });
  }

  async getByProducto(idproducto) {
    return await Precioproveedor.findAll({
      where: { idproducto },
      include: [Proveedor],
    });
  }

  async getByProveedor(idproveedor) {
    return await Precioproveedor.findAll({
      where: { idproveedor },
      include: [Producto],
    });
  }

  async create(data) {
    return await Precioproveedor.create(data);
  }

  async update(id, data) {
    const precio = await Precioproveedor.findByPk(id);
    if (!precio) throw new Error('Precio no encontrado');
    return await precio.update(data);
  }

  async delete(id) {
    const precio = await Precioproveedor.findByPk(id);
    if (!precio) throw new Error('Precio no encontrado');
    await precio.destroy();
    return { message: 'Precio eliminado' };
  }
}

module.exports = new PrecioproveedorService();
