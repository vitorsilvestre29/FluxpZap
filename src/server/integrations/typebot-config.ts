import { getIntegration } from './integration.service';
import { getDefaultTypebotApiUrl, getDefaultTypebotEditorTemplate, normalizeTypebotEditorTemplate } from './typebot';

export async function getTypebotConfig(agencyId: string) {
  const integration = await getIntegration(agencyId, 'TYPEBOT');
  const metadata = integration?.metadata as
    | {
        editorTemplate?: string;
        apiUrl?: string;
        workspaceId?: string;
        viewerUrl?: string;
      }
    | null;
  const baseUrl = integration?.baseUrl || process.env.TYPEBOT_BASE_URL || '';

  return {
    baseUrl,
    editorTemplate: normalizeTypebotEditorTemplate(
      metadata?.editorTemplate || process.env.TYPEBOT_EDITOR_TEMPLATE || getDefaultTypebotEditorTemplate(baseUrl),
    ),
    apiUrl: metadata?.apiUrl || process.env.TYPEBOT_API_URL || getDefaultTypebotApiUrl(baseUrl),
    apiKey: integration?.apiKey || process.env.TYPEBOT_API_KEY || null,
    workspaceId: metadata?.workspaceId || process.env.TYPEBOT_WORKSPACE_ID || null,
    viewerUrl: metadata?.viewerUrl || process.env.TYPEBOT_VIEWER_URL || null,
    maskedBasePath: '/fluxo-builder',
  };
}

export function isTypebotConfigReady(config: Awaited<ReturnType<typeof getTypebotConfig>>) {
  return Boolean(config.baseUrl && config.apiUrl && config.apiKey && config.workspaceId);
}
