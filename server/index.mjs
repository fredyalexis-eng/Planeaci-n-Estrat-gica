/**
 * ANI STRATEGY LAB — Servidor Web y API del Agente Estratégico Institucional
 *
 * Sirve la aplicación interactiva y expone los endpoints seguros `/api/agent/*`
 * con motor documental BM25/RAG, auditoría reglada R1–R6 y adaptador oficial
 * para Arena API (https://api.arena.ai) mediante variables de entorno.
 */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KnowledgeEngine } from './knowledge-engine.mjs';
import { ArenaAdapter, ArenaApiError, loadDotEnvIfPresent } from './arena-adapter.mjs';
import { AGENT_MODES, buildSystemPrompt, buildContextPrompt, parseAndVerifyAgentOutput } from './prompts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf'
};

const VIDEO_EXTS = new Set(['.mp4', '.m4v', '.webm', '.ogv', '.ogg', '.mov']);
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

const ALLOWED_ROOT_FILES = new Set([
  'index.html',
  '01_Marco_Estrategico_ANI_2027-2030.md',
  '02_Plantilla_Ejercicio_PEI_2027-2030.csv',
  '03_Canvas_2_Focos_ANI.html',
  '04_App_Interactiva_ANI.md'
]);

const ALLOWED_DIR_PREFIXES = ['assets/', 'data/'];

function isPublicPathAllowed(relPosix) {
  if (!relPosix || relPosix.includes('..') || relPosix.startsWith('.')) return false;
  const segments = relPosix.split('/');
  if (segments.some((s) => !s || s.startsWith('.'))) return false;
  if (ALLOWED_ROOT_FILES.has(relPosix)) return true;
  return ALLOWED_DIR_PREFIXES.some((prefix) => relPosix.startsWith(prefix));
}

function readJsonBody(req, maxBytes = 524288) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(Object.assign(new Error('Cuerpo de solicitud excede el límite permitido (512 KB).'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (total === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('JSON inválido en la solicitud.'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

export async function createAppServer({
  repoRoot = DEFAULT_REPO_ROOT,
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const knowledge = new KnowledgeEngine(repoRoot);
  await knowledge.loadRepositoryKnowledge();

  const arena = new ArenaAdapter(env, fetchImpl);
  const rateBuckets = new Map();
  const maxRpm = Math.max(parseInt(env.RATE_LIMIT_RPM || '30', 10) || 30, 5);
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  function applyCorsAndSecurity(req, res, isApi = false) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    const origin = req.headers.origin;
    if (isApi && origin) {
      const host = req.headers.host || '';
      const sameHost = origin === `https://${host}` || origin === `http://${host}`;
      const isPreview = /^https:\/\/[a-z0-9-]+\.e2b\.app$/i.test(origin);
      const isAllowed = sameHost || isPreview || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*');
      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      }
    }
  }

  function sendJson(res, status, data) {
    const payload = JSON.stringify(data);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(payload);
  }

  function checkRateLimit(req) {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local')
      .toString()
      .split(',')[0]
      .trim();
    const now = Date.now();
    const windowMs = 60_000;
    const entry = rateBuckets.get(ip) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    rateBuckets.set(ip, entry);
    if (entry.count > maxRpm) {
      return Math.ceil((entry.resetAt - now) / 1000);
    }
    return 0;
  }

  function ensureAnchorChunks(mode, hits, allMap) {
    const anchorByMode = {
      consulta: ['MARCO-S1'],
      analisis: ['MARCO-S2.1', 'MARCO-S2.2', 'MARCO-S5.4'],
      pnd_ani: ['MARCO-S1', 'MARCO-S2.1', 'MARCO-S2.2', 'MARCO-S4'],
      oportunidades: ['MARCO-S2.1', 'MARCO-S2.2', 'MARCO-S4'],
      recomendaciones: ['MARCO-S4', 'MARCO-S4-RIESGOS', 'MARCO-S3.7'],
      propuesta_pei: ['MARCO-S2.1', 'MARCO-S4', 'MARCO-S5.1', 'PLANTILLA-PEI-CSV'],
      propuesta_pa: ['MARCO-S3.6', 'MARCO-S3.7', 'MARCO-S4', 'SESION-CARTERA-PEI'],
      auditoria: ['MARCO-S4', 'MARCO-S5.1', 'MARCO-S5.4', 'SESION-CARTERA-PEI']
    };
    const result = [...hits];
    const seen = new Set(result.map((c) => c.id));
    for (const id of anchorByMode[mode] || []) {
      if (!seen.has(id) && allMap.has(id) && result.length < 10) {
        result.push({ ...allMap.get(id), score: 0.1 });
        seen.add(id);
      }
    }
    return result;
  }

  const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;
    const isApi = pathname.startsWith('/api/');
    applyCorsAndSecurity(req, res, isApi);

    if (req.method === 'OPTIONS' && isApi) {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // --- API DEL AGENTE ESTRATÉGICO ---
      if (pathname === '/api/agent/status' && req.method === 'GET') {
        return sendJson(res, 200, {
          ok: true,
          service: 'ANI STRATEGY LAB — Strategic Agent Backend',
          version: '1.0.0',
          backendOnline: true,
          arena: arena.getPublicStatus(),
          knowledge: knowledge.getSummary(),
          modes: Object.entries(AGENT_MODES).map(([id, m]) => ({ id, label: m.label }))
        });
      }

      if (pathname === '/api/agent/verify' && req.method === 'POST') {
        const wait = checkRateLimit(req);
        if (wait) return sendJson(res, 429, { ok: false, message: `Demasiadas solicitudes. Reintente en ${wait}s.` });
        const verification = await arena.verifyConnection();
        return sendJson(res, 200, {
          ok: verification.ok,
          checkedAt: new Date().toISOString(),
          arena: arena.getPublicStatus(),
          verification
        });
      }

      if (pathname === '/api/media' && req.method === 'GET') {
        const mediaDir = path.join(repoRoot, 'assets', 'media');
        const files = [];
        try {
          const entries = await fs.readdir(mediaDir, { withFileTypes: true });
          for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            if (!entry.isFile() || entry.name.startsWith('.')) continue;
            const ext = path.extname(entry.name).toLowerCase();
            const isVideo = VIDEO_EXTS.has(ext);
            const isImage = IMAGE_EXTS.has(ext);
            if (!isVideo && !isImage) continue;
            const st = await fs.stat(path.join(mediaDir, entry.name));
            files.push({
              filename: entry.name,
              title: path.basename(entry.name, ext).replace(/[_-]+/g, ' '),
              tipo: isVideo ? 'video' : 'imagen',
              ext,
              mime: MIME_TYPES[ext] || 'application/octet-stream',
              sizeBytes: st.size,
              updatedAt: st.mtime.toISOString(),
              url: `./assets/media/${encodeURIComponent(entry.name)}`
            });
          }
        } catch { /* assets/media ausente o vacía */ }
        return sendJson(res, 200, {
          ok: true,
          directory: 'assets/media',
          total: files.length,
          videos: files.filter((f) => f.tipo === 'video'),
          images: files.filter((f) => f.tipo === 'imagen'),
          files
        });
      }

      if (pathname === '/api/agent/knowledge' && req.method === 'GET') {
        const chunkId = reqUrl.searchParams.get('id');
        if (chunkId) {
          const found = knowledge.repoChunks.find((c) => c.id === chunkId);
          if (!found) return sendJson(res, 404, { ok: false, message: `Fuente [${chunkId}] no encontrada.` });
          return sendJson(res, 200, { ok: true, chunk: found });
        }
        return sendJson(res, 200, { ok: true, ...knowledge.getSummary() });
      }

      if (pathname === '/api/agent/citation' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const chunkId = String(body?.id || '').trim();
        const allMap = knowledge.getAllChunksMap(body?.workspace || null);
        const found = allMap.get(chunkId);
        if (!found) return sendJson(res, 404, { ok: false, message: `Fuente [${chunkId}] no encontrada.` });
        return sendJson(res, 200, { ok: true, chunk: found });
      }

      if (pathname === '/api/agent/knowledge/reload' && req.method === 'POST') {
        const summary = await knowledge.loadRepositoryKnowledge();
        return sendJson(res, 200, { ok: true, message: 'Acervo documental reindexado.', ...summary });
      }

      if (pathname === '/api/agent/search' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const query = String(body?.query || '').trim().slice(0, 500);
        const filterTag = String(body?.filterTag || '').trim().slice(0, 60);
        const topK = Math.min(Math.max(parseInt(body?.topK || '8', 10) || 8, 1), 20);
        const results = knowledge.search(query, {
          workspace: body?.workspace || null,
          topK,
          filterTag
        });
        return sendJson(res, 200, {
          ok: true,
          query,
          count: results.length,
          results: results.map((r) => ({
            id: r.id,
            score: r.score,
            docTitle: r.docTitle,
            section: r.section,
            sourceFile: r.sourceFile,
            lineRange: r.lineRange,
            authorityStatus: r.authorityStatus,
            tags: r.tags,
            content: r.content
          }))
        });
      }

      if (pathname === '/api/agent/audit' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const report = knowledge.auditWorkspace(body?.workspace || {});
        return sendJson(res, 200, { ok: true, ...report });
      }

      if (pathname === '/api/agent/chat' && req.method === 'POST') {
        const wait = checkRateLimit(req);
        if (wait) {
          res.setHeader('Retry-After', String(wait));
          return sendJson(res, 429, { ok: false, message: `Límite de consultas excedido. Reintente en ${wait}s.` });
        }

        const body = await readJsonBody(req);
        const question = String(body?.message || '').trim().slice(0, 4000);
        if (!question) {
          return sendJson(res, 400, { ok: false, message: 'Debe enviar una consulta en el campo "message".' });
        }
        const mode = AGENT_MODES[body?.mode] ? body.mode : 'consulta';
        const workspace = body?.workspace && typeof body.workspace === 'object' ? body.workspace : null;
        const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];
        const modelOverride = String(body?.model || '').trim().slice(0, 120);

        // 1. Recuperación documental verificable (RAG BM25 + anclas metodológicas)
        const allMap = knowledge.getAllChunksMap(workspace);
        const rawHits = knowledge.search(question, { workspace, topK: 7 });
        const retrieved = ensureAnchorChunks(mode, rawHits, allMap);

        // 2. Auditoría reglada de respaldo cuando aplica
        const needsAudit = ['analisis', 'propuesta_pei', 'propuesta_pa', 'auditoria', 'pnd_ani'].includes(mode);
        const auditReport = needsAudit && workspace ? knowledge.auditWorkspace(workspace) : null;

        const publicArena = arena.getPublicStatus();

        // 3. Si ARENA_API_KEY no está configurada: transparencia absoluta + evidencia documental real (sin simular LLM)
        if (!publicArena.keyConfigured || publicArena.status !== 'configured_ready') {
          return sendJson(res, 200, {
            ok: true,
            generationMode: 'retrieval_only_awaiting_key',
            mode,
            modeLabel: AGENT_MODES[mode].label,
            statusNotice: 'El adaptador oficial de Arena API está preparado en el servidor, pero aún no tiene una clave ARENA_API_KEY configurada. No se simula ninguna respuesta generativa ni se usa otro proveedor sin su autorización. A continuación se entregan los pasajes exactos recuperados del acervo documental indexado y la verificación reglada de trazabilidad.',
            answer: null,
            verifiedCitations: (rawHits.length ? rawHits : retrieved).slice(0, 6).map((c) => ({
              id: c.id,
              score: c.score ?? 0,
              docTitle: c.docTitle,
              section: c.section,
              sourceFile: c.sourceFile,
              lineRange: c.lineRange,
              authorityStatus: c.authorityStatus,
              excerpt: c.content
            })),
            auditReport,
            proposals: { peiProjects: [], actionItems: [], opportunities: [] },
            arenaStatus: publicArena
          });
        }

        // 4. Invocación real a Arena API con contexto documental trazable
        const systemPrompt = buildSystemPrompt(mode);
        const contextualizedUser = buildContextPrompt(question, retrieved, auditReport);
        const messages = [
          ...history
            .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
            .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
          { role: 'user', content: contextualizedUser }
        ];

        try {
          const completion = await arena.chatCompletion({
            systemPrompt,
            messages,
            modelOverride
          });

          const parsed = parseAndVerifyAgentOutput(completion.content, allMap);

          // Si el modelo no incluyó etiquetas explícitas, adjuntar fuentes recuperadas como contexto consultado
          const consultedSources = retrieved.slice(0, 6).map((c) => ({
            id: c.id,
            docTitle: c.docTitle,
            section: c.section,
            sourceFile: c.sourceFile,
            lineRange: c.lineRange,
            authorityStatus: c.authorityStatus,
            excerpt: c.content.slice(0, 420) + (c.content.length > 420 ? '…' : '')
          }));

          return sendJson(res, 200, {
            ok: true,
            generationMode: 'arena_api_live',
            mode,
            modeLabel: AGENT_MODES[mode].label,
            governanceBadge: 'Respuesta asistida por IA (Arena API) — Verificar citas · Las propuestas NO son decisiones aprobadas por la ANI',
            answer: parsed.answer,
            verifiedCitations: parsed.verifiedCitations,
            consultedSources,
            unverifiedCitationTags: parsed.unverifiedCitationTags,
            proposals: parsed.proposals,
            auditReport,
            arenaMeta: {
              provider: 'arena',
              format: completion.format,
              requestedModel: completion.requestedModel,
              reportedModel: completion.reportedModel,
              routingMode: completion.routingMode,
              traceId: completion.traceId,
              usedCodingRouterFallback: completion.usedCodingRouterFallback,
              usage: completion.usage
            }
          });
        } catch (err) {
          const isArena = err instanceof ArenaApiError;
          return sendJson(res, 200, {
            ok: false,
            generationMode: 'arena_api_error_with_evidence',
            mode,
            modeLabel: AGENT_MODES[mode].label,
            error: {
              httpStatus: isArena ? err.httpStatus : 502,
              code: isArena ? err.code : 'unexpected_error',
              traceId: isArena ? err.traceId : null,
              billingUrl: isArena ? err.billingUrl : null,
              retryAfter: isArena ? err.retryAfter : null,
              message: err.message,
              userGuidance: isArena ? err.userGuidance : 'Revise la configuración de Arena API en el servidor.'
            },
            verifiedCitations: rawHits.slice(0, 5).map((c) => ({
              id: c.id,
              score: c.score,
              docTitle: c.docTitle,
              section: c.section,
              sourceFile: c.sourceFile,
              lineRange: c.lineRange,
              authorityStatus: c.authorityStatus,
              excerpt: c.content
            })),
            auditReport
          });
        }
      }

      if (isApi) {
        return sendJson(res, 404, { ok: false, message: 'Ruta API no encontrada.' });
      }

      // --- ARCHIVOS ESTÁTICOS PÚBLICOS (lista blanca estricta) ---
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Método no permitido');
        return;
      }

      let decoded;
      try {
        decoded = decodeURIComponent(pathname);
      } catch {
        res.writeHead(400);
        res.end('URL inválida');
        return;
      }

      const relPosix = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
      if (!isPublicPathAllowed(relPosix)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Recurso no encontrado');
        return;
      }

      const fullPath = path.resolve(repoRoot, relPosix);
      if (!fullPath.startsWith(repoRoot + path.sep)) {
        res.writeHead(403);
        res.end('Acceso denegado');
        return;
      }

      try {
        const stat = await fs.stat(fullPath);
        if (!stat.isFile()) {
          res.writeHead(404);
          res.end('No encontrado');
          return;
        }
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const totalSize = stat.size;
        const rangeHeader = req.headers.range;

        // Soporte HTTP 206 Partial Content para streaming y adelanto fluido de videos institucionales
        if (rangeHeader && (VIDEO_EXTS.has(ext) || ext === '.mp3' || ext === '.pdf')) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
          if (!match) {
            res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
            res.end();
            return;
          }
          const start = match[1] ? parseInt(match[1], 10) : 0;
          const end = match[2] ? Math.min(parseInt(match[2], 10), totalSize - 1) : totalSize - 1;
          if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= totalSize) {
            res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
            res.end();
            return;
          }
          res.writeHead(206, {
            'Content-Type': contentType,
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Cache-Control': 'public, max-age=300'
          });
          if (req.method === 'HEAD') {
            res.end();
          } else {
            createReadStream(fullPath, { start, end }).pipe(res);
          }
          return;
        }

        const baseHeaders = {
          'Content-Type': contentType,
          'Content-Length': totalSize,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300'
        };
        if (VIDEO_EXTS.has(ext) || ext === '.mp3') {
          baseHeaders['Accept-Ranges'] = 'bytes';
        }
        res.writeHead(200, baseHeaders);
        if (req.method === 'HEAD') {
          res.end();
        } else if (VIDEO_EXTS.has(ext) || totalSize > 1024 * 1024) {
          createReadStream(fullPath).pipe(res);
        } else {
          const data = await fs.readFile(fullPath);
          res.end(data);
        }
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Archivo no encontrado');
      }
    } catch (err) {
      const code = err?.statusCode || 500;
      return sendJson(res, code, { ok: false, message: err?.message || 'Error interno del servidor.' });
    }
  });

  return { server, knowledge, arena };
}

// Ejecución directa (`npm start`)
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  loadDotEnvIfPresent(DEFAULT_REPO_ROOT);
  const port = parseInt(process.env.PORT || '3000', 10) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  const { server, knowledge, arena } = await createAppServer({ repoRoot: DEFAULT_REPO_ROOT });
  const status = arena.getPublicStatus();
  const kb = knowledge.getSummary();

  server.listen(port, host, () => {
    console.log(`[ANI STRATEGY LAB] Servidor activo en http://${host}:${port}`);
    console.log(`[ANI STRATEGY LAB] Acervo indexado: ${kb.totalRepoChunks} fragmentos en ${kb.totalRepoFiles} archivos base`);
    console.log(`[ANI STRATEGY LAB] Agente IA (${status.providerLabel}): ${status.status} | Endpoint: ${status.completionsEndpoint}`);
  });
}
