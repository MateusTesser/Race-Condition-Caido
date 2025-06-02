const https = require("https");
const { RequestSpec } = require("caido:utils");
const rawB64 = process.argv[2];
const raw = Buffer.from(rawB64, "base64");
const spec = RequestSpec.parse(raw);

// monta opções
const body = spec.getBody()?.toText() || "";
const url = new URL(`${spec.getTls()?"https":"http"}://${spec.getHost()}:${spec.getPort()||80}${spec.getPath()}${spec.getQuery()||""}`);
const opts = {
  protocol: url.protocol,
  hostname: url.hostname,
  port: url.port,
  path: url.pathname + url.search,
  method: spec.getMethod(),
  headers: {
    ...spec.getHeaders(),
    "Content-Length": Buffer.byteLength(body),
    Connection: "keep-alive"
  },
  agent: new https.Agent({ keepAlive: true, maxSockets: 50 })
};

(async () => {
  const N = 50, results = [];
  for (let i = 0; i < N; i++) {
    results.push(new Promise((res, rej) => {
      const r = https.request(opts, s => {
        let d = "";
        s.on("data", c => d += c);
        s.on("end", () => res({ status: s.statusCode, body: d }));
      }).on("error", rej);
      if (body) r.write(body);
      r.end();
    }));
  }
  const out = await Promise.allSettled(results);
  console.log(JSON.stringify(out.map(r =>
    r.status==="fulfilled" ? r.value : { status:0,body:String(r.reason) }
  )));
})();