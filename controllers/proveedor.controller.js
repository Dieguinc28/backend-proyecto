const proveedorService = require('../services/proveedor.service');

exports.getAll = async (req, res) => {
  try {
    const proveedores = await proveedorService.getAll();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const proveedor = await proveedorService.getById(req.params.id);
    if (!proveedor)
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const proveedor = await proveedorService.create(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const proveedor = await proveedorService.update(req.params.id, req.body);
    res.json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await proveedorService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
