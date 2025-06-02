// packages/backend/src/index.ts
import { spawn } from "child_process";
import path from "path";
import os from "os";
async function cmdExec(child) {
  let output = "";
  child.stdout.on("data", (data) => {
    output += data.toString();
  });
  let error = "";
  child.stderr.on("data", (data) => {
    error += data.toString();
  });
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });
  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return output;
}
var raceSinglePacket = async (sdk, context) => {
  if (context.type !== "RequestContext" || context.type !== "RequestRowContext" || !context.request.id) {
    sdk.console.log("raceSinglePacket: Invalid context type or missing request ID.");
  }
  const req = await sdk.requests.get(context.request.id);
  const baseSpec = req.request.getRaw().toText();
  sdk.console.log(`raceSinglePacket: Base request spec: ${btoa(baseSpec)}`);
  const platform2 = os.platform();
  const arch = os.arch();
  sdk.console.log(`raceSinglePacket: Platform: ${platform2}, Arch: ${arch}`);
  if (platform2 === "win32") {
    const filePath = path.join(sdk.meta.assetsPath(), "race-win.exe");
    const child = spawn(
      filePath,
      [btoa(baseSpec)]
    );
    const result = await cmdExec(child);
    sdk.console.log(`raceSinglePacket: chmod exec result: ${result}`);
    return result;
  }
  if (arch !== "x64") {
    const filePath = path.join(sdk.meta.assetsPath(), "race-arm64");
    const chmodExec = spawn("chmod", ["+x", filePath]);
    const chmodResult = await cmdExec(chmodExec);
    sdk.console.log(`raceSinglePacket: chmod exec result: ${chmodResult}`);
    sdk.console.log(`raceSinglePacket: File path: ${filePath}`);
    const child = spawn(
      filePath,
      [btoa(baseSpec)]
    );
    const result = await cmdExec(child);
    sdk.console.log(`raceSinglePacket: Result: ${result}`);
    return result;
  } else {
    const filePath = path.join(sdk.meta.assetsPath(), "race-x64");
    const chmodExec = spawn("chmod", ["+x", filePath]);
    const chmodResult = await cmdExec(chmodExec);
    sdk.console.log(`raceSinglePacket: chmod exec result: ${chmodResult}`);
    sdk.console.log(`raceSinglePacket: File path: ${filePath}`);
    const child = spawn(
      filePath,
      [btoa(baseSpec)]
    );
    const result = await cmdExec(child);
    sdk.console.log(`raceSinglePacket: Result: ${result}`);
    return result;
  }
};
function init(sdk) {
  sdk.api.register("raceSinglePacket", raceSinglePacket);
}
export {
  init
};
