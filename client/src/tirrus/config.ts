// Tirrus — product constants used by the client.
// The marketing site owns pricing; the control plane owns the account (plan, credits,
// team). The user's plan reaches the client as user.role (OpenID role sync from the
// tirrus_role claim — see docs/PLANS-AND-TEAMS.md in the control-plane repo).
export const PRICING_URL = 'https://tirrus.com/pricing';
export const ACCOUNT_URL = 'https://solvane-auth.onrender.com/account';

/** What the plan pill says for a role. Unknown roles (e.g. ADMIN) say nothing. */
export function planLabel(role?: string | null): { label: string; upgrade: boolean } | null {
  switch (role) {
    case 'FREE':
    case 'USER':
      return { label: 'Free', upgrade: true };
    case 'PRO':
      return { label: 'Pro', upgrade: false };
    case 'TEAM':
      return { label: 'Team', upgrade: false };
    default:
      return null;
  }
}
