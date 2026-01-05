const detallecotizacionService = require('../services/detallecotizacion.service');

exports.getAll = async (req, res) => {
  try {
    const detalles = await detallecotizacionService.getAll();
    res.json(detalles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const detalle = await detallecotizacionService.getById(req.params.id);
    if (!detalle)
      return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json(detalle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByCotizacion = async (req, res) => {
  try {
    const detalles = await detallecotizacionService.getByCotizacion(
      req.params.idcotizacion
    );
    res.json(detalles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const detalle = await detallecotizacionService.create(req.body);
    res.status(201).json(detalle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const detalle = await detallecotizacionService.update(
      req.params.id,
      req.body
    );
    res.json(detalle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await detallecotizacionService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
