import { FindrParams, FindrResult, resultKey } from "./index.d";
import { escapeRegExp, evalRegex, isUpperCase } from "./utils";

export default function fnr({
  source,
  target,
  replacement = "",
  replacementKeys = [],
  metadata,
  config: {
    filterCtxMatch = (match: string) => match,
    filterCtxReplacement = (replacement: string) => replacement,
    buildResultKey,
    ctxLen = 0,
    xregexp: xre,
    isRegex = false,
    isCaseMatched = true,
    isWordMatched = false,
    isCasePreserved = false,
  } = {},
}: FindrParams) {
  const defaultFlags = ["g"];

  if (!isCaseMatched) defaultFlags.push("i");
  const _isRegex = typeof isRegex === "boolean" ? isRegex : isRegex === "true";

  if (!_isRegex && target instanceof RegExp)
    console.warn("isRegex is set to false but target of type RegExp given.");

  const isXre = xre instanceof Function;

  const regexer = isXre
    ? xre
    : function (source: string, flags: string = "") {
        return new RegExp(source, flags);
      };

  const WordLike = isXre ? `p{Letter}\\p{Number}` : `\\w\\d`;
  const UppercaseLetter = isXre ? `\\p{Uppercase_Letter}` : `[A-Z]`;

  function prepareRegExp({
    regexp,
    isWordMatched,
  }: {
    regexp: RegExp;
    isWordMatched: boolean;
  }) {
    const { source, flags } = regexp;
    return isWordMatched
      ? regexer(`(^|[^${WordLike}])(${source})(?=[^${WordLike}]|$)`, flags)
      : regexer(`()(${source})`, flags);
  }

  const rgxData = _isRegex
    ? evalRegex(target)
    : { source: escapeRegExp(target), flags: null };

  const flags = rgxData.flags
    ? [...new Set([...rgxData.flags, ...defaultFlags])]
    : defaultFlags;

  const finalRgx = regexer(rgxData.source, flags.join(""));

  const initialRgx = prepareRegExp({
    regexp: finalRgx,
    isWordMatched,
  });

  let searchIndex = 0;
  let replaceIndex = 0;
  let results: FindrResult[] = [];

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
      if (new RegExp(regexer(UppercaseLetter)).test(match[0])) {
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
      resultKey: searchPointer,
      metadata: {
        source: source,
        match: match,
        searchIndex,
        position: pos,
        groups: args,
        namedGroups,
        ...metadata,
      },
    };
    results.push(result);
    searchIndex++;
    return tmpMatch;
  });
  return { results, replaced };
}
