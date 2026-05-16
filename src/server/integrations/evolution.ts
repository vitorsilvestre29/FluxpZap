type EvolutionConfig = {
  baseUrl: string;
  apiKey: string;
};

type EvolutionInstancePayload = {
  instanceName: string;
  qrcode?: boolean;
  integration?: string;
};

type EvolutionBotPayload = {
  enabled: boolean;
  description?: string | null;
  apiUrl: string;
  apiKey?: string | null;
  triggerType: string;
  triggerOperator?: string | null;
  triggerValue?: string | null;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids?: string[];
  splitMessages: boolean;
  timePerChar: number;
};

type EvolutionTypebotPayload = {
  enabled: boolean;
  url: string;
  typebot: string;
  triggerType: string;
  triggerOperator?: string | null;
  triggerValue?: string | null;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
};

export async function createEvolutionInstance(config: EvolutionConfig, payload: EvolutionInstancePayload) {
  const response = await fetch(`${config.baseUrl}/instance/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
    },
    body: JSON.stringify({
      instanceName: payload.instanceName,
      qrcode: payload.qrcode ?? true,
      integration: payload.integration ?? 'WHATSAPP-BAILEYS',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao criar instancia');
  }

  return response.json();
}

export async function getEvolutionConnectionState(config: EvolutionConfig, instanceName: string) {
  const response = await fetch(`${config.baseUrl}/instance/connectionState/${instanceName}`, {
    headers: {
      apikey: config.apiKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao consultar status');
  }

  return response.json();
}

export async function connectEvolutionInstance(config: EvolutionConfig, instanceName: string) {
  const response = await fetch(`${config.baseUrl}/instance/connect/${instanceName}`, {
    headers: {
      apikey: config.apiKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao conectar instancia');
  }

  return response.json();
}

export async function restartEvolutionInstance(config: EvolutionConfig, instanceName: string) {
  const response = await fetch(`${config.baseUrl}/instance/restart/${instanceName}`, {
    method: 'POST',
    headers: {
      apikey: config.apiKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao reconectar instancia');
  }

  return response.json();
}

export function mapEvolutionStateToInstanceStatus(state?: string) {
  if (!state) return 'PENDING';
  if (state === 'open') return 'CONNECTED';
  if (state === 'connecting') return 'PENDING';
  if (state === 'close') return 'DISCONNECTED';
  return 'ERROR';
}

function buildEvolutionBotPayload(payload: EvolutionBotPayload) {
  return {
    enabled: payload.enabled,
    description: payload.description || 'Fluxozap bot',
    apiUrl: payload.apiUrl,
    apiKey: payload.apiKey || '',
    triggerType: payload.triggerType || 'keyword',
    triggerOperator: payload.triggerOperator || undefined,
    triggerValue: payload.triggerValue || undefined,
    expire: Math.round(payload.expire / 60),
    keywordFinish: payload.keywordFinish,
    delayMessage: payload.delayMessage,
    unknownMessage: payload.unknownMessage,
    listeningFromMe: payload.listeningFromMe,
    stopBotFromMe: payload.stopBotFromMe,
    keepOpen: payload.keepOpen,
    debounceTime: payload.debounceTime,
    ignoreJids: payload.ignoreJids ?? [],
    splitMessages: payload.splitMessages,
    timePerChar: payload.timePerChar,
  };
}

export async function createEvolutionBot(config: EvolutionConfig, instanceName: string, payload: EvolutionBotPayload) {
  const response = await fetch(`${config.baseUrl}/evolutionBot/create/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
    },
    body: JSON.stringify(buildEvolutionBotPayload(payload)),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao criar EvolutionBot');
  }

  return response.json();
}

export async function updateEvolutionBot(
  config: EvolutionConfig,
  instanceName: string,
  evolutionBotId: string,
  payload: EvolutionBotPayload,
) {
  const response = await fetch(`${config.baseUrl}/evolutionBot/update/${evolutionBotId}/${instanceName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
    },
    body: JSON.stringify(buildEvolutionBotPayload(payload)),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao atualizar EvolutionBot');
  }

  return response.json();
}

function buildEvolutionTypebotPayload(payload: EvolutionTypebotPayload) {
  return {
    enabled: payload.enabled,
    url: payload.url.replace(/\/$/, ''),
    typebot: payload.typebot,
    triggerType: payload.triggerType || 'keyword',
    triggerOperator: payload.triggerOperator || undefined,
    triggerValue: payload.triggerValue || undefined,
    expire: Math.round(payload.expire / 60),
    keywordFinish: payload.keywordFinish,
    delayMessage: payload.delayMessage,
    unknownMessage: payload.unknownMessage,
    listeningFromMe: payload.listeningFromMe,
    stopBotFromMe: payload.stopBotFromMe,
    keepOpen: payload.keepOpen,
    debounceTime: payload.debounceTime,
  };
}

export async function createEvolutionTypebot(
  config: EvolutionConfig,
  instanceName: string,
  payload: EvolutionTypebotPayload,
) {
  const response = await fetch(`${config.baseUrl}/typebot/create/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
    },
    body: JSON.stringify(buildEvolutionTypebotPayload(payload)),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao configurar Typebot na Evolution');
  }

  return response.json().catch(() => ({}));
}

export async function updateEvolutionTypebot(
  config: EvolutionConfig,
  instanceName: string,
  evolutionTypebotId: string,
  payload: EvolutionTypebotPayload,
) {
  const response = await fetch(`${config.baseUrl}/typebot/update/${evolutionTypebotId}/${instanceName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
    },
    body: JSON.stringify(buildEvolutionTypebotPayload(payload)),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao atualizar Typebot na Evolution');
  }

  return response.json().catch(() => ({}));
}
