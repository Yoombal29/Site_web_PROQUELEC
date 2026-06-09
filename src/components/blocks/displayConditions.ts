export interface Condition {
  id: string;
  type: 'role' | 'device' | 'url' | 'queryParam' | 'date' | 'loggedIn' | 'cookie';
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
  value: string;
}

export interface ConditionsContext {
  roles?: string[];
  device?: 'desktop' | 'tablet' | 'mobile';
  url?: string;
  queryParams?: Record<string, string>;
  cookies?: Record<string, string>;
  now?: Date;
}

function getDevice(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function evaluateSingle(c: Condition, ctx: ConditionsContext): boolean {
  let actual: string | undefined;

  switch (c.type) {
    case 'role':
      actual = ctx.roles?.[0];
      break;
    case 'device':
      actual = ctx.device || getDevice();
      break;
    case 'url':
      actual = ctx.url || (typeof window !== 'undefined' ? window.location.pathname : '');
      break;
    case 'queryParam':
      actual = ctx.queryParams?.[c.value] || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(c.value) || undefined : undefined);
      break;
    case 'date': {
      const now = ctx.now || new Date();
      actual = now.toISOString();
      const target = new Date(c.value);
      switch (c.operator) {
        case 'greaterThan': return now > target;
        case 'lessThan': return now < target;
        default: return now.toDateString() === target.toDateString();
      }
    }
    case 'loggedIn':
      actual = ctx.roles && ctx.roles.length > 0 ? 'true' : 'false';
      break;
    case 'cookie':
      actual = ctx.cookies?.[c.value] || getCookie(c.value);
      break;
    default:
      return true;
  }

  switch (c.operator) {
    case 'equals': return actual === c.value;
    case 'notEquals': return actual !== c.value;
    case 'contains': return (actual || '').includes(c.value);
    case 'notContains': return !(actual || '').includes(c.value);
    case 'exists': return actual !== undefined && actual !== '';
    case 'notExists': return actual === undefined || actual === '';
    default: return true;
  }
}

export function evaluateConditions(conditions: Condition[] | undefined | null, ctx?: ConditionsContext): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every(c => evaluateSingle(c, ctx || {}));
}
