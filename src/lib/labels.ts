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
};

const roleMap: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  AGENCY_ADMIN: 'Admin',
  USER: 'Usuário',
};

export function labelStatus(value: string): string {
  return statusMap[value] ?? value;
}

export function labelRole(value: string): string {
  return roleMap[value] ?? value;
}
