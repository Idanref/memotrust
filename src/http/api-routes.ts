/** The API surface as data: every endpoint is one row + one small handler.
 * Adding an endpoint = adding a row, never another if-branch. */

import { gitMemoryState } from './system-status.js';
import { ClaimWriter } from '../store/writers/claim-writer.js';
import { StatusWriter } from '../store/writers/status-writer.js';
import { DashboardData } from '../store/recall/dashboard-data.js';
import { RecallService } from '../store/recall/recall-service.js';
import { SpaceDirectory } from '../store/spaces/space-directory.js';
import { EvidenceWriter } from '../store/writers/evidence-writer.js';
import { HttpMethod, Route, RouteContext, RouteResult } from './types.js';
import { VerificationService } from '../verifiers/verification-service.js';
import { ClaimMetadataWriter } from '../store/writers/claim-metadata-writer.js';

/** GET /api/data — everything the dashboard renders, plus live git state. */
function data(): RouteResult {
  const payload = DashboardData.buildData();
  payload.sys.git = gitMemoryState();
  return { code: 200, body: payload };
}

/** POST /api/recall — the real agent-facing recall, what an agent acts on. */
function recall({ payload }: RouteContext): RouteResult {
  return { code: 200, body: RecallService.recall(
    payload.query || null, payload.scope || {}, payload.space || null) };
}

/** POST /api/claims — capture a new claim (lands quarantined). */
function createClaim({ payload }: RouteContext): RouteResult {
  const newClaimId = ClaimWriter.createClaim(payload.claim ?? '', null, 'you', payload.space || null);
  return { code: 200, body: { ok: true, id: newClaimId } };
}

/** POST /api/claims/bulk-status — inbox bulk review. */
function bulkStatus({ payload }: RouteContext): RouteResult {
  const changedCount = StatusWriter.bulkSetStatus(
    payload.ids ?? [], payload.status ?? '', payload.note ?? '');
  return { code: 200, body: { ok: true, changed: changedCount } };
}

/** POST /api/claims/:id/verify — dry re-run: re-read and compare, no mutation. */
async function verifyClaim({ params: [claimId] }: RouteContext): Promise<RouteResult> {
  return { code: 200, body: await VerificationService.runVerifier(claimId, null, false) };
}

/** POST /api/claims/:id/status — approve / reject / recheck one claim. */
function setStatus({ params: [claimId], payload }: RouteContext): RouteResult {
  const ok = StatusWriter.setStatus(claimId, payload.status ?? '', payload.note ?? '');
  return { code: ok ? 200 : 404, body: { ok } };
}

/** POST /api/claims/:id/evidence — human note on the trail, no status change. */
function addEvidence({ params: [claimId], payload }: RouteContext): RouteResult {
  const ok = EvidenceWriter.addEvidence(claimId, payload.text ?? '', payload.kind ?? 'context');
  return { code: ok ? 200 : 400, body: { ok } };
}

/** POST /api/claims/:id/resolve-dispute — human re-affirms a disputed claim. */
function resolveDispute({ params: [claimId] }: RouteContext): RouteResult {
  const ok = EvidenceWriter.resolveDispute(claimId);
  return { code: ok ? 200 : 400, body: { ok } };
}

/** POST /api/claims/:id/space — file a claim under a space (or clear it). */
function setSpace({ params: [claimId], payload }: RouteContext): RouteResult {
  const ok = ClaimMetadataWriter.setSpace(claimId, payload.space ?? null);
  return { code: ok ? 200 : 400, body: { ok } };
}

/** POST /api/claims/:id/tags — replace a claim's freeform tags. */
function setTags({ params: [claimId], payload }: RouteContext): RouteResult {
  const ok = ClaimMetadataWriter.setTags(claimId, payload.tags ?? {});
  return { code: ok ? 200 : 400, body: { ok } };
}

/** POST /api/claims/:id/delete — permanent (but git-recoverable) removal. */
function deleteClaim({ params: [claimId] }: RouteContext): RouteResult {
  const ok = ClaimWriter.deleteClaim(claimId);
  return { code: ok ? 200 : 404, body: { ok } };
}

/** POST /api/spaces/describe — set/clear a space's one-line description. */
function describeSpace({ payload }: RouteContext): RouteResult {
  const ok = SpaceDirectory.describeSpace(payload.space ?? '', payload.description ?? '');
  return { code: ok ? 200 : 400, body: { ok } };
}

/** Match order preserved from the legacy dispatch chain. */
export const API_ROUTES: Route[] = [
  { method: HttpMethod.Get, path: '/api/data', handle: data },
  { method: HttpMethod.Post, path:'/api/recall', handle: recall },
  { method: HttpMethod.Post, path:'/api/claims', handle: createClaim },
  { method: HttpMethod.Post, path:'/api/claims/bulk-status', handle: bulkStatus },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/verify$/, handle: verifyClaim },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/status$/, handle: setStatus },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/evidence$/, handle: addEvidence },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/resolve-dispute$/, handle: resolveDispute },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/space$/, handle: setSpace },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/tags$/, handle: setTags },
  { method: HttpMethod.Post, path:/^\/api\/claims\/([^/]+)\/delete$/, handle: deleteClaim },
  { method: HttpMethod.Post, path:'/api/spaces/describe', handle: describeSpace },
];
