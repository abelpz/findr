import xre from "xregexp";

function prepareRegExp({
  regexp,
  shouldMatchWord,
}: {
  regexp: RegExp;
  shouldMatchWord: boolean;
}) {
  const { source, flags } = regexp;
  return shouldMatchWord
    ? xre(`(^|[^\\p{Letter}\\p{Number}])(${source})(?=[^\\p{Letter}]|$)`, flags)
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

interface SnrConfig {
  ctxLen?: number;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  shouldMatchWord?: boolean;
  shouldMatchCase?: boolean;
}

type pointer = string | number | Array<string>;
type metadata = { [key: string]: unknown };

interface SnrParams {
  source: string;
  target: string | RegExp;
  replacement?: string | Function;
  config?: SnrConfig;
  metadata?: metadata;
  pointers?: Array<pointer> | "all";
  buildPointer?: (index: number) => pointer;
}

interface SnrResult {
  text: string;
  pointer: pointer;
  metadata: metadata;
}

export function snr(params: SnrParams) {
  const {
    target,
    replacement = "",
    pointers = [],
    config,
    source,
    metadata: _metadata,
    buildPointer,
  } = params;

  const defaultConfig = {
    ctxLen: 10,
    isRegex: false,
    isCaseSensitive: false,
    shouldMatchWord: false,
    shouldMatchCase: false,
  };

  const _config = { ...defaultConfig, ...config };
  const { ctxLen, isRegex, shouldMatchCase, isCaseSensitive, shouldMatchWord } =
    _config;

  const defaultFlags = ["g"];

  if (isCaseSensitive) defaultFlags.push("i");
  const _isRegex = typeof isRegex === "boolean" ? isRegex : isRegex === "true";
  const _text = source;

  if (!_isRegex && target instanceof RegExp)
    console.warn("isRegex is set to false but target of type RegExp given.");

  const rgxData = _isRegex
    ? evalRegex(target)
    : { source: escapeRegExp(target), flags: null };

  const flags = rgxData.flags
    ? [...new Set([...rgxData.flags, ...defaultFlags])]
    : defaultFlags;

  const finalRgx = new RegExp(rgxData.source, flags.join(""));
  const initialRgx = prepareRegExp({
    regexp: finalRgx,
    shouldMatchWord,
  });

  let searchIndex = 0;
  let replaceIndex = 0;
  let results: SnrResult[] = [];

  const matchCase = (target: string) =>
    target[0].toUpperCase() + target.slice(1);

  const replaced = _text.replace(initialRgx, function (...args) {
    const containsGroup = typeof args[args.length - 1] === "object";
    const namedGroups = containsGroup ? args.pop() : undefined;
    const text = args.pop();
    const pos = args.pop();
    const initialMatch = args.shift();
    const auxMatch = args.shift();
    const finalMatch = args.shift();
    const shouldTransform =
      shouldMatchCase && xre.test(finalMatch[0], xre("\\p{Uppercase_Letter}"));
    const _replacement = function () {
      if (typeof replacement === "function") {
        const rep = replacement({
          index: replaceIndex,
          match: finalMatch,
          groups: args,
          position: pos + auxMatch.length,
          source: text,
          namedGroups,
        });

        return shouldTransform ? matchCase(rep) : rep;
      }
      if (typeof replacement === "string") {
        return shouldTransform ? matchCase(replacement) : replacement;
      }
      throw new Error(
        "Replacement string should be of type string or function."
      );
    };

    const replaced = finalMatch.replace(finalRgx, _replacement);

    const _replacePointer = buildPointer
      ? buildPointer(replaceIndex)
      : replaceIndex;
    replaceIndex++;
    if (pointers === "all" || pointers.includes(_replacePointer)) {
      return auxMatch + replaced;
    }

    const ctxBefore = text.slice(pos - ctxLen, pos);
    const ctxAfter = text.slice(
      pos + initialMatch.length,
      pos + initialMatch.length + ctxLen
    );

    const _searchPointer = buildPointer
      ? buildPointer(searchIndex)
      : searchIndex;
    const result = {
      text: ctxBefore + initialMatch + replaced + ctxAfter,
      pointer: _searchPointer,
      metadata: {
        match: finalMatch,
        searchIndex,
        ..._metadata,
      },
    };
    results.push(result);
    searchIndex++;
    return initialMatch;
  });
  return { results, replaced };
}
