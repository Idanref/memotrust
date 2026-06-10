/** memotrust store — the single source of truth.
 *
 * Plain files in memory/ (git-ready). Both the web server (server.ts) and the
 * MCP server (mcp.ts) read and write through this store. No database.
 *
 * This is the PUBLIC API facade — the published module path for tests, the
 * MCP probe, and npm consumers. Internals live in small classes by
 * responsibility (internal code deep-imports those directly):
 *
 *   types.ts / paths.ts                 shapes, constants, memory-home resolution
 *   infra/store-lock.ts                 cross-process write lock + atomic writes
 *   claims/claim-parser.ts              claim file text -> Claim
 *   claims/trust-rules.ts               isStale / effStatus / isDisputed (pure)
 *   claims/claim-repository.ts          list / find / load claims
 *   claims/event-log.ts                 read + append the evidence trail
 *   spaces/space-directory.ts           space descriptions (spaces.json)
 *   writers/claim-writer.ts             create / delete claims
 *   writers/status-writer.ts            status transitions + freshness + bulk
 *   writers/evidence-writer.ts          notes, disputes, re-affirmations
 *   writers/claim-metadata-writer.ts    space filing + freeform tags
 *   recall/bm25-ranker.ts               pure lexical ranking
 *   recall/claim-views.ts               Claim -> agent-facing DTOs
 *   recall/recall-service.ts            recall / search / vocabulary
 *   recall/dashboard-data.ts            the web payload
 */

import { EventLog } from './claims/event-log.js';
import { StoreLock } from './infra/store-lock.js';
import { Bm25Ranker } from './recall/bm25-ranker.js';
import { TrustRules } from './claims/trust-rules.js';
import { ClaimParser } from './claims/claim-parser.js';
import { ClaimWriter } from './writers/claim-writer.js';
import { StatusWriter } from './writers/status-writer.js';
import { DashboardData } from './recall/dashboard-data.js';
import { RecallService } from './recall/recall-service.js';
import { SpaceDirectory } from './spaces/space-directory.js';
import { EvidenceWriter } from './writers/evidence-writer.js';
import { ClaimRepository } from './claims/claim-repository.js';
import { ClaimMetadataWriter } from './writers/claim-metadata-writer.js';

export * from './types.js';
export * from './paths.js';
export { StoreLock } from './infra/store-lock.js';
export { ClaimParser } from './claims/claim-parser.js';
export { TrustRules } from './claims/trust-rules.js';
export { ClaimRepository } from './claims/claim-repository.js';
export { EventLog } from './claims/event-log.js';
export { SpaceDirectory } from './spaces/space-directory.js';
export { ClaimWriter } from './writers/claim-writer.js';
export { StatusWriter } from './writers/status-writer.js';
export { EvidenceWriter } from './writers/evidence-writer.js';
export { ClaimMetadataWriter } from './writers/claim-metadata-writer.js';
export { Bm25Ranker } from './recall/bm25-ranker.js';
export { ClaimViews } from './recall/claim-views.js';
export { RecallService } from './recall/recall-service.js';
export { DashboardData } from './recall/dashboard-data.js';

// The store API — free-function delegates over the classes.
// (Static methods self-reference by class name, so bare re-export is safe.)
export const withLock = StoreLock.withLock;
export const atomicWrite = StoreLock.atomicWrite;

export const parseClaim = ClaimParser.parseClaim;
export const isStale = TrustRules.isStale;
export const effStatus = TrustRules.effStatus;
export const isDisputed = TrustRules.isDisputed;
export const loadEvents = EventLog.loadEvents;
export const claimFiles = ClaimRepository.claimFiles;
export const findClaimFile = ClaimRepository.findClaimFile;
export const allClaims = ClaimRepository.allClaims;
export const spaceDescriptions = SpaceDirectory.spaceDescriptions;

export const appendEvent = EventLog.appendEvent;
export const writeStatus = StatusWriter.writeStatus;
export const setStatus = StatusWriter.setStatus;
export const bulkSetStatus = StatusWriter.bulkSetStatus;
export const createClaim = ClaimWriter.createClaim;
export const addEvidence = EvidenceWriter.addEvidence;
export const resolveDispute = EvidenceWriter.resolveDispute;
export const setSpace = ClaimMetadataWriter.setSpace;
export const setTags = ClaimMetadataWriter.setTags;
export const deleteClaim = ClaimWriter.deleteClaim;
export const describeSpace = SpaceDirectory.describeSpace;

export const bm25Rank = Bm25Ranker.rank;
export const recall = RecallService.recall;
export const searchClaims = RecallService.searchClaims;
export const pendingChecks = RecallService.pendingChecks;
export const vocabulary = RecallService.vocabulary;
export const buildData = DashboardData.buildData;
