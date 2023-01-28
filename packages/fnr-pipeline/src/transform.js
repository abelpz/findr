import {
  PerfRenderFromJson,
  transforms,
  mergeActions,
} from "proskomma-json-tools";
import fnr from "@findr/text";

const findAndReplaceActions = {
  startDocument: [
    {
      description: "setup",
      test: () => true,
      action: (params) => {
        const { workspace, output, context } = params;
        workspace.bookCode = context.document.metadata.document.bookCode;
        workspace.chapter = null;
        workspace.verses = null;
        output.results = [];
        return true;
      },
    },
  ],
  text: [
    {
      description: "add-to-text",
      test: () => true,
      action: ({ config, context, workspace, output }) => {
        try {
          const {
            target,
            replacement,
            replacementKeys = [],
            config: _config = {},
          } = config;

          const _text = context.sequences[0].element.text;
          const { chapter, verses, bookCode } = workspace;

          const { results, replaced } = fnr({
            source: _text,
            target,
            replacement,
            replacementKeys: replacementKeys,
            metadata: { chapter, verses, bookCode },
            config: {
              buildResultKey: (index) =>
                `${index}-${bookCode}-${chapter}-${verses}`,
              ..._config,
            },
          });
          output.results.push(...results);
          workspace.outputContentStack[0].push(replaced);
          if (!verses) return true;
          return false;
        } catch (err) {
          console.error(err);
          throw err;
        }
      },
    },
  ],
  mark: [
    {
      description: "mark-chapters",
      test: ({ context }) => context.sequences[0].element.subType === "chapter",
      action: ({ context, workspace }) => {
        const element = context.sequences[0].element;
        workspace.chapter = element.atts["number"];
        workspace.verses = 0;
        return true;
      },
    },
    {
      description: "mark-verses",
      test: ({ context }) => context.sequences[0].element.subType === "verses",
      action: ({ context, workspace }) => {
        const element = context.sequences[0].element;
        workspace.verses = element.atts["number"];
        return true;
      },
    },
  ],
};

const findAndReplaceCode = function ({ perf, params }) {
  const cl = new PerfRenderFromJson({
    srcJson: perf,
    actions: mergeActions([
      findAndReplaceActions,
      transforms.perf2perf.identityActions,
    ]),
  });
  const output = {};
  cl.renderDocument({
    docId: "",
    config: {
      ...params,
    },
    output,
  });
  return { perf: output.perf, results: output.results }; // identityActions currently put PERF directly in output
};

const findAndReplace = {
  name: "findAndReplace",
  type: "Transform",
  description: "Search and replace text in stripped perf",
  inputs: [
    {
      name: "perf",
      type: "json",
      source: "",
    },
    {
      name: "params",
      type: "json",
      source: "",
    },
  ],
  outputs: [
    {
      name: "results",
      type: "json",
    },
  ],
  code: findAndReplaceCode,
};
export default findAndReplace;
