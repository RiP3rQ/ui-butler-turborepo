module.exports = {
  includeDirs: ["libs/proto/src/proto"],
  outDir: "libs/proto/src/generated",
  options: {
    useOptionals: true,
    outputServices: true,
    outputServices: "generic-definitions",
    useDate: true,
    useObjectId: true,
    useToJSON: true,
  },
};
