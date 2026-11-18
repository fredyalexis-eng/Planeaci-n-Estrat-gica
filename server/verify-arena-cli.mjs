#!/usr/bin/env node
/**
 * ANI STRATEGY LAB — Verificador CLI de conexión con Arena API
 * Uso: npm run verify:arena
 * Lee `.env` sin exponer jamás la clave y consulta GET https://api.arena.ai/v1/models
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ArenaAdapter, loadDotEnvIfPresent } from './arena-adapter.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadDotEnvIfPresent(repoRoot);

const adapter = new ArenaAdapter(process.env);
const pub = adapter.getPublicStatus();

console.log('=== ANI STRATEGY LAB · Verificación de Arena API ===');
console.log(`Proveedor:          ${pub.providerLabel}`);
console.log(`Formato:            ${pub.format}`);
console.log(`Endpoint modelos:   ${pub.modelsEndpoint}`);
console.log(`Endpoint inferencia:${pub.completionsEndpoint}`);
console.log(`Clave configurada:  ${pub.keyConfigured ? 'SÍ (oculta)' : 'NO'}`);
console.log(`Modelo configurado: ${pub.configuredModel || '(sin definir)'}`);
console.log('');

const result = await adapter.verifyConnection();
console.log(`Estado:             ${result.status}`);
if (result.traceId) console.log(`X-Arena-Trace-ID:   ${result.traceId}`);

if (result.ok) {
  console.log(`Modelos habilitados (${result.modelsCount}):`);
  result.models.forEach((m) => console.log(`  - ${m}`));
  console.log(`\nRecomendación: ${result.recommendedAction}`);
  process.exit(0);
} else {
  console.log(`Detalle:            ${result.message}`);
  if (result.userGuidance) console.log(`Acción requerida:   ${result.userGuidance}`);
  if (result.billingUrl) console.log(`Facturación Arena:  ${result.billingUrl}`);
  console.log('\nPasos de activación:');
  pub.activationSteps.forEach((s) => console.log(`  ${s}`));
  process.exit(1);
}
