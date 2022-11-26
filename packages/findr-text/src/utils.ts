import xre from "xregexp";

const isXre = xre instanceof Function;

export const regexer = isXre
  ? xre
  : function (source: string, flags: string = "") {
      return new RegExp(source, flags);
    };

export const WordLike = isXre ? `p{Letter}\\p{Number}` : `\\w\\d`;
export const UppercaseLetter = isXre ? `\\p{Uppercase_Letter}` : `[A-Z]`;

export function prepareRegExp({
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

export function escapeRegExp(string: string | RegExp) {
  const _string = string instanceof RegExp ? string.source : string;
  return _string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function evalRegex(source: string | RegExp) {
  if (source instanceof RegExp) return source;
  if (typeof source !== "string")
    throw new Error("Arg `source` shoud be of type string or RegExp");
  const results = source.match(/\/(.+)\/(?=(\w*$))/);
  if (!results?.[1]) return { source };
  return { source: results[1], flags: results[2] };
}

export function isUpperCase(input: string) {
  return input.toUpperCase() === input && input.toLowerCase() !== input;
}
