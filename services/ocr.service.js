const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');

class OCRService {
  /**
   * Extrae texto de una imagen usando Tesseract OCR
   */
  async extractTextFromImage(imageBuffer) {
    try {
      // Optimizar imagen para mejor OCR con múltiples técnicas
      const optimizedImage = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: false }) // Aumentar resolución
        .greyscale() // Convertir a escala de grises
        .normalize() // Normalizar contraste
        .sharpen() // Aumentar nitidez
        .threshold(128) // Binarización para mejor contraste
        .toBuffer();

      const {
        data: { text },
      } = await Tesseract.recognize(
        optimizedImage,
        'spa', // Español
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR: ${Math.round(m.progress * 100)}%`);
            }
          },
          tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Detección automática de layout
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúñÁÉÍÓÚÑ0123456789 .,()-/', // Caracteres permitidos
        }
      );

      return text;
    } catch (error) {
      console.error('Error en OCR de imagen:', error);
      throw new Error('No se pudo extraer texto de la imagen');
    }
  }

  /**
   * Extrae texto de un PDF
   */
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error);
      throw new Error('No se pudo extraer texto del PDF');
    }
  }

  /**
   * Procesa cualquier archivo (imagen o PDF)
   */
  async extractText(fileBuffer, mimeType) {
    if (mimeType === 'application/pdf') {
      return await this.extractTextFromPDF(fileBuffer);
    } else if (mimeType.startsWith('image/')) {
      return await this.extractTextFromImage(fileBuffer);
    } else {
      throw new Error('Tipo de archivo no soportado');
    }
  }

  /**
   * Extrae productos del texto extraído con algoritmo mejorado
   */
  extractProductsFromText(text) {
    const lines = text.split(/[\n\r]+/);
    const products = [];
    const seenProducts = new Set();

    // Palabras a ignorar (encabezados, totales, etc)
    const ignorePatterns = [
      /^(lista|materiales|cantidad|producto|precio|total|subtotal|iva|descuento|fecha|cliente|proveedor|cotizacion|factura)/i,
      /^\d+[\.,]\d{2}$/, // Solo precios
      /^[\$S\/\.]+\s*\d+/, // Solo símbolos de moneda
      /^(lunes|martes|miercoles|jueves|viernes|sabado|domingo)/i, // Días
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, // Fechas
    ];

    for (const line of lines) {
      let trimmedLine = line.trim();

      // Ignorar líneas muy cortas
      if (trimmedLine.length < 3) continue;

      // Ignorar líneas que coincidan con patrones a ignorar
      if (ignorePatterns.some((pattern) => pattern.test(trimmedLine))) continue;

      let quantity = 1;
      let productName = trimmedLine;

      // PATRÓN 1: "2 Cuadernos universitarios" o "02 Lapiceros"
      let match = trimmedLine.match(/^(\d{1,3})\s+(.+)$/);
      if (match) {
        quantity = parseInt(match[1]) || 1;
        productName = match[2].trim();
      } else {
        // PATRÓN 2: "Cuaderno x2" o "Lapicero × 3"
        match = trimmedLine.match(/^(.+?)\s*[x×]\s*(\d{1,3})$/i);
        if (match) {
          productName = match[1].trim();
          quantity = parseInt(match[2]) || 1;
        } else {
          // PATRÓN 3: "- Lapicero azul" o "• Cuaderno"
          match = trimmedLine.match(/^[\-\*\•\◦\▪\→]+\s*(.+)$/);
          if (match) {
            productName = match[1].trim();
          }
        }
      }

      // Limpiar el nombre del producto
      productName = productName
        .replace(/^[\d\.\-\*\•\◦\▪\→\s]+/, '') // Quitar números y viñetas al inicio
        .replace(/\s*[\(\[].*?[\)\]]\s*/g, ' ') // Quitar contenido entre paréntesis/corchetes
        .replace(/\s*[x×]\s*\d+\s*$/i, '') // Quitar "x2" al final
        .replace(/[\$S\/\.]+\s*\d+[\.,]?\d*/, '') // Quitar precios
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();

      // Validar que el producto tenga al menos una palabra significativa
      const words = productName.split(/\s+/).filter((w) => w.length > 2);
      if (words.length === 0) continue;

      // Normalizar para evitar duplicados
      const normalized = this.normalizeText(productName);

      // Validar longitud mínima y que no sea duplicado
      if (productName.length > 2 && !seenProducts.has(normalized)) {
        seenProducts.add(normalized);
        products.push({
          original: productName,
          normalized: normalized,
          quantity: Math.min(quantity, 999), // Limitar cantidad máxima
        });
      }
    }

    console.log(`Extraídos ${products.length} productos únicos del texto`);
    return products;
  }

  /**
   * Normaliza texto para comparación
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new OCRService();
