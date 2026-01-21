const express = require('express');
const router = express.Router();
const multer = require('multer');
const { optionalAuth } = require('../middleware/auth');
const ocrService = require('../services/ocr.service');
const productMatcherService = require('../services/productMatcher.service');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
    }
  },
});

router.post(
  '/process',
  optionalAuth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: 'No se proporcionó archivo de imagen' });
      }

      console.log('Procesando imagen...');

      let extractedProducts = [];
      let extractedText = '';
      let method = 'ocr-regex';

      // Extraer texto con OCR
      console.log('Extrayendo texto con OCR...');
      extractedText = await ocrService.extractTextFromImage(req.file.buffer);

      // Extraer productos usando método tradicional (regex)
      console.log('Extrayendo productos con regex...');
      extractedProducts = ocrService.extractProductsFromText(extractedText);
      console.log(
        `Método tradicional extrajo ${extractedProducts.length} productos`
      );

      if (extractedProducts.length === 0) {
        return res.status(400).json({
          message:
            'No se encontraron productos en la imagen. Asegúrate de que la imagen sea clara y legible.',
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
        extractedText: extractedText ? extractedText.substring(0, 500) : '', // Primeros 500 caracteres para debug
      });
    } catch (error) {
      console.error('Error procesando imagen:', error);
      res.status(500).json({
        message: 'Error al procesar la imagen',
        error: error.message,
      });
    }
  }
);

module.exports = router;
