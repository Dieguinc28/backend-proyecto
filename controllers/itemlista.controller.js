const itemlistaService = require('../services/itemlista.service');

exports.getAll = async (req, res) => {
  try {
    const items = await itemlistaService.getAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await itemlistaService.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByLista = async (req, res) => {
  try {
    const items = await itemlistaService.getByLista(req.params.idlista);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Creating item with data:', req.body);
    const item = await itemlistaService.create(req.body);
    console.log('Item created successfully:', item);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await itemlistaService.update(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await itemlistaService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
