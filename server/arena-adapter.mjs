/**
 * ANI STRATEGY LAB — Adaptador Oficial para Arena API (https://api.arena.ai)
 *
 * Implementa estrictamente los endpoints, encabezados y códigos de estado
 * documentados en:
 *   - https://platform.arena.ai/docs/api
 *   - https://platform.arena.ai/docs/errors
 *
 * Seguridad:
 *   - Las credenciales se leen únicamente de variables de entorno en servidor.
 *   - Jamás se exponen claves en respuestas HTTP, logs ni código cliente.
 *   - No activa ni simula proveedores alternativos sin autorización expresa.
 */
import fs from 'node:fs';
import path from 'node:path';

export function loadDotEnvIfPresent(repoRoot) {
  const envPath = path.join(repoRoot, '.env');
  if (!fs.existsSync(envPath)) return false;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
  return true;
}

export class ArenaApiError extends Error {
  constructor(message, { httpStatus = 500, code = 'arena_error', traceId = null, billingUrl = null, retryAfter = null, userGuidance = '' } = {}) {
    super(message);
    this.name = 'ArenaApiError';
    this.httpStatus = httpStatus;
    this.code = code;
    this.traceId = traceId;
    this.billingUrl = billingUrl;
    this.retryAfter = retryAfter;
    this.userGuidance = userGuidance;
  }
}

function mapArenaError(httpStatus, body, headers) {
  const traceId = headers?.get?.('x-arena-trace-id') || body?.error?.trace_id || body?.request_id || null;
  const retryAfterHeader = headers?.get?.('retry-after');
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) || retryAfterHeader : null;
  const code = body?.error?.code || body?.error?.type || `http_${httpStatus}`;
  const rawMessage = body?.error?.message || `Respuesta HTTP ${httpStatus} de Arena API`;
  const billingUrl = body?.error?.billing_url || null;

  let userGuidance = '';
  if (httpStatus === 401) {
    userGuidance = 'La clave ARENA_API_KEY es inválida, fue revocada o tiene formato incorrecto. Genere una clave activa en https://platform.arena.ai/dashboard/keys y actualice su variable de entorno.';
  } else if (httpStatus === 402) {
    if (code === 'paid_credits_required') {
      userGuidance = 'Su workspace solo dispone de crédito promocional para Arena Router; invocar modelos directos requiere saldo prepago en USD o crédito promocional "all models" en https://platform.arena.ai/dashboard.';
    } else {
      userGuidance = 'Saldo insuficiente en su workspace de Arena API. Recargue fondos en su panel de https://platform.arena.ai/dashboard antes de reintentar.';
    }
  } else if (httpStatus === 403) {
    if (code === 'organization_client_restricted') {
      userGuidance = 'Su workspace de Arena API está restringido exclusivamente a clientes de código aprobados (p. ej. Claude Code interactivo) y no permite llamadas directas desde aplicaciones externas. Solicite habilitar acceso "API client access" en su workspace de platform.arena.ai.';
    } else if (code === 'organization_model_restricted') {
      userGuidance = 'El modelo configurado en ARENA_MODEL no está habilitado para su workspace. Consulte los modelos autorizados en https://platform.arena.ai/dashboard/models o ejecute la verificación de conexión.';
    } else {
      userGuidance = 'Acceso denegado para su organización/workspace en Arena API. Revise los permisos en https://platform.arena.ai/dashboard.';
    }
  } else if (httpStatus === 422) {
    if (code === 'model_not_allowed') {
      userGuidance = 'El modelo indicado no está permitido para esta clave ARENA_API_KEY. Seleccione un modelo habilitado en GET /v1/models.';
    } else if (code === 'billing_unbounded_request') {
      userGuidance = 'Arena API exige un límite explícito de tokens de salida (ARENA_MAX_OUTPUT_TOKENS).';
    } else {
      userGuidance = 'Solicitud rechazada por validación de modelo o presupuesto en Arena API.';
    }
  } else if (httpStatus === 429) {
    const dim = headers?.get?.('x-arena-rate-limit-dimension') || 'general';
    userGuidance = `Límite de tasa alcanzado en Arena API (dimensión: ${dim}). No se generó cobro. Espere ${retryAfter || 'unos'} segundos antes de reintentar.`;
  } else if ([500, 502, 503, 504].includes(httpStatus)) {
    userGuidance = 'El proveedor subyacente del modelo o el gateway de Arena API presentó indisponibilidad temporal. Arena API no hace fallback automático; reintente en unos segundos o configure otro modelo habilitado.';
  } else {
    userGuidance = 'Revise los parámetros ARENA_BASE_URL, ARENA_API_FORMAT y ARENA_MODEL conforme a https://platform.arena.ai/docs/api.';
  }

  return new ArenaApiError(rawMessage, {
    httpStatus,
    code,
    traceId,
    billingUrl,
    retryAfter,
    userGuidance
  });
}

export class ArenaAdapter {
  constructor(env = process.env, fetchImpl = globalThis.fetch) {
    this.env = env;
    this.fetchImpl = fetchImpl;
  }

  getConfig() {
    const provider = (this.env.AI_PROVIDER || 'arena').trim().toLowerCase();
    const apiKey = (this.env.ARENA_API_KEY || '').trim();
    const format = (this.env.ARENA_API_FORMAT || 'openai').trim().toLowerCase() === 'anthropic'
      ? 'anthropic'
      : 'openai';
    const defaultBase = format === 'anthropic' ? 'https://api.arena.ai' : 'https://api.arena.ai/v1';
    const rawBase = (this.env.ARENA_BASE_URL || defaultBase).trim().replace(/\/+$/, '');
    let baseUrl = defaultBase;
    try {
      const parsedBase = new URL(rawBase);
      if (parsedBase.protocol === 'https:' && (parsedBase.hostname === 'api.arena.ai' || parsedBase.hostname.endsWith('.arena.ai'))) {
        baseUrl = rawBase;
      }
    } catch { /* usar endpoint oficial por defecto */ }
    const model = (this.env.ARENA_MODEL || '').trim();
    const maxOutputTokens = Math.min(Math.max(parseInt(this.env.ARENA_MAX_OUTPUT_TOKENS || '2048', 10) || 2048, 256), 8192);
    const timeoutMs = Math.min(Math.max(parseInt(this.env.ARENA_TIMEOUT_MS || '45000', 10) || 45000, 5000), 120000);
    const temperature = Math.min(Math.max(parseFloat(this.env.ARENA_TEMPERATURE ?? '0.2') || 0.2, 0), 1);

    // Normalizar URL raíz del gateway para GET /v1/models y POST /v1/messages
    const gatewayRoot = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl;
    const openAiBase = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

    return {
      provider,
      apiKey,
      hasApiKey: apiKey.length > 0,
      format,
      baseUrl,
      gatewayRoot,
      openAiBase,
      model,
      maxOutputTokens,
      timeoutMs,
      temperature
    };
  }

  /**
   * Estado público seguro (SIN exponer jamás la clave)
   */
  getPublicStatus() {
    const cfg = this.getConfig();
    const warnings = [];

    if (cfg.provider !== 'arena') {
      warnings.push(
        `AI_PROVIDER está configurado como "${cfg.provider}". Por regla del proyecto no se ha activado ningún proveedor distinto de Arena sin autorización expresa.`
      );
    }
    if (!cfg.hasApiKey) {
      warnings.push(
        'Variable ARENA_API_KEY no configurada en el servidor. El motor de búsqueda documental (BM25) y el auditor PEI están activos; la generación en vivo con Arena API se habilitará en cuanto configure su clave.'
      );
    }
    if (cfg.model === 'coding-router-preview') {
      warnings.push(
        'Nota oficial de Arena (platform.arena.ai/docs/api): "coding-router-preview" está calibrado para herramientas de código (Claude Code, Codex, OpenCode). Para análisis estratégico institucional se recomienda configurar en ARENA_MODEL un modelo directo habilitado en su workspace.'
      );
    }

    return {
      provider: 'arena',
      providerLabel: 'Arena API (Developer Preview)',
      status: cfg.provider !== 'arena'
        ? 'provider_not_authorized'
        : cfg.hasApiKey
          ? 'configured_ready'
          : 'awaiting_api_key',
      keyConfigured: cfg.hasApiKey,
      format: cfg.format,
      endpointBase: cfg.format === 'anthropic' ? cfg.gatewayRoot : cfg.openAiBase,
      modelsEndpoint: `${cfg.gatewayRoot}/v1/models`,
      completionsEndpoint: cfg.format === 'anthropic'
        ? `${cfg.gatewayRoot}/v1/messages`
        : `${cfg.openAiBase}/chat/completions`,
      configuredModel: cfg.model || null,
      maxOutputTokens: cfg.maxOutputTokens,
      docsUrl: 'https://platform.arena.ai/docs/api',
      keysDashboardUrl: 'https://platform.arena.ai/dashboard/keys',
      modelsDashboardUrl: 'https://platform.arena.ai/dashboard/models',
      warnings,
      activationSteps: [
        '1. Ingrese a https://platform.arena.ai con su cuenta de Arena y verifique si cuenta con acceso activo al Developer Preview (actualmente por invitación / lista de espera).',
        '2. En https://platform.arena.ai/dashboard/keys cree una clave secreta de API y cópiela (solo se muestra una vez).',
        '3. En https://platform.arena.ai/dashboard/models revise los modelos directos habilitados para su workspace y verifique contar con saldo prepago o promocional ("all models"). Confirme que su workspace permita "API client access" y no esté restringido solo a Claude Code.',
        '4. Defina ARENA_API_KEY y ARENA_MODEL en el archivo .env del servidor (o en las variables secretas de su entorno de despliegue) — nunca en el repositorio.',
        '5. Ejecute `npm run verify:arena` o pulse "Verificar conexión Arena API" en el módulo Agente Estratégico. Nota de gobernanza: según platform.arena.ai/terms (§2.2 y §6.3), no envíe información clasificada o reservada al servicio en fase Preview.'
      ]
    };
  }

  /**
   * Verifica en tiempo real la clave y lista los modelos habilitados vía GET /v1/models
   */
  async verifyConnection() {
    const cfg = this.getConfig();
    if (cfg.provider !== 'arena') {
      return {
        ok: false,
        status: 'provider_not_authorized',
        message: 'Solo el adaptador oficial de Arena API está autorizado actualmente.'
      };
    }
    if (!cfg.hasApiKey) {
      return {
        ok: false,
        status: 'awaiting_api_key',
        message: 'No se encontró ARENA_API_KEY en las variables de entorno del servidor.',
        userGuidance: 'Configure ARENA_API_KEY en el archivo .env del servidor (basado en .env.example) y vuelva a verificar.'
      };
    }

    const url = `${cfg.gatewayRoot}/v1/models`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(cfg.timeoutMs, 15000));

    try {
      const res = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          Accept: 'application/json'
        },
        signal: controller.signal
      });

      const traceId = res.headers.get('x-arena-trace-id') || null;
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw mapArenaError(res.status, body, res.headers);
      }

      const rawModels = Array.isArray(body?.data) ? body.data : Array.isArray(body?.models) ? body.models : [];
      const modelIds = rawModels.map((m) => (typeof m === 'string' ? m : m?.id)).filter(Boolean);
      const directModels = modelIds.filter((id) => !id.includes('coding-router'));
      const configuredAvailable = cfg.model ? modelIds.includes(cfg.model) : null;

      return {
        ok: true,
        status: 'connected',
        traceId,
        modelsCount: modelIds.length,
        models: modelIds,
        directModels,
        hasOnlyCodingRouter: modelIds.length > 0 && directModels.length === 0,
        configuredModel: cfg.model || null,
        configuredModelAvailable: configuredAvailable,
        recommendedAction: !cfg.model && directModels.length > 0
          ? `Configure ARENA_MODEL=${directModels[0]} (u otro de la lista) para consultas estratégicas.`
          : directModels.length === 0
            ? 'Su clave actualmente expone solo coding-router-preview. Para usar modelos directos en análisis estratégico, habilite fondos prepago o "all models" en platform.arena.ai/dashboard.'
            : 'Conexión verificada correctamente con Arena API.'
      };
    } catch (err) {
      if (err instanceof ArenaApiError) {
        return {
          ok: false,
          status: `arena_error_${err.httpStatus}`,
          httpStatus: err.httpStatus,
          code: err.code,
          traceId: err.traceId,
          billingUrl: err.billingUrl,
          retryAfter: err.retryAfter,
          message: err.message,
          userGuidance: err.userGuidance
        };
      }
      return {
        ok: false,
        status: 'network_unreachable',
        code: err?.name === 'AbortError' ? 'timeout' : 'network_error',
        message: `No fue posible establecer conexión saliente con ${url} (${err?.message || 'error de red'}).`,
        userGuidance: 'Verifique que el servidor donde se ejecuta el backend tenga salida HTTPS hacia api.arena.ai (nota: el sandbox de desarrollo restringe tráfico saliente a dominios de código; en despliegue real el servidor se conecta directamente a api.arena.ai).'
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Ejecuta una consulta real al modelo configurado en Arena API
   * Soporta formato OpenAI (/v1/chat/completions) y formato Anthropic (/v1/messages)
   */
  async chatCompletion({ systemPrompt, messages, modelOverride = '' }) {
    const cfg = this.getConfig();
    if (cfg.provider !== 'arena') {
      throw new ArenaApiError('Proveedor no autorizado. Solo Arena API está habilitada.', {
        httpStatus: 400,
        code: 'provider_not_authorized'
      });
    }
    if (!cfg.hasApiKey) {
      throw new ArenaApiError('ARENA_API_KEY no configurada en el servidor.', {
        httpStatus: 503,
        code: 'awaiting_api_key',
        userGuidance: 'Configure ARENA_API_KEY en las variables de entorno del servidor para activar respuestas generativas con Arena API.'
      });
    }

    let selectedModel = (modelOverride || cfg.model || '').trim();
    if (!selectedModel) {
      // Autodescubrir primer modelo directo habilitado en Arena API (caché 5 min)
      const now = Date.now();
      if (!this._cachedDirectModel || now > this._cachedDirectModelExp) {
        const ver = await this.verifyConnection().catch(() => null);
        if (ver?.ok && ver.directModels?.length > 0) {
          this._cachedDirectModel = ver.directModels[0];
          this._cachedDirectModelExp = now + 5 * 60 * 1000;
        }
      }
      selectedModel = this._cachedDirectModel || 'coding-router-preview';
    }
    const isAnthropic = cfg.format === 'anthropic';
    const url = isAnthropic
      ? `${cfg.gatewayRoot}/v1/messages`
      : `${cfg.openAiBase}/chat/completions`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`
    };
    if (isAnthropic) {
      headers['anthropic-version'] = '2023-06-01';
      headers['x-api-key'] = cfg.apiKey;
    }

    const sanitizedMessages = (messages || [])
      .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 16000) }));

    const buildPayload = (useMaxCompletionTokens = false, omitTemp = false) => {
      if (isAnthropic) {
        const p = {
          model: selectedModel,
          max_tokens: cfg.maxOutputTokens,
          system: systemPrompt,
          messages: sanitizedMessages
        };
        if (!omitTemp) p.temperature = cfg.temperature;
        return p;
      }
      const p = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...sanitizedMessages
        ]
      };
      if (useMaxCompletionTokens) p.max_completion_tokens = cfg.maxOutputTokens;
      else p.max_tokens = cfg.maxOutputTokens;
      if (!omitTemp) p.temperature = cfg.temperature;
      return p;
    };

    const doFetch = async (bodyObj) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
      try {
        return await this.fetchImpl(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(bodyObj),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }
    };

    let res;
    let parsedErrBody = null;
    try {
      res = await doFetch(buildPayload(false, false));
      // Respetar Retry-After una sola vez si es breve (<= 5s), conforme a platform.arena.ai/docs/errors
      if (res.status === 429) {
        const retrySec = Number(res.headers.get('retry-after'));
        if (Number.isFinite(retrySec) && retrySec > 0 && retrySec <= 5) {
          await new Promise((r) => setTimeout(r, retrySec * 1000));
          res = await doFetch(buildPayload(false, false));
        }
      }
      // Compatibilidad con modelos de razonamiento en formato OpenAI que exigen max_completion_tokens o sin temperature
      if (!isAnthropic && res.status === 400) {
        parsedErrBody = await res.json().catch(() => ({}));
        const errMsg = String(parsedErrBody?.error?.message || '').toLowerCase();
        const needsMaxComp = errMsg.includes('max_completion_tokens');
        const badTemp = errMsg.includes('temperature');
        if (needsMaxComp || badTemp) {
          parsedErrBody = null;
          res = await doFetch(buildPayload(needsMaxComp, needsMaxComp || badTemp));
        }
      }
    } catch (err) {
      throw new ArenaApiError(
        `No se pudo conectar con Arena API en ${url}: ${err?.message || 'error de red'}`,
        {
          httpStatus: 502,
          code: err?.name === 'AbortError' ? 'timeout' : 'network_unreachable',
          userGuidance: 'Verifique la conectividad HTTPS saliente del servidor hacia https://api.arena.ai.'
        }
      );
    }

    const traceId = res.headers.get('x-arena-trace-id') || null;
    const routingMode = res.headers.get('x-arena-routing-mode') || 'direct';
    const body = parsedErrBody || await res.json().catch(() => ({}));

    if (!res.ok) {
      throw mapArenaError(res.status, body, res.headers);
    }

    let content = '';
    if (isAnthropic) {
      content = Array.isArray(body?.content)
        ? body.content.filter((b) => b?.type === 'text').map((b) => b.text).join('\n')
        : '';
    } else {
      const msgContent = body?.choices?.[0]?.message?.content;
      if (typeof msgContent === 'string') {
        content = msgContent;
      } else if (Array.isArray(msgContent)) {
        content = msgContent.map((part) => part?.text || '').join('\n');
      }
    }

    return {
      provider: 'arena',
      format: cfg.format,
      requestedModel: selectedModel,
      reportedModel: body?.model || selectedModel,
      routingMode,
      traceId: traceId || body?.request_id || null,
      usedCodingRouterFallback: !cfg.model && !modelOverride && selectedModel === 'coding-router-preview',
      usage: body?.usage || null,
      content: content.trim()
    };
  }
}
