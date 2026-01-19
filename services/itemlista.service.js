const { Itemlista, Producto, Listaescolar } = require('../models');

class ItemlistaService {
  async getAll() {
    return await Itemlista.findAll({
      include: [Producto, Listaescolar],
    });
  }

  async getById(id) {
    return await Itemlista.findByPk(id, {
      include: [Producto, Listaescolar],
    });
  }

  async getByLista(idlista) {
    return await Itemlista.findAll({
      where: { idlista },
      include: [Producto],
    });
  }

  async create(data) {
    const item = await Itemlista.create(data);
    // Recargar el item con las relaciones para devolver datos completos
    return await Itemlista.findByPk(item.iditem, {
      include: [Producto],
    });
  }

  async update(id, data) {
    const item = await Itemlista.findByPk(id);
    if (!item) throw new Error('Item no encontrado');
    return await item.update(data);
  }

  async delete(id) {
    const item = await Itemlista.findByPk(id);
    if (!item) throw new Error('Item no encontrado');
    await item.destroy();
    return { message: 'Item eliminado' };
  }
}

module.exports = new ItemlistaService();
