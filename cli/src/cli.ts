#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { resolve, basename, join, extname } from "node:path";
import { Command } from "commander";
import kleur from "kleur";
import {
  forge,
  formatSkillMarkdown,
  VERSION,
  type Fact,
  type ProgressEvent,
} from "./index.js";

const program = new Command();

program
  .name("skforge")
  .description(
    "Compile scattered company knowledge into Claude Agent Skills (SKILL.md files). Published as @skforge/cli on npm."
  )
  .version(VERSION);

program
  .command("extract")
  .description(
    "Extract a SKILL.md from a single input file (or stdin with -). The output goes to stdout by default, or to --output."
  )
  .argument(
    "<input>",
    "Path to the input file, or '-' to read from stdin"
  )
  .option("-o, --output <path>", "Write SKILL.md to a file instead of stdout")
  .option(
    "-d, --output-dir <dir>",
    "Write to <dir>/<skill-name>/SKILL.md (Claude Code skill folder layout)"
  )
  .option(
    "--hint <text>",
    "A short hint about the input (e.g. 'A Slack thread about deploys')"
  )
  .option(
    "--api-key <key>",
    "Anthropic API key (overrides ANTHROPIC_API_KEY env var)"
  )
  .option("--facts-only", "Output the extracted facts (JSON) instead of the skill")
  .option("--quiet", "Suppress progress output to stderr")
  .option(
    "--extract-model <model>",
    "Model for fact extraction (default: claude-haiku-4-5-20251001)"
  )
  .option(
    "--synthesis-model <model>",
    "Model for skill synthesis (default: claude-opus-4-7)"
  )
  .action(async (input: string, opts: ExtractOpts) => {
    try {
      const text = await readInput(input);
      const result = await runForge(text, opts);
      await writeResult(result, opts);
    } catch (err) {
      err_(err);
      process.exit(1);
    }
  });

program
  .command("batch")
  .description(
    "Extract skills from every supported file in a directory. Writes a Claude Code skills folder layout."
  )
  .argument("<input-dir>", "Directory containing source files")
  .option(
    "-o, --output-dir <dir>",
    "Output directory (defaults to ./skills)",
    "./skills"
  )
  .option(
    "--api-key <key>",
    "Anthropic API key (overrides ANTHROPIC_API_KEY env var)"
  )
  .option(
    "--ext <extensions>",
    "Comma-separated list of file extensions to include",
    ".md,.txt,.markdown"
  )
  .option("--hint <text>", "A short hint applied to all files")
  .option("--quiet", "Suppress per-file progress output")
  .action(async (inputDir: string, opts: BatchOpts) => {
    try {
      await runBatch(inputDir, opts);
    } catch (err) {
      err_(err);
      process.exit(1);
    }
  });

program
  .command("describe")
  .description("Print info about an input — chars, line count, suggested hint.")
  .argument("<input>", "Path to the input file, or '-' for stdin")
  .action(async (input: string) => {
    try {
      const text = await readInput(input);
      const lines = text.split("\n").length;
      const chars = text.length;
      const words = text.split(/\s+/).filter(Boolean).length;
      const cost = estimateCost(chars);
      info_("Input report:");
      console.log(`  ${kleur.bold("Chars:")}    ${chars.toLocaleString()}`);
      console.log(`  ${kleur.bold("Words:")}    ${words.toLocaleString()}`);
      console.log(`  ${kleur.bold("Lines:")}    ${lines.toLocaleString()}`);
      console.log(`  ${kleur.bold("Est cost:")} ~$${cost.toFixed(3)}`);
      const hint = guessHint(text);
      if (hint) {
        console.log(`  ${kleur.bold("Hint:")}     ${kleur.cyan(hint)}`);
      }
    } catch (err) {
      err_(err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);

interface ExtractOpts {
  output?: string;
  outputDir?: string;
  hint?: string;
  apiKey?: string;
  factsOnly?: boolean;
  quiet?: boolean;
  extractModel?: string;
  synthesisModel?: string;
}

interface BatchOpts {
  outputDir: string;
  apiKey?: string;
  ext: string;
  hint?: string;
  quiet?: boolean;
}

async function readInput(input: string): Promise<string> {
  if (input === "-") {
    return await readStdin();
  }
  const path = resolve(input);
  return await readFile(path, "utf8");
}

async function readStdin(): Promise<string> {
  return await new Promise((res, rej) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => res(data));
    process.stdin.on("error", rej);
  });
}

async function runForge(text: string, opts: ExtractOpts) {
  const quiet = opts.quiet ?? false;
  const t0 = Date.now();

  const onProgress = (event: ProgressEvent) => {
    if (quiet) return;
    if (event.type === "stage" && event.stage === "extracting") {
      info_("Extracting facts…");
    } else if (event.type === "stage" && event.stage === "synthesizing") {
      info_("Compiling SKILL.md…");
    } else if (event.type === "fact") {
      const f = event.fact;
      process.stderr.write(
        kleur.dim("  · ") +
          factTypeColor(f.type)(`[${f.type}]`) +
          " " +
          truncate(f.statement, 80) +
          kleur.dim(` (${Math.round(f.confidence * 100)}%)\n`)
      );
    }
  };

  const result = await forge(text, {
    apiKey: opts.apiKey,
    hint: opts.hint,
    extractModel: opts.extractModel,
    synthesisModel: opts.synthesisModel,
    onProgress,
  });

  if (!quiet) {
    const ms = Date.now() - t0;
    info_(
      `Done · ${result.facts.length} facts → ${kleur.bold(
        result.skill.name
      )} in ${ms}ms`
    );
  }
  return result;
}

async function writeResult(
  result: Awaited<ReturnType<typeof runForge>>,
  opts: ExtractOpts
) {
  if (opts.factsOnly) {
    const json = JSON.stringify(
      { topic: result.topic, facts: result.facts },
      null,
      2
    );
    if (opts.output) {
      await writeFile(opts.output, json + "\n", "utf8");
    } else {
      process.stdout.write(json + "\n");
    }
    return;
  }

  const md = formatSkillMarkdown(result.skill);
  if (opts.outputDir) {
    const dir = join(opts.outputDir, result.skill.name);
    await mkdir(dir, { recursive: true });
    const path = join(dir, "SKILL.md");
    await writeFile(path, md, "utf8");
    if (!opts.quiet) info_(`Wrote ${kleur.bold(path)}`);
    return;
  }

  if (opts.output) {
    await writeFile(opts.output, md, "utf8");
    if (!opts.quiet) info_(`Wrote ${kleur.bold(opts.output)}`);
  } else {
    process.stdout.write(md);
  }
}

async function runBatch(inputDir: string, opts: BatchOpts) {
  const dir = resolve(inputDir);
  const exts = opts.ext.split(",").map((s) => s.trim().toLowerCase());
  const entries = await readdir(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = await stat(full);
    if (!st.isFile()) continue;
    if (!exts.includes(extname(entry).toLowerCase())) continue;
    files.push(full);
  }
  if (files.length === 0) {
    info_(`No files matched in ${dir} (extensions: ${exts.join(", ")})`);
    return;
  }
  info_(`Processing ${files.length} file${files.length === 1 ? "" : "s"}…`);

  const results: { file: string; skill: string; facts: number }[] = [];
  for (const file of files) {
    const name = basename(file);
    process.stderr.write(kleur.cyan("\n→ ") + name + "\n");
    try {
      const text = await readFile(file, "utf8");
      const result = await runForge(text, {
        apiKey: opts.apiKey,
        hint: opts.hint,
        quiet: opts.quiet,
      });
      const skillDir = join(opts.outputDir, result.skill.name);
      await mkdir(skillDir, { recursive: true });
      await writeFile(
        join(skillDir, "SKILL.md"),
        formatSkillMarkdown(result.skill),
        "utf8"
      );
      results.push({
        file: name,
        skill: result.skill.name,
        facts: result.facts.length,
      });
    } catch (err) {
      err_(err, `  failed: ${name}`);
    }
  }

  console.log("");
  info_(
    `${kleur.bold(results.length.toString())} skill${
      results.length === 1 ? "" : "s"
    } written to ${kleur.bold(opts.outputDir)}`
  );
  for (const r of results) {
    console.log(
      kleur.dim("  ") +
        r.skill.padEnd(40) +
        kleur.dim(`${r.facts} facts · from ${r.file}`)
    );
  }
}

function info_(msg: string) {
  process.stderr.write(kleur.cyan("✦") + " " + msg + "\n");
}

function err_(err: unknown, prefix?: string) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(kleur.red("✖") + " " + (prefix ? prefix + ": " : "") + message + "\n");
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function factTypeColor(type: Fact["type"]): (s: string) => string {
  switch (type) {
    case "constraint":
      return kleur.yellow;
    case "decision":
      return kleur.green;
    case "policy":
      return kleur.blue;
    case "procedure":
      return kleur.magenta;
    case "person":
      return kleur.red;
    case "system":
      return kleur.cyan;
    default:
      return (s: string) => s;
  }
}

function estimateCost(chars: number): number {
  // Rough: ~4 chars per token, Haiku $0.80/M input + $4/M output, Opus $15/M input + $75/M output
  // Extraction: input ≈ chars/4, output ≈ 200 tokens (Haiku)
  // Synthesis: input ≈ 1000 tokens, output ≈ 1500 tokens (Opus)
  const haikuIn = (chars / 4 / 1_000_000) * 0.8;
  const haikuOut = (200 / 1_000_000) * 4;
  const opusIn = (1000 / 1_000_000) * 15;
  const opusOut = (1500 / 1_000_000) * 75;
  return haikuIn + haikuOut + opusIn + opusOut;
}

function guessHint(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("[apr ") || lower.match(/\*\*[a-z]+ [a-z]+\*\* \[/i)) {
    return "A Slack thread";
  }
  if (lower.includes("severity:") && lower.includes("post-mortem")) {
    return "An incident post-mortem";
  }
  if (lower.match(/^# /m) && lower.includes("policy")) {
    return "A Notion or wiki policy doc";
  }
  if (lower.includes("ticket") && lower.includes("customer:")) {
    return "A support ticket";
  }
  return null;
}
