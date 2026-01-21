const { Estado } = require('../models');

class EstadoService {
  async getAll() {
    return await Estado.findAll();
  }

  async getById(id) {
    return await Estado.findByPk(id);
  }

  async create(data) {
    return await Estado.create(data);
  }

  async update(id, data) {
    const estado = await Estado.findByPk(id);
    if (!estado) throw new Error('Estado no encontrado');
    return await estado.update(data);
  }

  async delete(id) {
    const estado = await Estado.findByPk(id);
    if (!estado) throw new Error('Estado no encontrado');
    await estado.destroy();
    return { message: 'Estado eliminado' };
  }
}

module.exports = new EstadoService();
