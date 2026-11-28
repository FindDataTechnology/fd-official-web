// Mobile release manifest reader (mobile-distribution / 官网下载区).
//
// Same rule as the desktop snapshot: one committed JSON, zero network at build
// time. The FILE is a copy of what the app itself reads — the canonical
// manifest lives on the download host (`/dl/app/app-releases.json`, written by
// `scripts/mobile-release-sync.mjs` in the platform repo). Keeping a committed
// copy means the site can never render a link the app would not also offer, and
// the build fails loudly if the copy is malformed.
//
// An EMPTY releases array is a legitimate state (no public Android build yet):
// the band then renders the "not yet available" copy instead of a dead link.

export interface MobileReleaseEntry {
  version: string;
  released_at?: string;
  prerelease?: boolean;
  filename?: string;
  size?: number;
  sha256?: string;
  url: string;
}

export interface MobileReleasesSnapshot {
  schema: number;
  releases: MobileReleaseEntry[];
}

import snapshot from '../../public/data/mobile-releases.json';

const SEMVER = /^\d+\.\d+\.\d+$/;

export function loadMobileReleases(): MobileReleasesSnapshot {
  const snap = snapshot as MobileReleasesSnapshot;
  if (typeof snap.schema !== 'number') throw new Error('mobile-releases.json: missing numeric "schema"');
  if (!Array.isArray(snap.releases)) throw new Error('mobile-releases.json: "releases" must be an array');
  snap.releases.forEach((r, i) => {
    const at = `releases[${i}]`;
    if (typeof r.version !== 'string' || !SEMVER.test(r.version)) {
      throw new Error(`mobile-releases.json: ${at} has a non-semantic "version" "${String(r.version)}"`);
    }
    if (typeof r.url !== 'string' || !/^https:\/\//.test(r.url)) {
      throw new Error(`mobile-releases.json: ${at} has a malformed "url" — use an https:// link`);
    }
    if (r.prerelease === true) {
      throw new Error(`mobile-releases.json: ${at} is a pre-release — the public manifest lists formal releases only`);
    }
  });
  return snap;
}

export function newestMobileRelease(): MobileReleaseEntry | null {
  const { releases } = loadMobileReleases();
  if (!releases.length) return null;
  const cmp = (a: string, b: string) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i += 1) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
    return 0;
  };
  return releases.reduce((best, r) => (cmp(r.version, best.version) > 0 ? r : best));
}
