/** BM25 — pure lexical relevance ranking. No model, no embeddings, no IO.
 *
 * Self-contained on purpose: ranking can be tuned or swapped (e.g. for an
 * embeddings index later) without touching trust filtering.
 */

import { Claim } from '../types.js';

/** BM25 term-frequency saturation. Standard default. */
const DEFAULT_K1 = 1.5;
/** BM25 length-normalization strength. Standard default. */
const DEFAULT_B = 0.75;
/** Splits searchable text into lowercase alphanumeric terms. */
const TERM_PATTERN = /[a-z0-9]+/g;

/** Ranks claims by keyword relevance (BM25) — pure math, no IO. */
export class Bm25Ranker {
  /** Rank claims by BM25 relevance to the query, best first; claims with no
   * term overlap are dropped. */
  static rank(query: string, claims: Claim[], k1 = DEFAULT_K1, b = DEFAULT_B): Claim[] {
    const queryTerms = [...new Set(Bm25Ranker.tokenize(query))];
    if (!queryTerms.length) return claims;

    const documents = claims.map((claim) =>
      [claim, Bm25Ranker.tokenize(Bm25Ranker.searchableText(claim))] as const);
    const documentCount = documents.length || 1;
    const averageLength =
      (documents.reduce((sum, [, terms]) => sum + terms.length, 0) / documentCount) || 1;

    // how many documents contain each query term (rare terms weigh more)
    const documentFrequency: Record<string, number> = {};
    for (const term of queryTerms) {
      documentFrequency[term] = documents.filter(([, terms]) => terms.includes(term)).length;
    }

    const scored: Array<[number, Claim]> = [];
    for (const [claim, terms] of documents) {
      const score = Bm25Ranker.scoreDocument(
        queryTerms, terms, documentFrequency, documentCount, averageLength, k1, b);
      if (score > 0) scored.push([score, claim]);
    }

    scored.sort((left, right) => right[0] - left[0]);
    return scored.map(([, claim]) => claim);
  }

  /** The BM25 score of one document against the query terms. */
  private static scoreDocument(queryTerms: string[], terms: string[],
                               documentFrequency: Record<string, number>,
                               documentCount: number, averageLength: number,
                               k1: number, b: number): number {
    let score = 0;
    const documentLength = terms.length;

    for (const term of queryTerms) {
      const matchingDocuments = documentFrequency[term] ?? 0;
      if (!matchingDocuments) continue;

      const termFrequency = terms.filter((t) => t === term).length;
      const rarityWeight =
        Math.log(1 + (documentCount - matchingDocuments + 0.5) / (matchingDocuments + 0.5));
      const lengthNormalizer = 1 - b + (b * documentLength) / averageLength;

      score += rarityWeight * (termFrequency * (k1 + 1)) / (termFrequency + k1 * lengthNormalizer);
    }

    return score;
  }

  /** Lowercase alphanumeric terms of a text. */
  private static tokenize(text: string): string[] {
    return (text ?? '').toLowerCase().match(TERM_PATTERN) ?? [];
  }

  /** What the ranker sees: the claim sentence plus its tag values. */
  private static searchableText(claim: Claim): string {
    return claim.claim + ' ' + Object.values(claim.scope ?? {}).map(String).join(' ');
  }
}
