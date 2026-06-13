/** The one place process.env is read for credentials.
 *
 * Domain code asks for typed, validated config through the accessors here and
 * never touches process.env itself, so every credential is documented and
 * checked against a schema in exactly one spot (the convict-style pattern, done
 * with the zod we already depend on rather than a new library). A missing or
 * empty value fails loudly at the boundary with an error that names it, instead
 * of surfacing as a confusing 401 deep inside a query. */

import { z } from 'zod';

/** Read-only Mixpanel service account. All three fields are required together —
 * the account is either fully configured or unusable. */
export interface MixpanelConfig {
  user: string;
  secret: string;
  project: string;
}

/** Every Mixpanel credential must be present and non-empty. */
const MIXPANEL_SCHEMA = z.object({
  MIXPANEL_SA_USER: z.string().min(1),
  MIXPANEL_SA_SECRET: z.string().min(1),
  MIXPANEL_PROJECT_ID: z.string().min(1),
});

/** The validated Mixpanel service account, read live from the environment.
 * Throws a descriptive error naming the missing variables when the account is
 * not fully configured — replaces a scatter of `process.env.X!` + a guard. */
export function requireMixpanelConfig(): MixpanelConfig {
  const result = MIXPANEL_SCHEMA.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Mixpanel service account not configured (missing ${missing})`);
  }

  return {
    user: result.data.MIXPANEL_SA_USER,
    secret: result.data.MIXPANEL_SA_SECRET,
    project: result.data.MIXPANEL_PROJECT_ID,
  };
}

/** The Mixpanel project id for display/labelling, or undefined when unset.
 * Unlike requireMixpanelConfig this never throws — it's for a source string,
 * not for reaching the API. */
export function mixpanelProjectId(): string | undefined {
  return process.env.MIXPANEL_PROJECT_ID;
}
