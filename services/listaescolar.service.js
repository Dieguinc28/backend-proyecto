const {
  Listaescolar,
  Usuario,
  Estado,
  Itemlista,
  Producto,
} = require('../models');

class ListaescolarService {
  async getAll() {
    return await Listaescolar.findAll({
      include: [
        { model: Usuario, attributes: ['idusuario', 'nombre', 'email'] },
        { model: Estado },
        {
          model: Itemlista,
          include: [Producto],
        },
      ],
    });
  }

  async getById(id) {
    console.log('Service: Getting lista by ID:', id);
    const lista = await Listaescolar.findByPk(id, {
      include: [
        { model: Usuario, attributes: ['idusuario', 'nombre', 'email'] },
        { model: Estado },
        {
          model: Itemlista,
          include: [Producto],
        },
      ],
    });

    if (!lista) {
      console.log('Service: Lista not found');
      return null;
    }

    console.log('Service: Lista found, processing items...');
    // Mapear productos para incluir campo 'precio' e 'imagen'
    const listaJSON = lista.toJSON();
    console.log('Service: Raw items count:', listaJSON.Itemlistas?.length || 0);

    if (listaJSON.Itemlistas && Array.isArray(listaJSON.Itemlistas)) {
      listaJSON.Itemlistas = listaJSON.Itemlistas.map((item) => {
        // Asegurar que el item tenga todos los campos necesarios
        const mappedItem = {
          iditem: item.iditem, // Preservar el ID del item
          idlista: item.idlista,
          idproducto: item.idproducto,
          descripcion: item.descripcion,
          cantidad: item.cantidad || 1,
        };

        if (item.Producto) {
          // Asegurar que precio sea un número
          item.Producto.precio = item.Producto.precioreferencial
            ? parseFloat(item.Producto.precioreferencial)
            : 0;
          // Mantener ambos campos para compatibilidad
          item.Producto.imagen = item.Producto.image || '';
          mappedItem.Producto = item.Producto;
        }
        return mappedItem;
      });
      console.log(
        'Service: Processed items count:',
        listaJSON.Itemlistas.length,
      );
    }
    return listaJSON;
  }

  async getByUsuario(idusuario) {
    const listas = await Listaescolar.findAll({
      where: { idusuario },
      include: [
        { model: Estado },
        {
          model: Itemlista,
          include: [Producto],
        },
      ],
    });

    // Mapear productos para incluir campo 'precio' e 'imagen'
    return listas.map((lista) => {
      const listaJSON = lista.toJSON();
      if (listaJSON.Itemlistas && Array.isArray(listaJSON.Itemlistas)) {
        listaJSON.Itemlistas = listaJSON.Itemlistas.map((item) => {
          // Asegurar que el item tenga todos los campos necesarios
          const mappedItem = {
            iditem: item.iditem, // Preservar el ID del item
            idlista: item.idlista,
            idproducto: item.idproducto,
            descripcion: item.descripcion,
            cantidad: item.cantidad || 1,
          };

          if (item.Producto) {
            // Asegurar que precio sea un número
            item.Producto.precio = item.Producto.precioreferencial
              ? parseFloat(item.Producto.precioreferencial)
              : 0;
            // Mantener ambos campos para compatibilidad
            item.Producto.imagen = item.Producto.image || '';
            mappedItem.Producto = item.Producto;
          }
          return mappedItem;
        });
      }
      return listaJSON;
    });
  }

  async create(data) {
    return await Listaescolar.create(data);
  }

  async update(id, data) {
    const lista = await Listaescolar.findByPk(id);
    if (!lista) throw new Error('Lista no encontrada');
    return await lista.update(data);
  }

  async delete(id) {
    const lista = await Listaescolar.findByPk(id);
    if (!lista) throw new Error('Lista no encontrada');
    await lista.destroy();
    return { message: 'Lista eliminada' };
  }
}

module.exports = new ListaescolarService();
