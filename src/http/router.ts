/** Matches requests against the route table — first match wins, like the
 * legacy if-chain it replaces (order is behavior). */

import { Route, RouteHandler } from './types.js';

/** Finds the handler for a method + path; captures become params. */
export class Router {
  constructor(private readonly routes: Route[]) {}

  /** The first matching route, with its regex captures, or null. */
  match(method: string, pathname: string): { handle: RouteHandler; params: string[] } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      if (typeof route.path === 'string') {
        if (route.path === pathname) return { handle: route.handle, params: [] };
        continue;
      }

      const captured = pathname.match(route.path);
      if (captured) return { handle: route.handle, params: captured.slice(1) };
    }

    return null;
  }
}
