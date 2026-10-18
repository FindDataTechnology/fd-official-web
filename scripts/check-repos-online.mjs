#!/usr/bin/env node
// Online acceptance for the /repos surface. An HTTP status code proves nothing
// here: nginx answers an unknown path with the site's fallback page AND a 200
// (real incident 2026-10-18: 12 repo detail pages were gone while every one of
// them still returned 200). So this script decides by the page <title>: a real
// repo page carries the repo name, the fallback carries the site default.
//
// A control slug that must NOT exist is checked first. If the control does not
// read as missing, the discriminator itself has broken (e.g. the site changed
// its title format) and the script fails loudly instead of reporting all-green.
//
// Usage:
//   node scripts/check-repos-online.mjs [--base https://www.finddatatech.cloud]
//   node scripts/check-repos-online.mjs --offline   # skip network, self-check only

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE = (baseIdx >= 0 ? args[baseIdx + 1] : 'https://www.finddatatech.cloud').replace(/\/$/, '');
const OFFLINE = args.includes('--offline');

const REPOS_OUT = new URL('../src/data/repos.json', import.meta.url);

// The flagship links to its curated product page, not /repos/<name> — a
// deliberate special case in RepoCard.astro, not a missing page.
const PRODUCT_PAGE_SPECIAL = {
  'fd-open-data-mcp': '/fd-open-data-mcp',
};

function repoNames() {
  const { repos } = JSON.parse(readFileSync(REPOS_OUT, 'utf8'));
  return repos.map((r) => r.name);
}

function titleOf(html) {
  const m = /<title>([^<]*)<\/title>/i.exec(html);
  return m ? m[1].trim() : '';
}

async function fetchPage(path) {
  const res = await fetch(BASE + path, { redirect: 'follow' });
  return { status: res.status, title: titleOf(await res.text()) };
}

function isRealRepoPage(title, name) {
  return title.startsWith(name + ' ') || title.includes(name + ' —');
}

function runSelfCheck() {
  const names = repoNames();
  if (names.length === 0) {
    console.error('✗ repos.json 为空——无法验收（先跑 npm run repos:fetch）');
    return 1;
  }
  console.log(`仓清单：${names.length} 个仓（repos.json）`);
  console.log(`判别规则：页面 <title> 含仓名 = 真实页；兜底页标题是站点默认标题`);
  return null;
}

async function main() {
  const self = runSelfCheck();
  if (self !== null) return self;
  if (OFFLINE) {
    console.log('--offline：跳过网络检查');
    return 0;
  }

  const names = repoNames();
  let missing = [];
  let special = [];

  for (const name of names) {
    const paths = [PRODUCT_PAGE_SPECIAL[name]].filter(Boolean).concat(
      PRODUCT_PAGE_SPECIAL[name] ? [] : [`/repos/${name}`, `/zh/repos/${name}`],
    );
    let ok = false;
    for (const p of paths) {
      const { title } = await fetchPage(p);
      if (isRealRepoPage(title, name)) {
        ok = true;
        break;
      }
    }
    if (ok) {
      if (PRODUCT_PAGE_SPECIAL[name]) special.push(name);
    } else {
      missing.push(name);
    }
  }

  // Control: a slug that must not exist. It has to read as missing, otherwise
  // the title discriminator has silently broken and every other result above
  // is worthless.
  const control = 'this-repo-does-not-exist-control';
  const ctl = await fetchPage(`/repos/${control}`);
  const controlReadsMissing = !isRealRepoPage(ctl.title, control);

  if (special.length) console.log(`产品页特例（卡片指向专属页，非缺失）：${special.join(', ')}`);
  if (missing.length) {
    console.error(`✗ 线上缺失 ${missing.length} 个仓库页：${missing.join(', ')}`);
  }

  if (!controlReadsMissing) {
    console.error(
      `✗ 判别规则失效：不存在的 slug「${control}」也读成了真实页（title: ${ctl.title}）。` +
        `站点标题格式可能已变——本脚本的结论不可信，请修正判别规则后重跑。`,
    );
    return 1;
  }

  if (missing.length) return 1;
  console.log(`✓ ${names.length} 个仓全部有真实页面（含 ${special.length} 个产品页特例）`);
  return 0;
}

process.exit(await main());
