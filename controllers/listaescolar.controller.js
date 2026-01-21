const listaescolarService = require('../services/listaescolar.service');

exports.getAll = async (req, res) => {
  try {
    const listas = await listaescolarService.getAll();
    res.json(listas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    console.log('Getting lista by ID:', req.params.id);
    const lista = await listaescolarService.getById(req.params.id);
    if (!lista) return res.status(404).json({ error: 'Lista no encontrada' });
    console.log('Lista found with items:', lista.Itemlistas?.length || 0);
    res.json(lista);
  } catch (error) {
    console.error('Error getting lista:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getByUsuario = async (req, res) => {
  try {
    const listas = await listaescolarService.getByUsuario(req.params.idusuario);
    res.json(listas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Creating lista with data:', req.body);
    const lista = await listaescolarService.create(req.body);
    res.status(201).json(lista);
  } catch (error) {
    console.error('Error creating lista:', error);
    res.status(400).json({
      error: error.message,
      details: error.errors ? error.errors.map((e) => e.message) : undefined,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const lista = await listaescolarService.update(req.params.id, req.body);
    res.json(lista);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await listaescolarService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
