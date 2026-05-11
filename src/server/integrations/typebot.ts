type TypebotConfig = {
  baseUrl: string;
  editorTemplate: string;
  maskedBasePath?: string;
};

type TypebotFlow = {
  typebotId?: string | null;
};

export function buildTypebotEditorUrl(config: TypebotConfig, flow: TypebotFlow) {
  if (!flow.typebotId) return null;
  const editorUrl = config.editorTemplate.replace('{{typebotId}}', flow.typebotId);

  if (!config.maskedBasePath || !config.baseUrl) return editorUrl;

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
  if (!baseUrl) return '/_fluxo-builder/typebots/{{typebotId}}';
  return `${baseUrl.replace(/\/$/, '')}/typebots/{{typebotId}}`;
}
