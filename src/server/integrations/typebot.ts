type TypebotConfig = {
  baseUrl: string;
  editorTemplate: string;
  apiUrl?: string | null;
  apiKey?: string | null;
  workspaceId?: string | null;
  viewerUrl?: string | null;
  maskedBasePath?: string;
};

type TypebotFlow = {
  typebotId?: string | null;
};

export function buildTypebotEditorUrl(config: TypebotConfig, flow: TypebotFlow) {
  if (!flow.typebotId) return null;
  const editorUrl = config.editorTemplate.replace('{{typebotId}}', flow.typebotId);

  if (!config.maskedBasePath || !config.baseUrl) return editorUrl;
  if (editorUrl.startsWith(config.maskedBasePath)) return editorUrl;

  try {
    const baseUrl = new URL(config.baseUrl);
    const url = new URL(editorUrl, baseUrl);

    if (url.origin !== baseUrl.origin) return editorUrl;

    return `${config.maskedBasePath}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return editorUrl;
  }
}

export function getDefaultTypebotEditorTemplate(baseUrl?: string | null) {
  if (!baseUrl) return '/fluxo-builder/typebots/{{typebotId}}';
  return `${baseUrl.replace(/\/$/, '')}/typebots/{{typebotId}}`;
}

export function getDefaultTypebotApiUrl(baseUrl?: string | null) {
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/$/, '')}/api/v1`;
}

export async function createTypebot(config: TypebotConfig, input: { name: string; description?: string | null }) {
  const apiUrl = (config.apiUrl || getDefaultTypebotApiUrl(config.baseUrl))?.replace(/\/$/, '');
  const apiKey = config.apiKey;
  const workspaceId = config.workspaceId;

  if (!apiUrl || !apiKey || !workspaceId) {
    return {
      ok: false as const,
      reason: 'TYPEBOT_NOT_CONFIGURED',
    };
  }

  const response = await fetch(`${apiUrl}/typebots`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspaceId,
      typebot: {
        name: input.name,
        settings: {
          general: {
            isBrandingEnabled: false,
          },
          publicShare: {
            isEnabled: true,
          },
          metadata: {
            title: input.name,
            description: input.description || undefined,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Typebot create failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as {
    typebot?: {
      id?: string;
      publicId?: string | null;
    };
  };

  const typebotId = payload.typebot?.id;
  const publicId = payload.typebot?.publicId;

  if (!typebotId) {
    throw new Error('Typebot create failed: missing typebot id');
  }

  return {
    ok: true as const,
    typebotId,
    publicId: publicId || null,
    editorUrl: buildTypebotEditorUrl(config, { typebotId }),
    publishedUrl: publicId && config.viewerUrl ? `${config.viewerUrl.replace(/\/$/, '')}/${publicId}` : null,
  };
}

export async function publishTypebot(config: TypebotConfig, typebotId: string) {
  const apiUrl = (config.apiUrl || getDefaultTypebotApiUrl(config.baseUrl))?.replace(/\/$/, '');
  const apiKey = config.apiKey;

  if (!apiUrl || !apiKey) {
    return {
      ok: false as const,
      reason: 'TYPEBOT_NOT_CONFIGURED',
    };
  }

  const response = await fetch(`${apiUrl}/typebots/${typebotId}/publish`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Typebot publish failed: ${response.status} ${message}`);
  }

  return {
    ok: true as const,
  };
}
