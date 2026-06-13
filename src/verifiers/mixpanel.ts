/** Mixpanel verifier — READ-ONLY.
 *
 * Confirms or refutes growth/metric claims against live Mixpanel data. It only
 * ever READS: a read-scoped service account and query endpoints (the allow-list
 * in MIXPANEL_READONLY_TOOLS below). It imports the verifier contract and the
 * standard library — never store/ — so it cannot write, update, or delete
 * anything, in Mixpanel or in memotrust. It returns a Verdict and nothing else.
 *
 * A claim opts in to automated checking by carrying a `check` field in its
 * frontmatter, e.g.:
 *
 *   check: {"event": "Signup", "breakdown": "mp_country_code", "expect_top": "US",
 *           "window_days": 90, "label": "top signup country"}
 */

import { plusDaysISO, todayISO } from '../utils/dates.js';
import { mixpanelProjectId, requireMixpanelConfig } from '../config.js';
import { Fetcher, IVerifier, Outcome, Verdict, inconclusive } from './types.js';

/** The claim types this verifier can judge (growth metrics, not code facts). */
const GROWTH_TYPES = new Set(['pricing', 'acquisition', 'onboarding', 'creative', 'retention', 'geo']);

/** Read-only Mixpanel query timeout (ms). */
const MIXPANEL_QUERY_TIMEOUT_MS = 20000;
/** Default look-back window (days) when a check omits window_days. */
const DEFAULT_WINDOW_DAYS = 90;
/** How many top breakdown rows the proof receipt keeps as a sample. */
const TOP_ROWS_IN_PROOF = 4;

/** Total events for one breakdown series, summed over its per-day counts
 * (the day -> count map Mixpanel returns for that series). */
function sumDailyCounts(daily: Record<string, number>): number {
  return Object.values(daily).reduce((total, count) => total + count, 0);
}

/** Verifies growth-metric claims against live Mixpanel data (read-only). */
export class MixpanelVerifier implements IVerifier {
  /** Handles growth/metric claims (not code or competitor claims). */
  handles(claim: Record<string, any>): boolean {
    return GROWTH_TYPES.has(claim?.scope?.type);
  }

  /** Read-only verification that also returns an auditable proof. `fetch(check)`
   * runs a read-only Mixpanel query; for a top-of-breakdown check it returns the
   * sorted rows [[label, count], ...], for a threshold check a single number. */
  async verify(claim: Record<string, any>, fetch?: Fetcher | null): Promise<Verdict> {
    const source = `Mixpanel project ${mixpanelProjectId() ?? '(unset)'} (read-only)`;

    const rawCheck = claim.check;
    if (!rawCheck) return inconclusive('no machine-checkable metric attached to this claim', source);

    let check: Record<string, any>;
    try {
      check = typeof rawCheck === 'string' ? JSON.parse(rawCheck) : rawCheck;
    } catch {
      return inconclusive("claim's check is not valid JSON", source);
    }

    const read = fetch ?? ((c: Record<string, any>) => this.liveQuery(c));
    let observed: any;
    try {
      observed = await read(check);
    } catch (error: any) { // never crash the orchestrator on a read failure
      return inconclusive(`could not reach Mixpanel: ${error?.message ?? error}`, source);
    }

    return 'expect_top' in check
      ? this.judgeTopOfBreakdown(check, observed, source)
      : this.judgeThreshold(check, observed, source);
  }

  // ====== judging (memotrust decides — the reader only supplies data) ======

  /** Top-of-breakdown: compare the observed leader to the expectation. */
  private judgeTopOfBreakdown(check: Record<string, any>, observed: any, source: string): Verdict {
    let observedTop: any;
    let result: Record<string, any>;

    if (Array.isArray(observed)) { // full breakdown rows [[label, count], ...]
      const rows = observed as Array<[string, number]>;
      observedTop = rows.length ? rows[0][0] : '(none)';
      result = {
        rows: rows.slice(0, TOP_ROWS_IN_PROOF),
        n: rows.length,
        total: rows.reduce((sum, row) => sum + row[1], 0),
      };
    } else { // an agent submitted just the top value it read
      observedTop = observed;
      result = { observed };
    }

    const matches = String(observedTop).toLowerCase() === String(check.expect_top).toLowerCase();
    const label = check.label ?? 'metric';

    return {
      outcome: matches ? Outcome.Confirmed : Outcome.Refuted,
      detail: `${label}: observed top = ${observedTop}, expected ${check.expect_top}`,
      source,
      proof: {
        read_by: check.read_by ?? 'agent',
        expected: `Top ${check.by ?? 'value'} is ${check.expect_top}`,
        query: this.describeQuery(check, source),
        result,
        judged: `observed top = ${observedTop}  ${matches ? '==' : '!='}  expected ${check.expect_top}`,
      },
    };
  }

  /** "Signups >= 1000" — compare the observed number against the threshold. */
  private judgeThreshold(check: Record<string, any>, observed: any, source: string): Verdict {
    const operator = check.op ?? '>=';
    const threshold = check.threshold;
    const withinThreshold = this.compare(observed, operator, threshold);
    const label = check.label ?? 'metric';

    return {
      outcome: withinThreshold ? Outcome.Confirmed : Outcome.Refuted,
      detail: `${label}: ${observed} ${operator} ${threshold}`,
      source,
      proof: {
        read_by: check.read_by ?? 'agent',
        expected: `${label} ${operator} ${threshold}`,
        query: this.describeQuery(check, source),
        result: { value: observed },
        judged: `${observed} ${operator} ${threshold}`,
      },
    };
  }

  /** Numeric comparison for threshold checks; non-numbers never pass. */
  private compare(value: any, operator: string, threshold: any): boolean {
    const observed = parseFloat(value);
    const limit = parseFloat(threshold);
    if (isNaN(observed) || isNaN(limit)) return false;

    switch (operator) {
      case '>=': return observed >= limit;
      case '>': return observed > limit;
      case '<=': return observed <= limit;
      case '<': return observed < limit;
      case '==': return observed === limit;
      default: return false;
    }
  }

  /** The auditable "query the reader ran" part of the receipt. */
  private describeQuery(check: Record<string, any>, source: string): Record<string, any> {
    return {
      event: check.event,
      breakdown: check.breakdown,
      window: check.window ?? 'last 90 days',
      source,
    };
  }

  // ====== reading ======

  /** READ-ONLY Mixpanel query (GET only). Uses a read-scoped service account from
   * the environment: MIXPANEL_PROJECT_ID, MIXPANEL_SA_USER, MIXPANEL_SA_SECRET. */
  private async liveQuery(check: Record<string, any>): Promise<any> {
    const { user, secret, project } = requireMixpanelConfig();

    const windowDays = parseInt(check.window_days ?? String(DEFAULT_WINDOW_DAYS), 10);
    const params = new URLSearchParams({
      project_id: project,
      event: check.event,
      type: 'general',
      unit: 'day',
      from_date: plusDaysISO(-windowDays),
      to_date: todayISO(),
    });
    if (check.breakdown) params.set('on', `properties["${check.breakdown}"]`);

    const response = await globalThis.fetch( // GET only — never writes
      'https://mixpanel.com/api/query/segmentation?' + params.toString(),
      { method: 'GET', signal: AbortSignal.timeout(MIXPANEL_QUERY_TIMEOUT_MS),
        headers: { Authorization: 'Basic ' + Buffer.from(`${user}:${secret}`).toString('base64') } });

    const payload: any = await response.json();
    const seriesByLabel: Record<string, Record<string, number>> = payload?.data?.values ?? {};

    if (check.expect_top) { // return sorted rows [[label, total], ...]
      return Object.entries(seriesByLabel)
        .map(([rowLabel, daily]) => [rowLabel, sumDailyCounts(daily)] as [string, number])
        .sort((left, right) => right[1] - left[1]);
    }

    return Object.values(seriesByLabel)
      .reduce((total, daily) => total + sumDailyCounts(daily), 0);
  }
}

export const mixpanelVerifier = new MixpanelVerifier();

/** The read-only allow-list a verifier may use against the Mixpanel MCP. Only
 * query/read operations appear here; every Create-/Update-/Delete-/Edit-/Bulk-
 * tool is intentionally absent, so a verifier cannot mutate Mixpanel even if it
 * tried. Connections should be configured to expose only these. */
export const MIXPANEL_READONLY_TOOLS = [
  'Run-Query', 'Get-Events', 'Get-Report', 'Get-Property-Values',
  'List-Metrics', 'Get-Metric', 'List-Dashboards', 'Get-Dashboard',
  'Get-Query-Schema', 'Get-Projects', 'Get-Business-Context',
] as const;
