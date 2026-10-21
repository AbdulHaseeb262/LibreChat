import { useAuthContext } from '~/hooks';
import { ACCOUNT_URL, PRICING_URL, planLabel } from '~/tirrus/config';

/**
 * Tirrus — the plan indicator at the top right. Free says "Free · Upgrade" and opens
 * pricing; paid plans name the plan and open the account (credits, team, billing). The plan comes from
 * user.role, which the control plane sets through the sign-in token.
 */
export default function PlanPill() {
  const { user } = useAuthContext();
  const plan = planLabel(user?.role);
  if (!plan) {
    return null;
  }
  return (
    <a
      href={plan.upgrade ? PRICING_URL : ACCOUNT_URL}
      target="_blank"
      rel="noreferrer"
      className="tirrus-plan inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-light bg-surface-primary-alt px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-hover"
    >
      <span>{plan.label}</span>
      <span aria-hidden="true">·</span>
      <span className="font-medium text-text-primary">{plan.upgrade ? 'Upgrade' : 'Account'}</span>
    </a>
  );
}
