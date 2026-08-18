import {
  capConfidenceByLayer,
  computeCompletion,
  computeCompletionFromItems,
  computeFinalScore,
  layerForCompletion,
  normalizeScore,
} from '../domain/service/valuacion.scoring';
import {
  ValuacionBriefField,
  VALUACION_BRIEF_FIELDS,
} from '../domain/entity/enum/valuacion.enums';
import {
  DescriptiveAnalysis,
  PhotoAnalysis,
} from '../domain/entity/valuacion.entity';

const ALL_FIELDS = VALUACION_BRIEF_FIELDS;

describe('valuacion.scoring', () => {
  describe('computeCompletionFromItems', () => {
    const item = (status: string) => ({ status });

    it('sin ítems ni imágenes da 0% y capa 1', () => {
      expect(computeCompletionFromItems([], 0)).toEqual({
        completionPercent: 0,
        layer: 1,
      });
    });

    it('checklist completo con 3 imágenes da 100% y capa 3', () => {
      const items = [
        item('cubierto'),
        item('cubierto'),
        item('cubierto'),
        item('no_aplica'),
      ];
      expect(computeCompletionFromItems(items, 3)).toEqual({
        completionPercent: 100,
        layer: 3,
      });
    });

    it('no_aplica cuenta como resuelto; omitido y pendiente no', () => {
      // 2 resueltos de 4 → 35% de brief + 30% de imágenes = 65 → capa 2.
      const items = [
        item('cubierto'),
        item('no_aplica'),
        item('omitido'),
        item('pendiente'),
      ];
      expect(computeCompletionFromItems(items, 3)).toEqual({
        completionPercent: 65,
        layer: 2,
      });
    });

    it('la completitud es proporcional al checklist propio de la valuación', () => {
      // Un brief corto (4 ítems) y uno largo (8) llegan igual al 100%: el % es
      // sobre SU checklist, no sobre una lista universal.
      const corto = Array.from({ length: 4 }, () => item('cubierto'));
      const largo = Array.from({ length: 8 }, () => item('cubierto'));
      expect(computeCompletionFromItems(corto, 0)).toEqual(
        computeCompletionFromItems(largo, 0),
      );
    });
  });

  describe('computeCompletion', () => {
    it('sin brief ni imágenes da 0% y capa 1', () => {
      expect(computeCompletion([], 0)).toEqual({
        completionPercent: 0,
        layer: 1,
      });
    });

    it('brief completo con 3 imágenes da 100% y capa 3', () => {
      expect(computeCompletion(ALL_FIELDS, 3)).toEqual({
        completionPercent: 100,
        layer: 3,
      });
    });

    it('más de 3 imágenes no suma completitud extra', () => {
      const tres = computeCompletion(ALL_FIELDS, 3);
      const diez = computeCompletion(ALL_FIELDS, 10);
      expect(diez).toEqual(tres);
    });

    it('los ejes que no aplican cuentan igual que los cubiertos', () => {
      // Zapatillas nuevas: mantenimiento, danos y antiguedad no aplican. No tener
      // esa info no puede castigar la capa igual que si el usuario no contestara.
      const cubiertos = [
        ValuacionBriefField.identificacion,
        ValuacionBriefField.estado,
        ValuacionBriefField.mercado,
        ValuacionBriefField.precioReferencia,
        ValuacionBriefField.documentacion,
      ];
      const noAplican = [
        ValuacionBriefField.mantenimiento,
        ValuacionBriefField.danos,
        ValuacionBriefField.antiguedad,
      ];

      expect(computeCompletion(cubiertos, 3, noAplican)).toEqual(
        computeCompletion(ALL_FIELDS, 3),
      );
      // Y sin descartarlos, el mismo brief quedaba una capa abajo.
      expect(computeCompletion(cubiertos, 0).layer).toBeLessThan(
        computeCompletion(cubiertos, 0, noAplican).layer,
      );
    });

    it('un eje contado en ambas listas no suma dos veces', () => {
      const conRepetido = computeCompletion(
        [ValuacionBriefField.estado],
        0,
        [ValuacionBriefField.estado],
      );
      expect(conRepetido).toEqual(computeCompletion([ValuacionBriefField.estado], 0));
    });

    it('es determinístico: la misma información da siempre el mismo resultado', () => {
      const campos = [
        ValuacionBriefField.identificacion,
        ValuacionBriefField.estado,
        ValuacionBriefField.danos,
      ];
      const primera = computeCompletion(campos, 2);
      const segunda = computeCompletion([...campos].reverse(), 2);
      expect(segunda).toEqual(primera);
    });

    it('ignora ejes duplicados', () => {
      const conDuplicados = computeCompletion(
        [
          ValuacionBriefField.estado,
          ValuacionBriefField.estado,
          ValuacionBriefField.estado,
        ],
        0,
      );
      const sinDuplicados = computeCompletion([ValuacionBriefField.estado], 0);
      expect(conDuplicados).toEqual(sinDuplicados);
    });

    it('descarta ejes que no pertenecen al brief', () => {
      const conBasura = computeCompletion(
        [ValuacionBriefField.estado, 'inventado' as ValuacionBriefField],
        0,
      );
      expect(conBasura).toEqual(computeCompletion([ValuacionBriefField.estado], 0));
    });

    it('sólo imágenes (sin brief) no alcanza la capa 3', () => {
      const resultado = computeCompletion([], 3);
      expect(resultado.completionPercent).toBe(30);
      expect(resultado.layer).toBe(1);
    });

    it('una imagen sola deja la valuación en capa 1 (AC08)', () => {
      expect(computeCompletion([], 1).layer).toBe(1);
    });
  });

  describe('layerForCompletion', () => {
    it.each([
      [0, 1],
      [33, 1],
      [34, 2],
      [66, 2],
      [67, 3],
      [100, 3],
    ])('completitud %i%% → capa %i', (percent, expected) => {
      expect(layerForCompletion(percent)).toBe(expected);
    });
  });

  describe('capConfidenceByLayer', () => {
    it('acota la confianza inflada de la IA al techo de la capa 1', () => {
      expect(capConfidenceByLayer(95, 1)).toBe(45);
    });

    it('respeta la confianza si está por debajo del techo', () => {
      expect(capConfidenceByLayer(30, 2)).toBe(30);
    });

    it('en capa 3 permite hasta 100', () => {
      expect(capConfidenceByLayer(100, 3)).toBe(100);
    });

    it('trata la confianza ausente como 0', () => {
      expect(capConfidenceByLayer(undefined, 3)).toBe(0);
    });
  });

  describe('computeFinalScore', () => {
    const photo: PhotoAnalysis = {
      description: '',
      brand: null,
      model: null,
      condition: '',
      components: [],
      damages: [],
      scores: { estado: 4, marca: 5, mercado: 4, rareza: 3 },
      confidence: 80,
    };

    const descriptive: DescriptiveAnalysis = {
      summary: '',
      scores: { uso: 4, vidaUtil: 4, mantenimiento: 5, documentacion: 3 },
      confidence: 70,
    };

    it('promedia los 8 ejes del círculo de valoración', () => {
      // (4+5+4+3+4+4+5+3) / 8 = 4
      expect(computeFinalScore(photo, descriptive)).toBe(4);
    });

    it('sin fotos promedia sólo los ejes descriptivos', () => {
      // (4+4+5+3) / 4 = 4
      expect(computeFinalScore(null, descriptive)).toBe(4);
    });

    it('devuelve null si no hay ningún análisis', () => {
      expect(computeFinalScore(null, null)).toBeNull();
    });

    it('descarta scores fuera del rango 1-5', () => {
      const corrupto: DescriptiveAnalysis = {
        ...descriptive,
        scores: { uso: 4, vidaUtil: 99, mantenimiento: 0, documentacion: 4 },
      };
      // Sólo sobreviven 4 y 4.
      expect(computeFinalScore(null, corrupto)).toBe(4);
    });
  });

  describe('normalizeScore', () => {
    it.each([
      [7, 5],
      [0, 1],
      [-3, 1],
      [3.4, 3],
      [3.6, 4],
    ])('normaliza %s a %s', (input, expected) => {
      expect(normalizeScore(input)).toBe(expected);
    });

    it('devuelve null para valores no numéricos', () => {
      expect(normalizeScore('alto')).toBeNull();
      expect(normalizeScore(undefined)).toBeNull();
      expect(normalizeScore(null)).toBeNull();
    });
  });
});
