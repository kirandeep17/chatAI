#!/usr/bin/env node
import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const PKG_DIR = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));

const HELP = `
ttd-audiences ${pkg.version} — Trade Desk audience manager

Usage:
  ttd-audiences [options]

Options:
  -p, --port <n>     Port to listen on (default: PORT from .env, else 3000)
  -e, --env <file>   Path to the .env file (default: ./.env, then the install folder)
      --init         Create a .env template in the current folder and exit
      --no-open      Don't open the browser
  -h, --help         Show this help
  -v, --version      Show the version

With no TTD_API_URL set, the dashboard runs on bundled sample data.
`;

function parseArgs(argv) {
  const opts = { open: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fail(`Missing value for ${a}`);
      return v;
    };
    if (a === '-p' || a === '--port') opts.port = Number(next());
    else if (a === '-e' || a === '--env') opts.env = next();
    else if (a === '--init') opts.init = true;
    else if (a === '--no-open') opts.open = false;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '-v' || a === '--version') opts.version = true;
    else fail(`Unknown option: ${a}\n${HELP}`);
  }
  return opts;
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function openBrowser(url) {
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]]
    : ['xdg-open', [url]];
  try {
    spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
  } catch {
    /* no browser available — the URL is printed anyway */
  }
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log(HELP);
  process.exit(0);
}
if (opts.version) {
  console.log(pkg.version);
  process.exit(0);
}

if (opts.init) {
  const target = resolve('.env');
  if (existsSync(target)) fail(`${target} already exists — not overwriting.`);
  copyFileSync(join(PKG_DIR, '.env.example'), target);
  console.log(`Created ${target}\nFill in TTD_API_URL and TTD_AUTH_TOKEN, then run: ttd-audiences`);
  process.exit(0);
}

// Resolve the .env file: --env, then ./.env, then the package folder.
const candidates = opts.env ? [resolve(opts.env)] : [resolve('.env'), join(PKG_DIR, '.env')];
const envFile = candidates.find((f) => existsSync(f));
if (opts.env && !envFile) fail(`.env file not found: ${candidates[0]}`);
if (envFile) {
  process.loadEnvFile(envFile);
  console.log(`Using config from ${envFile}`);
} else {
  console.log('No .env found — running on sample data. Run `ttd-audiences --init` to create one.');
}

const { startServer } = await import('../server.js');

let port = opts.port || Number(process.env.PORT) || 3000;
for (let attempt = 0; ; attempt++) {
  try {
    const { url } = await startServer({ port });
    console.log(`\n  Audience Manager running at ${url}\n  Press Ctrl+C to stop.\n`);
    if (opts.open && !process.env.CI) openBrowser(url);
    break;
  } catch (e) {
    if (e.code === 'EADDRINUSE' && !opts.port && attempt < 10) {
      console.log(`Port ${port} is busy, trying ${port + 1}…`);
      port += 1;
      continue;
    }
    fail(e.code === 'EADDRINUSE' ? `Port ${port} is already in use. Try --port <n>.` : e.message);
  }
}
