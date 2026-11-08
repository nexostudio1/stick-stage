/**
 * Render one short cut from long footage (the `ShortFromFootage` composition).
 *
 *   pnpm tsx scripts/short.ts <props-<id>.json> [--draft] [--out out/x.mp4] [--frames=a-b]
 *
 * Props come from `packages/shorts` (`shorts props`). When `src` is a local file, it is served
 * over HTTP for the render, since the composition loads video by URL.
 */
import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT } from "./lib/tools";

const args = process.argv.slice(2);
const propsPath = args.find((a) => !a.startsWith("--"));
if (!propsPath) {
  console.error("usage: pnpm tsx scripts/short.ts <props.json> [--draft] [--out file] [--frames=a-b]");
  process.exit(1);
}
const draft = args.includes("--draft");
const outArg = args.includes("--out") ? args[args.indexOf("--out") + 1] : undefined;
const framesArg = args.find((a) => a.startsWith("--frames="))?.slice(9);
const props = JSON.parse(fs.readFileSync(propsPath, "utf8"));

/** Serve one file with Range support; resolves to its URL. */
const serveFile = (file: string): Promise<{ url: string; close: () => void }> =>
  new Promise((resolve) => {
    const size = fs.statSync(file).size;
    const server = http.createServer((req, res) => {
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? "");
      const start = m?.[1] ? Number(m[1]) : 0;
      const end = m?.[2] ? Number(m[2]) : size - 1;
      res.writeHead(m ? 206 : 200, {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        ...(m ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
        "Access-Control-Allow-Origin": "*",
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({ url: `http://127.0.0.1:${port}/${encodeURIComponent(path.basename(file))}`, close: () => server.close() });
    });
  });

const main = async () => {
  let close = () => {};
  if (!/^https?:/.test(props.src)) {
    const served = await serveFile(path.resolve(props.src));
    props.src = served.url;
    close = served.close;
  }
  const out = path.resolve(outArg && !outArg.startsWith("--") ? outArg : path.join(ROOT, "out", "shorts", `${props.id}${draft ? "-draft" : ""}.mp4`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/app/index.ts"), publicDir: path.join(ROOT, "public") });
  const composition = await selectComposition({ serveUrl, id: "ShortFromFootage", inputProps: props });
  const frameRange = framesArg ? (framesArg.split("-").map(Number) as [number, number]) : undefined;
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    inputProps: props,
    codec: "h264",
    outputLocation: out,
    frameRange,
    ...(draft ? { scale: 0.5, x264Preset: "ultrafast" as const } : { crf: 18 }),
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) process.stdout.write(`${(last = pct)}% `);
    },
  });
  process.stdout.write("\n");
  close();
  console.log(out);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
