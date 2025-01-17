// libs/proto/scripts/generate-protos.ts
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

async function generateProtos() {
  const protoDir = path.join(__dirname, "../src/proto");
  const outDir = path.join(__dirname, "../src/generated");

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

  // Use protoc from node_modules
  const protocPath = path.join(
    "../../../..", // Navigate up to monorepo root,
    "node_modules",
    "protoc",
    "protoc",
    "bin",
    process.platform === "win32" ? "protoc.exe" : "protoc",
  );

  const tsProtoPath = path.join(
    "../../../..", // Navigate up to monorepo root,
    "node_modules",
    ".bin",
    process.platform === "win32"
      ? "protoc-gen-ts_proto.cmd"
      : "protoc-gen-ts_proto",
  );

  // Add path existence checks
  if (!fs.existsSync(protocPath)) {
    console.error(`protoc not found at: ${protocPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(tsProtoPath)) {
    console.error(`protoc-gen-ts_proto not found at: ${tsProtoPath}`);
    process.exit(1);
  }

  const command = [
    `"${protocPath}"`,
    `--plugin=protoc-gen-ts_proto="${tsProtoPath}"`,
    `--ts_proto_out="${outDir}"`,
    "--ts_proto_opt=nestJs=true,useOptionals=true,outputServices=grpc-nest,outputClientImpl=false,outputTypeRegistry=true",
    `--proto_path="${protoDir}"`,
    ...protoFiles.map((file) => `"${file}"`),
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
