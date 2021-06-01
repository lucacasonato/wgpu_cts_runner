import { DefaultTestFileLoader } from "./cts/out/common/framework/file_loader.js";
import { Logger } from "./cts/out/common/framework/logging/logger.js";
import { parseQuery } from "./cts/out/common/framework/query/parseQuery.js";
import { assert, unreachable } from "./cts/out/common/framework/util/util.js";
import { parseExpectationsForTestQuery } from "./cts/out/common/framework/query/query.js";

function printResults(results) {
  for (const [name, r] of results) {
    console.log(`[${r.status}] ${name} (${r.timems}ms). Log:`);
    if (r.logs) {
      for (const l of r.logs) {
        console.log("  - " + l.toJSON().replace(/\n/g, "\n    "));
      }
    }
  }
}

let verbose = true;
let trace = false;
let debug = false;
let ignoreFile = undefined;
let printJSON = false;
let loadWebGPUExpectations = undefined;
let ignores = [];

const queries = ["webgpu:api,*"];

try {
  const loader = new DefaultTestFileLoader();
  assert(
    queries.length === 1,
    "currently, there must be exactly one query on the cmd line",
  );
  const filterQuery = parseQuery(queries[0]);
  const testcases = await loader.loadCases(filterQuery);
  const expectations = parseExpectationsForTestQuery(
    await (loadWebGPUExpectations ?? []),
    filterQuery,
  );

  const log = new Logger(debug);

  const failed = [];
  const warned = [];
  const skipped = [];
  const ignored = [];

  let total = 0;

  for (const testcase of testcases) {
    total++;
    const name = testcase.query.toString();
    if (ignores.includes(name)) {
      ignored.push(name);
      continue;
    }
    if (verbose) {
      console.log(`Starting ${name}`);
    }
    if (trace) {
      const traceDir = `./trace/${name}`;
      await Deno.mkdir(traceDir, { recursive: true });
      Deno.env.set("DENO_WEBGPU_TRACE", traceDir);
    }
    const [rec, res] = log.record(name);
    await testcase.run(rec, expectations);

    if (verbose) {
      printResults([[name, res]]);
    }

    switch (res.status) {
      case "pass":
        break;
      case "fail":
        failed.push([name, res]);
        break;
      case "warn":
        warned.push([name, res]);
        break;
      case "skip":
        skipped.push([name, res]);
        break;
      default:
        unreachable("unrecognized status");
    }
  }

  assert(total > 0, "found no tests!");

  // TODO: write results out somewhere (a file?)
  if (printJSON) {
    console.log(log.asJSON(2));
  }

  if (skipped.length) {
    console.log("");
    console.log("** Skipped **");
    printResults(skipped);
  }
  if (warned.length) {
    console.log("");
    console.log("** Warnings **");
    printResults(warned);
  }
  if (failed.length) {
    console.log("");
    console.log("** Failures **");
    printResults(failed);
  }

  const passed = total - warned.length - failed.length - skipped.length;
  const pct = (x) => ((100 * x) / total).toFixed(2);
  const rpt = (x) => {
    const xs = x.toString().padStart(1 + Math.log10(total), " ");
    return `${xs} / ${total} = ${pct(x).padStart(6, " ")}%`;
  };
  console.log("");
  console.log(`** Summary **
Passed  w/o warnings = ${rpt(passed)}
Passed with warnings = ${rpt(warned.length)}
Skipped              = ${rpt(skipped.length)}
Failed               = ${rpt(failed.length)}
Ignored              = ${rpt(ignored.length)}`);

  if (failed.length || warned.length) {
    Deno.exit(1);
  }
} catch (ex) {
  console.log(ex);
  Deno.exit(1);
}
