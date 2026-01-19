const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const productoController = require('../controllers/producto.controller');
const { auth, isAdmin } = require('../middleware/auth');

// Usar memoryStorage si Cloudinary está configurado, diskStorage si no
const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: useCloudinary ? memoryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

router.get('/export/csv', auth, isAdmin, productoController.exportProductosCSV);
router.get('/destacados', productoController.getProductosDestacados);
router.get('/categorias', productoController.getCategorias);
router.get('/marcas', productoController.getMarcas);
router.get('/search', productoController.searchProductos);
router.get('/similares/:id', productoController.getProductosSimilares);
router.get('/', productoController.getAllProductos);
router.get('/:id', productoController.getProductoById);
router.post(
  '/',
  auth,
  isAdmin,
  upload.single('image'),
  productoController.createProducto,
);
router.put(
  '/:id',
  auth,
  isAdmin,
  upload.single('image'),
  productoController.updateProducto,
);
router.delete('/:id', auth, isAdmin, productoController.deleteProducto);

module.exports = router;
