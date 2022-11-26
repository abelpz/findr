// TODO: Split code into different files

import xre from "xregexp";
import { isUpperCase } from "./utils";

function prepareRegExp({
  regexp,
  isWordMatched,
}: {
  regexp: RegExp;
  isWordMatched: boolean;
}) {
  const { source, flags } = regexp;
  return isWordMatched
    ? xre(
        `(^|[^\\p{Letter}\\p{Number}])(${source})(?=[^\\p{Letter}\\p{Number}]|$)`,
        flags
      )
    : xre(`()(${source})`, flags);
}

function escapeRegExp(string: string | RegExp) {
  const _string = string instanceof RegExp ? string.source : string;
  return _string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function evalRegex(source: string | RegExp) {
  if (source instanceof RegExp) return source;
  if (typeof source !== "string")
    throw new Error("Arg `source` shoud be of type string or RegExp");
  const results = source.match(/\/(.+)\/(?=(\w*$))/);
  if (!results?.[1]) return { source };
  return { source: results[1], flags: results[2] };
}

export interface SnrConfig {
  // TODO: Add config to make use of xregexp optional
  ctxLen?: number;
  /** function for wrapping or transforming the matched word in context.*/
  filterCtxMatch?: (match: string) => string;
  /** function for wrapping or transforming the replacement word in context.*/
  filterCtxReplacement?: (replacement: string) => string;
  buildResultKey?: (index: number) => resultKey;
  isRegex?: boolean;
  isCaseMatched?: boolean;
  isWordMatched?: boolean;
  isCasePreserved?: boolean;
}

export type resultKey = string | number;
export type metadata = { [key: string]: unknown };

export interface SnrParams {
  source: string;
  target: string | RegExp;
  replacement?: string | Function;
  contextLength?: number;
  replacementKeys?: Array<resultKey> | string;
  metadata?: metadata;
  config: SnrConfig;
}

export interface SnrResult {
  context: string;
  resultKey: resultKey;
  metadata: metadata;
  source: string;
}

export function snr({
  source,
  target,
  replacement = "",
  replacementKeys = [],
  metadata,
  config: {
    filterCtxMatch = (match: string) => `[-${match}]`,
    filterCtxReplacement = (replacement: string) => `[+${replacement}]`,
    buildResultKey,
    ctxLen = 0,
    isRegex = false,
    isCaseMatched = true,
    isWordMatched = false,
    isCasePreserved = false,
  },
}: SnrParams) {
  const defaultFlags = ["g"];

  if (!isCaseMatched) defaultFlags.push("i");
  const _isRegex = typeof isRegex === "boolean" ? isRegex : isRegex === "true";

  if (!_isRegex && target instanceof RegExp)
    console.warn("isRegex is set to false but target of type RegExp given.");

  const rgxData = _isRegex
    ? evalRegex(target)
    : { source: escapeRegExp(target), flags: null };

  const flags = rgxData.flags
    ? [...new Set([...rgxData.flags, ...defaultFlags])]
    : defaultFlags;

  const finalRgx = xre(rgxData.source, flags.join(""));

  const initialRgx = prepareRegExp({
    regexp: finalRgx,
    isWordMatched,
  });

  let searchIndex = 0;
  let replaceIndex = 0;
  let results: SnrResult[] = [];

  const replaced = source.replace(initialRgx, function (...args) {
    const containsGroup = typeof args[args.length - 1] === "object";
    const namedGroups = containsGroup ? args.pop() : undefined;
    const source = args.pop();
    const tmpPos = args.pop();
    const tmpMatch = args.shift();
    const auxMatch = args.shift();
    const pos = tmpPos + auxMatch.length;
    const match: string = args.shift();

    const replacementCB = function (): string {
      if (typeof replacement === "function") {
        const rep = replacement({
          index: replaceIndex,
          match,
          groups: args,
          position: pos,
          source,
          namedGroups,
        });
        return rep;
      }
      if (typeof replacement === "string") {
        return replacement;
      }
      throw new Error(
        "Replacement param should be of type string or function."
      );
    };

    const r = replacementCB();

    const evaluateCase = (match: string, replaced: string) => {
      //TODO: Add callback to allow users to make their own case evaluation;
      if (!isCasePreserved) return replaced;
      if (isUpperCase(match)) {
        return replaced.toUpperCase();
      }
      if (xre.test(match[0], xre("\\p{Uppercase_Letter}"))) {
        return replaced[0].toUpperCase() + replaced.slice(1);
      }
      return replaced;
    };

    const replaced = evaluateCase(match, match.replace(finalRgx, r));

    const replacePointer: resultKey = buildResultKey
      ? buildResultKey(replaceIndex)
      : replaceIndex;
    replaceIndex++;
    if (
      replacementKeys === "all" ||
      replacementKeys.includes(replacePointer as string)
    ) {
      return auxMatch + replaced;
    }

    const ctxBefore = source.slice(pos - ctxLen, pos);
    const ctxAfter = source.slice(
      pos + match.length,
      pos + match.length + ctxLen
    );

    const extCtxBefore = source.slice(0, pos);
    const extCtxAfter = source.slice(pos + match.length, -1);

    const ctxMatch = filterCtxMatch ? filterCtxMatch(match) : match;
    const ctxtReplacement = filterCtxReplacement
      ? filterCtxReplacement(replaced)
      : replaced;

    const searchPointer = buildResultKey
      ? buildResultKey(searchIndex)
      : searchIndex;
    const result = {
      context: ctxBefore + ctxMatch + ctxtReplacement + ctxAfter,
      extContext: extCtxBefore + ctxMatch + ctxtReplacement + extCtxAfter,
      source: source,
      resultKey: searchPointer,
      metadata: {
        match: match,
        searchIndex,
        ...metadata,
      },
    };
    results.push(result);
    searchIndex++;
    return tmpMatch;
  });
  return { results, replaced };
}

export interface SnrMultiLineConfig extends Omit<SnrConfig, "buildResultKey"> {
  buildResultKey?: (index: number, lineNumber: number) => resultKey;
}

export interface SnrMultiLineParams extends Omit<SnrParams, "config"> {
  config?: SnrMultiLineConfig;
}

export function snrMultiLine(params: SnrMultiLineParams) {
  const { source, metadata, config = {} } = params;
  const { buildResultKey } = config;
  const _source = source.split("\n");
  let _results: SnrResult[] = [];
  let _replaced: string[] = [];
  _source.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const _buildResultKey = buildResultKey
      ? (index: number) => buildResultKey(index, lineNumber)
      : (index: number) => _results.length + index;
    const _metadata = { ...metadata, lineNumber };
    const { results, replaced } = snr({
      ...params,
      metadata: _metadata,
      source: line,
      config: { ...config, buildResultKey: _buildResultKey },
    });
    if (results.length) {
      _results = _results.concat(results);
    }
    _replaced.push(replaced);
  });
  return {
    results: _results,
    replaced: _replaced.join("\n"),
  };
}
