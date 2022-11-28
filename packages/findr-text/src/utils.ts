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
