/**
 * Prueba en vivo del servicio de IA de valuación (sin server ni auth).
 *
 * Simula dos briefs completos contra la API real de OpenAI:
 *   1. Zapatillas nuevas  → NO debe preguntar mantenimiento/daños/uso.
 *   2. Servicio de tortas → NO debe preguntar vida útil/daños; ejes contextuales.
 *
 * Uso:  npx cross-env NODE_ENV=qa ts-node -r tsconfig-paths/register scripts/test-valuacion-ai.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.qa') });

import { ValuacionAIService } from '../src/contexts/module_user/valuacion/domain/service/valuacion.ai.service';
import { ValuacionCategory } from '../src/contexts/module_user/valuacion/domain/entity/enum/valuacion.enums';
import {
  ValuacionBriefItem,
  ValuacionBriefMessage,
} from '../src/contexts/module_user/valuacion/domain/entity/valuacion.entity';

const fakeConfig = {
  get: (key: string) => process.env[key],
} as any;

async function runConversation(
  service: ValuacionAIService,
  category: ValuacionCategory,
  userTurns: string[],
) {
  const history: ValuacionBriefMessage[] = [];
  let briefItems: ValuacionBriefItem[] = [];
  let title: string | null = null;

  for (const userMessage of userTurns) {
    const started = Date.now();
    const turn = await service.runBriefTurn({
      category,
      title,
      briefItems,
      history,
      userMessage,
      imageUrls: [],
    });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    history.push({ role: 'user', content: userMessage, timestamp: new Date() });
    history.push({ role: 'assistant', content: turn.reply, timestamp: new Date() });
    briefItems = turn.briefItems.length ? turn.briefItems : briefItems;
    title = turn.title ?? title;

    console.log(`\n👤 ${userMessage}`);
    console.log(`🤖 (${seconds}s) ${turn.reply}`);
    console.log(`   título: ${title ?? '—'}`);
    console.log(
      `   checklist: ${briefItems
        .map((item) => `${item.label}[${item.status}]`)
        .join(' · ')}`,
    );
    console.log(
      `   briefComplete: ${turn.briefComplete} · tokens: ${turn.usage?.totalTokens ?? '?'} · modelo: ${turn.model}`,
    );
  }

  console.log('\n⏳ Generando informe final...');
  const started = Date.now();
  const result = await service.generateResult({
    category,
    title,
    history,
    imageUrls: [],
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  console.log(`📊 Informe (${seconds}s, modelo ${result.model}):`);
  console.log(`   valores: ${JSON.stringify(result.estimatedValues)}`);
  console.log(`   justificación: ${result.pricingRationale}`);
  console.log(
    `   ejes descriptivos: ${JSON.stringify(result.descriptiveAnalysis?.axisLabels)} scores=${JSON.stringify(result.descriptiveAnalysis?.scores)}`,
  );
  console.log(`   confianza IA: ${result.confidencePercent}%`);
  console.log(`   resumen: ${result.descriptiveAnalysis?.summary}`);
  console.log(`   photoAnalysis (debe ser null sin fotos): ${result.photoAnalysis === null ? 'null ✓' : 'NO NULL ✗'}`);
}

async function main() {
  const service = new ValuacionAIService(fakeConfig);

  console.log('════════════════════════════════════════════════');
  console.log('CASO 1 · Zapatillas nuevas (objeto)');
  console.log('════════════════════════════════════════════════');
  await runConversation(service, ValuacionCategory.objeto, [
    'Quiero valuar unas zapatillas Nike de lanzamiento de jabalina, modelo Zoom Javelin Elite 4',
    'Son nuevas, sin uso, las compré hace dos semanas',
    'Talle 42, colorway blanco y dorado. Tengo la factura de compra',
    'Las pagué 180 dólares en el exterior',
  ]);

  console.log('\n════════════════════════════════════════════════');
  console.log('CASO 2 · Servicio de venta de tortas (servicio)');
  console.log('════════════════════════════════════════════════');
  await runConversation(service, ValuacionCategory.servicio, [
    'Quiero valuar mi servicio de venta de tortas artesanales',
    'Hace 5 años que lo tengo, vendo unas 20 tortas por mes',
    'Trabajo por encargo con clientela fija de mi barrio, precios entre 15 y 40 mil pesos por torta',
    'Listo, generá el resultado',
  ]);
}

main().catch((error) => {
  console.error('💥 Falló la prueba:', error);
  process.exit(1);
});
