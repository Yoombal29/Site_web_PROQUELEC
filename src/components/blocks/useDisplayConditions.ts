import { evaluateConditions, ConditionsContext, Condition } from './displayConditions';

export function useDisplayConditions(props: Record<string, unknown> | undefined, ctx?: ConditionsContext): boolean {
  const conditions = (props?.conditions || []) as Condition[];
  return evaluateConditions(conditions, ctx);
}
