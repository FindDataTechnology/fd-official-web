// Desktop installer snapshot (download-center): one committed JSON, zero
// network. The shape is the cross-repo contract — the platform repo's release
// tooling (paas add-desktop-release, scripts/release-sync.mjs) rewrites this
// file on release; this module is the reader side and the build-time
// validator. Reader rule (design D2): unknown fields are ignored, missing or
// malformed known fields fail the build naming the entry and field.

export const DESKTOP_PLATFORMS = ['macos', 'windows'] as const;
export type DesktopPlatformKey = (typeof DESKTOP_PLATFORMS)[number];

export interface DesktopPlatformEntry {
  beta: boolean;
  filename?: string;
  /** Official-site (domestic direct) link — primary source when present. */
  official_url?: string | null;
  /** GitHub Releases link — international alternative. */
  github_url?: string | null;
}

export interface DesktopRelease {
  version: string;
  released_at: string;
  platforms: Partial<Record<DesktopPlatformKey, DesktopPlatformEntry>>;
}

export interface DesktopReleasesSnapshot {
  schema: number;
  releases: DesktopRelease[];
}

// The band renders releases[0] as the current release; the writer keeps the
// array newest-first (an array, not a bare latest object, so a history view
// can arrive later without a schema break).
const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

import snapshot from '../data/desktop-releases.json';

function isHttpUrl(v: unknown): v is string {
  return typeof v === 'string' && /^https:\/\//.test(v);
}

function fail(release: DesktopRelease, field: string, problem: string): never {
  const version = typeof release?.version === 'string' ? release.version : '<no version>';
  throw new Error(
    `desktop-releases.json: release "${version}" has an invalid "${field}" — ${problem}`,
  );
}

export function loadDesktopReleases(): DesktopReleasesSnapshot {
  const snap = snapshot as DesktopReleasesSnapshot;
  if (typeof snap.schema !== 'number')
    throw new Error('desktop-releases.json: missing numeric "schema" field');
  if (!Array.isArray(snap.releases))
    throw new Error('desktop-releases.json: "releases" must be an array');

  snap.releases.forEach((release: DesktopRelease, i: number) => {
    const at = `releases[${i}]`;
    if (typeof release.version !== 'string' || !release.version)
      throw new Error(`desktop-releases.json: ${at} is missing required field "version"`);
    if (!SEMVER.test(release.version))
      throw new Error(
        `desktop-releases.json: ${at} has a non-semantic "version" "${release.version}" — use MAJOR.MINOR.PATCH`,
      );
    if (typeof release.released_at !== 'string' || !DATE.test(release.released_at))
      throw new Error(
        `desktop-releases.json: release "${release.version}" has an invalid "released_at" "${String(release.released_at)}" — use YYYY-MM-DD`,
      );
    if (!release.platforms || typeof release.platforms !== 'object')
      throw new Error(
        `desktop-releases.json: release "${release.version}" is missing required field "platforms"`,
      );

    for (const [key, entry] of Object.entries(release.platforms)) {
      if (!(DESKTOP_PLATFORMS as readonly string[]).includes(key))
        throw new Error(
          `desktop-releases.json: release "${release.version}" holds unknown platform key "${key}" — use one of ${DESKTOP_PLATFORMS.join(', ')}`,
        );
      const p = entry as DesktopPlatformEntry;
      if (typeof p.beta !== 'boolean')
        throw new Error(
          `desktop-releases.json: release "${release.version}" platform "${key}" has an invalid "beta" (must be true or false)`,
        );
      if ('official_url' in p && p.official_url != null && !isHttpUrl(p.official_url))
        throw new Error(
          `desktop-releases.json: release "${release.version}" platform "${key}" has a malformed "official_url" — use an https:// link or null`,
        );
      if ('github_url' in p && p.github_url != null && !isHttpUrl(p.github_url))
        throw new Error(
          `desktop-releases.json: release "${release.version}" platform "${key}" has a malformed "github_url" — use an https:// link or null`,
        );
      if (!isHttpUrl(p.official_url) && !isHttpUrl(p.github_url))
        throw new Error(
          `desktop-releases.json: release "${release.version}" platform "${key}" carries neither an official_url nor a github_url`,
        );
    }
  });

  return snap;
}
