import { PLAN_LABEL, PRICING_URL } from '~/solvane/config';

/** Solvane — the plan indicator at the top right: "Trial · Upgrade". */
export default function PlanPill() {
  return (
    <a
      href={PRICING_URL}
      target="_blank"
      rel="noreferrer"
      className="solvane-plan inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-light bg-surface-primary-alt px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-hover"
    >
      <span>{PLAN_LABEL}</span>
      <span aria-hidden="true">·</span>
      <span className="font-medium text-text-primary">Upgrade</span>
    </a>
  );
}
