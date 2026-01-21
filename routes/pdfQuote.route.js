const express = require('express');
const router = express.Router();
const multer = require('multer');
const { optionalAuth } = require('../middleware/auth');
const ocrService = require('../services/ocr.service');
const productMatcherService = require('../services/productMatcher.service');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB para PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

router.post(
  '/process',
  optionalAuth,
  upload.single('pdf'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: 'No se proporcionó archivo PDF' });
      }

      console.log('Procesando PDF...');

      let extractedProducts = [];
      let extractedText = '';
      let method = 'unknown';

      // Extraer texto del PDF
      extractedText = await ocrService.extractTextFromPDF(req.file.buffer);
      console.log('Texto extraído del PDF:', extractedText.substring(0, 200));

      // Extraer productos usando método tradicional (regex)
      console.log('Extrayendo productos con regex...');
      extractedProducts = ocrService.extractProductsFromText(extractedText);
      method = 'pdf-regex';
      console.log(
        `Método tradicional extrajo ${extractedProducts.length} productos`
      );

      if (extractedProducts.length === 0) {
        return res.status(400).json({
          message:
            'No se encontraron productos en el PDF. Verifica que el archivo contenga una lista de productos.',
        });
      }

      console.log(
        `Productos detectados: ${extractedProducts.length} (método: ${method})`
      );

      // Buscar productos similares en la base de datos
      const results = await productMatcherService.findSimilarProducts(
        extractedProducts
      );
      const stats = productMatcherService.generateStats(results);

      res.json({
        success: true,
        stats,
        results,
        method, // Método usado para extracción
        extractedText: extractedText.substring(0, 500), // Primeros 500 caracteres para debug
      });
    } catch (error) {
      console.error('Error procesando PDF:', error);
      res.status(500).json({
        message: 'Error al procesar el PDF',
        error: error.message,
      });
    }
  }
);

module.exports = router;
