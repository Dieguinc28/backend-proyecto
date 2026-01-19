const { Producto } = require('../models');
const { Op } = require('sequelize');

// Diccionario de sinónimos para productos de papelería
const SINONIMOS = {
  // Escritura
  boligrafo: ['lapicero', 'pluma', 'esfero', 'birome', 'boli', 'pen'],
  lapicero: ['boligrafo', 'pluma', 'esfero', 'birome', 'boli', 'pen'],
  lapiz: ['grafito', 'lapis'],
  marcador: ['plumon', 'rotulador', 'resaltador', 'plumones', 'marcadores'],
  plumon: ['marcador', 'rotulador', 'resaltador', 'plumones'],
  resaltador: ['subrayador', 'marcador fluorescente', 'highlighter'],

  // Colores
  colores: ['lapices de colores', 'lapices color', 'pinturas', 'crayones'],
  crayones: ['crayolas', 'colores de cera', 'lapices cera'],
  crayolas: ['crayones', 'colores de cera'],
  temperas: ['pinturas', 'acuarelas'],
  acuarelas: ['temperas', 'pinturas'],

  // Corte
  tijera: ['tijeras', 'cortadora'],
  tijeras: ['tijera', 'cortadora'],
  cutter: ['exacto', 'cortador', 'navaja'],

  // Pegado
  goma: ['pegamento', 'cola', 'adhesivo', 'pega', 'pritt'],
  pegamento: ['goma', 'cola', 'adhesivo', 'pega', 'silicona'],
  silicona: ['pegamento', 'silicon', 'goma caliente'],
  cinta: ['tape', 'scotch', 'cinta adhesiva', 'masking'],

  // Cuadernos
  cuaderno: ['libreta', 'block', 'bloc', 'agenda', 'cuadernillo'],
  libreta: ['cuaderno', 'block', 'bloc', 'cuadernillo'],
  block: ['cuaderno', 'libreta', 'bloc', 'taco'],
  folder: ['carpeta', 'portafolio', 'archivador'],
  carpeta: ['folder', 'portafolio', 'archivador', 'funda'],

  // Geometría
  regla: ['escuadra', 'metro', 'regleta'],
  escuadra: ['regla', 'cartabon'],
  compas: ['circulo', 'circunferencia'],
  transportador: ['graduador', 'semicirculo'],

  // Borrado
  borrador: ['goma de borrar', 'eraser', 'borra'],
  corrector: ['liquid paper', 'blanqueador', 'tipp-ex', 'wite-out'],

  // Sacapuntas
  sacapuntas: ['tajador', 'afilador', 'tajalapiz', 'sacapunta'],
  tajador: ['sacapuntas', 'afilador', 'tajalapiz'],

  // Papel
  hojas: ['papel', 'folios', 'resma'],
  papel: ['hojas', 'folios', 'resma'],
  cartulina: ['carton', 'papel grueso', 'fomix'],
  fomix: ['foami', 'goma eva', 'foamy'],

  // Mochilas
  mochila: ['maleta', 'bolso', 'morral', 'backpack'],
  maleta: ['mochila', 'bolso', 'morral'],
  lonchera: ['lonchero', 'porta alimentos', 'contenedor'],

  // Otros
  plastilina: ['plasticina', 'masa moldeable', 'play doh'],
  estuche: ['cartuchera', 'lapicera', 'porta lapices'],
  cartuchera: ['estuche', 'lapicera', 'porta lapices'],
};

// Función para expandir términos de búsqueda con sinónimos
function expandirConSinonimos(texto) {
  const palabras = texto.toLowerCase().split(/\s+/);
  const expandidas = new Set(palabras);

  palabras.forEach((palabra) => {
    // Buscar sinónimos directos
    if (SINONIMOS[palabra]) {
      SINONIMOS[palabra].forEach((sin) => expandidas.add(sin));
    }
    // Buscar si la palabra es un sinónimo de algo
    Object.entries(SINONIMOS).forEach(([key, valores]) => {
      if (valores.includes(palabra)) {
        expandidas.add(key);
        valores.forEach((v) => expandidas.add(v));
      }
    });
  });

  return Array.from(expandidas);
}

class ProductMatcherService {
  constructor() {
    this.sinonimos = SINONIMOS;
  }

  /**
   * Expande el texto de búsqueda incluyendo sinónimos
   */
  expandSearchTerms(searchText) {
    return expandirConSinonimos(searchText);
  }

  /**
   * Calcula similitud entre dos textos (0-100) con algoritmo mejorado
   */
  calculateSimilarity(str1, str2) {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);

    // Coincidencia exacta
    if (s1 === s2) return 100;

    // Uno contiene al otro completamente
    if (s1.includes(s2) || s2.includes(s1)) {
      const longer = Math.max(s1.length, s2.length);
      const shorter = Math.min(s1.length, s2.length);
      return Math.round(85 + (shorter / longer) * 15); // 85-100
    }

    // Comparar palabras con pesos
    const words1 = s1.split(/\s+/).filter((w) => w.length > 2);
    const words2 = s2.split(/\s+/).filter((w) => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    let exactMatches = 0;
    let partialMatches = 0;
    let positionBonus = 0;
    let synonymBonus = 0;

    words1.forEach((w1, i1) => {
      words2.forEach((w2, i2) => {
        if (w1 === w2) {
          exactMatches++;
          // Bonus si las palabras están en posiciones similares
          if (Math.abs(i1 - i2) <= 1) positionBonus += 0.2;
        } else if (this.areSynonyms(w1, w2)) {
          // Bonus por sinónimos
          synonymBonus += 0.8;
        } else if (w1.length >= 4 && w2.length >= 4) {
          // Solo comparar palabras significativas
          if (w1.includes(w2) || w2.includes(w1)) {
            const longer = Math.max(w1.length, w2.length);
            const shorter = Math.min(w1.length, w2.length);
            partialMatches += shorter / longer; // Match proporcional
          } else {
            // Calcular distancia de Levenshtein simplificada
            const distance = this.levenshteinDistance(w1, w2);
            const maxLen = Math.max(w1.length, w2.length);
            if (distance <= maxLen * 0.3) {
              // 30% de diferencia permitida
              partialMatches += 0.5;
            }
          }
        }
      });
    });

    const totalMatches =
      exactMatches + partialMatches + positionBonus + synonymBonus;
    const maxWords = Math.max(words1.length, words2.length);
    const similarity = (totalMatches / maxWords) * 100;

    return Math.min(100, Math.round(similarity));
  }

  /**
   * Verifica si dos palabras son sinónimos
   */
  areSynonyms(word1, word2) {
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();

    if (SINONIMOS[w1] && SINONIMOS[w1].includes(w2)) return true;
    if (SINONIMOS[w2] && SINONIMOS[w2].includes(w1)) return true;

    return false;
  }

  /**
   * Calcula distancia de Levenshtein entre dos strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitución
            matrix[i][j - 1] + 1, // inserción
            matrix[i - 1][j] + 1, // eliminación
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Normaliza texto
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Busca productos similares en la base de datos con algoritmo mejorado
   */
  async findSimilarProducts(extractedProducts, minSimilarity = 35) {
    const results = [];
    const allProducts = await Producto.findAll({
      where: {
        stock: { [Op.gt]: 0 }, // Solo productos con stock
      },
    });

    console.log(
      `Buscando coincidencias para ${extractedProducts.length} productos en ${allProducts.length} productos disponibles`,
    );

    for (const item of extractedProducts) {
      try {
        const words = item.normalized.split(/\s+/).filter((w) => w.length > 2);

        if (words.length === 0) continue;

        // FASE 1: Pre-filtrado rápido - productos que contengan al menos una palabra clave
        let candidateProducts = allProducts.filter((p) => {
          const productText = this.normalizeText(
            `${p.nombre} ${p.descripcion || ''} ${p.categoria || ''} ${
              p.marca || ''
            }`,
          );

          // Buscar coincidencias de palabras
          const matchCount = words.filter((word) =>
            productText.includes(word),
          ).length;

          // Requerir al menos 40% de coincidencia de palabras o 1 palabra mínimo
          return matchCount >= Math.max(1, Math.ceil(words.length * 0.4));
        });

        console.log(
          `  "${item.original}" -> ${candidateProducts.length} candidatos`,
        );

        // FASE 2: Calcular similitud detallada y ordenar
        const scoredProducts = candidateProducts
          .map((p) => {
            // Calcular similitud con nombre, descripción y marca
            const nameSimilarity = this.calculateSimilarity(
              item.normalized,
              p.nombre,
            );
            const descSimilarity = p.descripcion
              ? this.calculateSimilarity(item.normalized, p.descripcion)
              : 0;
            const marcaSimilarity = p.marca
              ? this.calculateSimilarity(item.normalized, p.marca)
              : 0;

            // Peso: nombre 70%, descripción 20%, marca 10%
            const weightedSimilarity =
              nameSimilarity * 0.7 +
              descSimilarity * 0.2 +
              marcaSimilarity * 0.1;

            return {
              product: p,
              similarity: Math.round(weightedSimilarity),
            };
          })
          .filter((sp) => sp.similarity >= minSimilarity)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5); // Top 5 resultados

        if (scoredProducts.length > 0) {
          const topSimilarity = scoredProducts[0].similarity;
          results.push({
            searchTerm: item.original,
            quantity: item.quantity,
            found: true,
            confidence:
              topSimilarity >= 75
                ? 'high'
                : topSimilarity >= 50
                  ? 'medium'
                  : 'low',
            products: scoredProducts.map((sp) => ({
              id: sp.product.idproducto,
              name: sp.product.nombre,
              description: sp.product.descripcion,
              price: parseFloat(sp.product.precioreferencial || 0),
              stock: sp.product.stock,
              image: sp.product.image,
              category: sp.product.categoria,
              marca: sp.product.marca,
              similarity: sp.similarity,
            })),
          });
          console.log(
            `    Mejor match: "${scoredProducts[0].product.nombre}" (${topSimilarity}%)`,
          );
        } else {
          results.push({
            searchTerm: item.original,
            quantity: item.quantity,
            found: false,
            confidence: 'none',
            products: [],
          });
          console.log(`    Sin coincidencias`);
        }
      } catch (error) {
        console.error(`Error buscando: ${item.original}`, error);
      }
    }

    return results;
  }

  /**
   * Genera estadísticas del procesamiento
   */
  generateStats(results) {
    const total = results.length;
    const found = results.filter((r) => r.found).length;
    const highConfidence = results.filter(
      (r) => r.confidence === 'high',
    ).length;
    const mediumConfidence = results.filter(
      (r) => r.confidence === 'medium',
    ).length;
    const lowConfidence = results.filter((r) => r.confidence === 'low').length;

    const stats = {
      total,
      found,
      notFound: total - found,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      successRate: total > 0 ? Math.round((found / total) * 100) : 0,
    };

    console.log(`\nEstadísticas de búsqueda:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Encontrados: ${stats.found} (${stats.successRate}%)`);
    console.log(`   Alta confianza: ${stats.highConfidence}`);
    console.log(`   Media confianza: ${stats.mediumConfidence}`);
    console.log(`   Baja confianza: ${stats.lowConfidence}`);
    console.log(`   No encontrados: ${stats.notFound}\n`);

    return stats;
  }
}

module.exports = new ProductMatcherService();
