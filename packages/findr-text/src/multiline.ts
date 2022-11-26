import { findr } from "./findr";
import { FindrResult } from "./findr.d";
import { FindrMultiLineParams } from "./multiline.d";

export function findrMultiLine(params: FindrMultiLineParams) {
  const { source, metadata, config = {} } = params;
  const { buildResultKey } = config;
  const _source = source.split("\n");
  let _results: FindrResult[] = [];
  let _replaced: string[] = [];
  _source.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const _buildResultKey = buildResultKey
      ? (index: number) => buildResultKey(index, lineNumber)
      : (index: number) => _results.length + index;
    const _metadata = { ...metadata, lineNumber };
    const { results, replaced } = findr({
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
