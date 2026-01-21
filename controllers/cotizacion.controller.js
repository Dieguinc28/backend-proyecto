const cotizacionService = require('../services/cotizacion.service');
const { Usuario } = require('../models');

const createCotizacion = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No hay items en la cotización' });
    }
    const cotizacion = await cotizacionService.createCotizacion(
      req.user.userId,
      items,
    );

    // Obtener nombre del usuario para la notificación
    const usuario = await Usuario.findByPk(req.user.userId, {
      attributes: ['nombre'],
    });

    // Emitir notificación a los administradores
    const io = req.app.get('io');
    if (io) {
      io.to('admin-notifications').emit('cotizacion:nueva', {
        id: cotizacion.id,
        userId: cotizacion.userId,
        userName: usuario?.nombre || 'Usuario',
        total: cotizacion.total,
        itemsCount: cotizacion.items.length,
        createdAt: cotizacion.createdAt,
      });
    }

    res.status(201).json(cotizacion);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al crear cotización', error: error.message });
  }
};

const uploadPdfCotizacion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }
    const result = await cotizacionService.processPdfCotizacion(
      req.user.userId,
      req.file,
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al procesar PDF', error: error.message });
  }
};

const getMyCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await cotizacionService.getCotizacionesByUsuario(
      req.user.userId,
    );
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cotizaciones' });
  }
};

const getAllCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await cotizacionService.getAllCotizaciones();
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cotizaciones' });
  }
};

const updateCotizacionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const cotizacion = await cotizacionService.updateCotizacionStatus(
      req.params.id,
      status,
    );
    if (!cotizacion) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cotización' });
  }
};

const downloadCotizacionPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await cotizacionService.generateCotizacionPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cotizacion-${id}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al generar PDF', error: error.message });
  }
};

module.exports = {
  createCotizacion,
  uploadPdfCotizacion,
  getMyCotizaciones,
  getAllCotizaciones,
  updateCotizacionStatus,
  downloadCotizacionPdf,
};
