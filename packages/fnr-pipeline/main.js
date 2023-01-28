import findrPipeline from "./src/pipeline";
import findrTransform from "./src/transform";

export default {
  pipelines: { findAndReplace: findrPipeline },
  transforms: { findAndReplace: findrTransform },
};
