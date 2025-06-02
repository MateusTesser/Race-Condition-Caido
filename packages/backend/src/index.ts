
import { RequestSpec } from "caido:utils";
import { SDK, DefineAPI } from "caido:plugin";
import { CommandContext } from "@caido/sdk-frontend/src/types/commands";
import { spawn } from "child_process";
import path from "path";
import os, { platform } from "os"

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

const raceSinglePacket = async (sdk: SDK, context: CommandContext) => {
  if (context.type !== "RequestContext" || context.type !== "RequestRowContext" || !context.request.id) {
    sdk.console.log("raceSinglePacket: Invalid context type or missing request ID.");
  }
  const req = await sdk.requests.get(context.request.id);
  const baseSpec = req.request.getRaw().toText();
  sdk.console.log(`raceSinglePacket: Base request spec: ${btoa(baseSpec)}`);
  const platform = os.platform();
  const arch = os.arch();
  sdk.console.log(`raceSinglePacket: Platform: ${platform}, Arch: ${arch}`);
  if (platform === "win32") {
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

export type API = DefineAPI<{
  raceSinglePacket: typeof raceSinglePacket;
}>;

export function init(sdk: SDK<API>) {
  sdk.api.register("raceSinglePacket", raceSinglePacket);
}