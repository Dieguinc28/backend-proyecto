const precioproveedorService = require('../services/precioproveedor.service');

exports.getAll = async (req, res) => {
  try {
    const precios = await precioproveedorService.getAll();
    res.json(precios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const precio = await precioproveedorService.getById(req.params.id);
    if (!precio) return res.status(404).json({ error: 'Precio no encontrado' });
    res.json(precio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByProducto = async (req, res) => {
  try {
    const precios = await precioproveedorService.getByProducto(
      req.params.idproducto
    );
    res.json(precios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByProveedor = async (req, res) => {
  try {
    const precios = await precioproveedorService.getByProveedor(
      req.params.idproveedor
    );
    res.json(precios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const precio = await precioproveedorService.create(req.body);
    res.status(201).json(precio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const precio = await precioproveedorService.update(req.params.id, req.body);
    res.json(precio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await precioproveedorService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
