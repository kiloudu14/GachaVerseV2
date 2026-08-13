// ── Liste des comptes administrateurs ───────────────────────────────────
// Seule source de vérité, utilisée à la fois par la page /admin (accès à
// l'outil de modération) ET par le jeu principal (pour ne JAMAIS bloquer un
// admin derrière l'écran "compte en attente de validation").
export const ADMIN_EMAILS = ['mehdixshinobie@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
