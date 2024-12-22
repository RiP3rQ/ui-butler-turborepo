// libs/proto/scripts/generate-protos.ts
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

async function generateProtos() {
  const protoDir = path.join(__dirname, "../src/proto-definitions/v1");
  const outDir = path.join(__dirname, "../src/generated");
  const protoPath = path.join(__dirname, "../src/proto-definitions");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Get all proto files
  const protoFiles = fs
    .readdirSync(protoDir)
    .filter((file) => file.endsWith(".proto"))
    .map((file) => path.join(protoDir, file));

  if (protoFiles.length === 0) {
    console.error("No proto files found!");
    process.exit(1);
  }

  const command = [
    "protoc",
    `--plugin=protoc-gen-ts_proto=.\\node_modules\\.bin\\protoc-gen-ts_proto.cmd`,
    `--ts_proto_out=${outDir}`,
    "--ts_proto_opt=nestJs=true,useOptionals=true",
    `--proto_path=${protoPath}`,
    protoFiles.join(" "),
  ].join(" ");

  try {
    console.log("Executing command:", command);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log("Proto files generated successfully!");
  } catch (error) {
    console.error("Error generating proto files:", error);
    process.exit(1);
  }
}

generateProtos();
