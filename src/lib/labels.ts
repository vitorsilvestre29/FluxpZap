const statusMap: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  ARCHIVED: 'Arquivado',
  SUSPENDED: 'Suspenso',
  PENDING: 'Pendente',
  DRAFT: 'Rascunho',
  READY: 'Pronto',
  PUBLISHED: 'Publicado',
  OPEN: 'Aberta',
  CLOSED: 'Encerrada',
  ERROR: 'Erro',
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  QR_READY: 'Aguardando QR',
};

const roleMap: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  AGENCY_ADMIN: 'Admin',
  USER: 'Usuário',
};

// CSS classes for status badges
const statusColorMap: Record<string, string> = {
  ACTIVE: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  PUBLISHED: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  CONNECTED: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  OPEN: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
  READY: 'bg-blue-400/15 text-blue-300 border-blue-400/30',
  PAUSED: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  QR_READY: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  PENDING: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  DRAFT: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
  CLOSED: 'bg-slate-400/15 text-slate-400 border-slate-700',
  ARCHIVED: 'bg-slate-400/15 text-slate-400 border-slate-700',
  SUSPENDED: 'bg-red-400/15 text-red-300 border-red-400/30',
  DISCONNECTED: 'bg-red-400/15 text-red-300 border-red-400/30',
  ERROR: 'bg-red-400/15 text-red-300 border-red-400/30',
};

export function labelStatus(value: string): string {
  return statusMap[value] ?? value;
}

export function labelRole(value: string): string {
  return roleMap[value] ?? value;
}

export function statusColor(value: string): string {
  return statusColorMap[value] ?? 'border-slate-700 text-slate-300';
}
