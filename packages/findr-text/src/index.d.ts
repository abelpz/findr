export interface FindrConfig {
  // TODO: Add config to make use of xregexp optional
  ctxLen?: number;
  /** function for wrapping or transforming the matched word in context.*/
  filterCtxMatch?: (match: string) => string;
  /** function for wrapping or transforming the replacement word in context.*/
  filterCtxReplacement?: (replacement: string) => string;
  buildResultKey?: (index: number) => resultKey;
  xregexp?: Function;
  isRegex?: boolean;
  isCaseMatched?: boolean;
  isWordMatched?: boolean;
  isCasePreserved?: boolean;
}

export type resultKey = string | number;
export type metadata = { [key: string]: unknown };

export interface FindrParams {
  source: string;
  target: string | RegExp;
  replacement?: string | Function;
  contextLength?: number;
  replacementKeys?: Array<resultKey> | string;
  metadata?: metadata;
  config: FindrConfig;
}

export interface FindrResult {
  context: string;
  extContext: string;
  resultKey: resultKey;
  metadata: metadata;
}
