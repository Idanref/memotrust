/** The HTTP layer's contracts: routes are data, handlers are functions. */

/** The HTTP methods memotrust's API uses. */
export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
}

/** What a handler receives: regex captures and the parsed JSON body. */
export interface RouteContext {
  params: string[];
  payload: Record<string, any>;
}

/** What a handler returns; the composition root sends it. */
export interface RouteResult {
  code: number;
  body: unknown;
  contentType?: string;
}

/** One endpoint's logic — a plain function, no controller classes. */
export type RouteHandler = (context: RouteContext) => RouteResult | Promise<RouteResult>;

/** One row of the route table: method + path (exact or pattern) + handler. */
export interface Route {
  method: HttpMethod;
  path: string | RegExp;
  handle: RouteHandler;
}
