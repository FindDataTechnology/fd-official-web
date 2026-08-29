// Hand-rolled SVG chart primitives for the /indicators pages.
// No dependencies — themed with the site's CSS custom properties
// (--panel/--border/--muted/--accent/--accent-2 from public/global.css).

type Datum = { label: string; value: number };

const SVG_NS = 'http://www.w3.org/2000/svg';

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function chartPalette(): string[] {
  const a = cssVar('--accent', '#38e1c8');
  const b = cssVar('--accent-2', '#6aa6ff');
  // Interpolate between the two brand colors for a cohesive ramp.
  const mix = (t: number) => {
    const pa = [1, 225, 200].map((x) => x);
    const pb = [106, 166, 255];
    const c = pa.map((x, i) => Math.round(x + (pb[i]! - x) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  return [a, mix(0.25), b, mix(0.6), mix(0.8), '#9aa6d0', '#7ce0ff', '#c9a6ff', mix(0.4), '#ffd28a', a, b];
}

/** Truncate a dimension to the top N values, folding the rest into "other". */
export function topN(data: Datum[], n: number, otherLabel = 'other'): Datum[] {
  if (data.length <= n) return data;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const rest = sorted.slice(n).reduce((s, d) => s + d.value, 0);
  return [...sorted.slice(0, n), ...(rest > 0 ? [{ label: otherLabel, value: rest }] : [])];
}

/** Horizontal bar chart: label left, value right, bar in between. */
export function barChart(container: HTMLElement, data: Datum[]): void {
  container.innerHTML = '';
  if (!data.length) return emptyNote(container);
  const max = Math.max(...data.map((d) => d.value), 1);
  const rowH = 34;
  const width = 640;
  const height = data.length * rowH + 4;
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart-svg' });
  const palette = chartPalette();
  data.forEach((d, i) => {
    const y = i * rowH + 2;
    const labelW = 170;
    const barMax = width - labelW - 60;
    const label = el('text', { x: labelW - 8, y: y + 14, 'text-anchor': 'end', class: 'chart-label' });
    label.textContent = d.label.length > 16 ? d.label.slice(0, 15) + '…' : d.label;
    const bar = el('rect', {
      x: labelW,
      y: y + 5,
      width: Math.max((d.value / max) * barMax, 2),
      height: rowH - 10,
      rx: 3,
      fill: palette[i % palette.length]!,
      opacity: 0.9,
    });
    const val = el('text', { x: labelW + 4 + Math.max((d.value / max) * barMax, 2), y: y + 14, class: 'chart-value' });
    val.textContent = String(d.value);
    svg.append(label, bar, val);
  });
  container.append(svg);
}

/** Donut chart with a legend. */
export function donutChart(container: HTMLElement, data: Datum[]): void {
  container.innerHTML = '';
  if (!data.length) return emptyNote(container);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = 220;
  const r = 84;
  const cx = size / 2;
  const cy = size / 2;
  const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, class: 'chart-svg chart-donut' });
  const palette = chartPalette();
  let angle = -Math.PI / 2;
  data.forEach((d, i) => {
    const frac = d.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    if (frac >= 0.999) {
      svg.append(el('circle', { cx, cy, r, fill: palette[i % palette.length]!, opacity: 0.9 }));
      return;
    }
    const p = (a: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const path = el('path', {
      d: `M ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)} L ${cx} ${cy} Z`,
      fill: palette[i % palette.length]!,
      opacity: 0.9,
    });
    const title = el('title');
    title.textContent = `${d.label}: ${d.value}`;
    path.append(title);
    svg.append(path);
  });
  svg.append(el('circle', { cx, cy, r: r * 0.55, fill: cssVar('--panel', '#161d3a') }));
  const hole = el('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', class: 'chart-hole-num' });
  hole.textContent = String(total);
  const holeLabel = el('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', class: 'chart-hole-label' });
  holeLabel.textContent = 'total';
  svg.append(hole, holeLabel);
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.innerHTML = data
    .map(
      (d, i) =>
        `<span><i style="background:${palette[i % palette.length]}"></i>${escapeHtml(d.label)} <b>${d.value}</b></span>`,
    )
    .join('');
  container.append(svg, legend);
}

/** Time-series line chart with axes and a hover tooltip (date + value). */
export function lineChart(container: HTMLElement, points: [string, string][]): void {
  container.innerHTML = '';
  if (points.length < 2) return emptyNote(container);
  const nums = points.map((p) => Number(p[1])).filter((n) => Number.isFinite(n));
  if (nums.length < 2) return emptyNote(container);

  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 30 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad10 = (max - min) * 0.08;
  min -= pad10;
  max += pad10;

  const dates = points.map((p) => new Date(p[0]).getTime()).filter((t) => Number.isFinite(t));
  const dMin = Math.min(...dates);
  const dMax = Math.max(...dates);
  const x = (i: number) => pad.l + (dates[i]! - dMin) / (dMax - dMin || 1) * iw;
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * ih;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg' });
  const accent = cssVar('--accent', '#38e1c8');
  const border = cssVar('--border', '#25305a');
  const muted = cssVar('--muted', '#9aa6d0');

  // y-axis gridlines (4 ticks)
  for (let t = 0; t <= 4; t++) {
    const v = min + ((max - min) * t) / 4;
    const gy = y(v);
    svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: gy, y2: gy, stroke: border, 'stroke-dasharray': t === 0 ? '' : '3 4' }));
    const label = el('text', { x: pad.l - 6, y: gy + 4, 'text-anchor': 'end', class: 'chart-tick' });
    label.textContent = formatNum(v);
    svg.append(label);
  }
  // x-axis date labels (first / middle / last)
  [0, Math.floor(points.length / 2), points.length - 1].forEach((i, k, arr) => {
    if (arr.indexOf(i) !== k) return;
    const label = el('text', {
      x: x(i),
      y: H - 8,
      'text-anchor': k === 0 ? 'start' : k === arr.length - 1 ? 'end' : 'middle',
      class: 'chart-tick',
    });
    label.textContent = points[i]![0];
    svg.append(label);
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(Number(p[1])).toFixed(1)}`)
    .join(' ');
  svg.append(el('path', { d: path, fill: 'none', stroke: accent, 'stroke-width': 2 }));
  const area = `${path} L ${x(points.length - 1)!.toFixed(1)} ${pad.t + ih} L ${x(0)!.toFixed(1)} ${pad.t + ih} Z`;
  svg.append(el('path', { d: area, fill: accent, opacity: 0.08 }));

  // Hover: vertical guide + dot + tooltip.
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.style.display = 'none';
  const guide = el('line', { stroke: muted, 'stroke-dasharray': '3 3', visibility: 'hidden' });
  const dot = el('circle', { r: 4, fill: accent, visibility: 'hidden' });
  svg.append(guide, dot);
  container.append(svg, tip);

  svg.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(x(i) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    const [date, value] = points[best]!;
    guide.setAttribute('x1', String(x(best)));
    guide.setAttribute('x2', String(x(best)));
    guide.setAttribute('y1', String(pad.t));
    guide.setAttribute('y2', String(pad.t + ih));
    guide.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', String(x(best)));
    dot.setAttribute('cy', String(y(Number(value))));
    dot.setAttribute('visibility', 'visible');
    tip.style.display = 'block';
    tip.textContent = `${date} · ${value}`;
    const cxPix = (x(best) / W) * rect.width;
    tip.style.left = `${Math.min(Math.max(cxPix + 12, 4), rect.width - 120)}px`;
    tip.style.top = '8px';
  });
  svg.addEventListener('pointerleave', () => {
    tip.style.display = 'none';
    guide.setAttribute('visibility', 'hidden');
    dot.setAttribute('visibility', 'hidden');
  });
}

function emptyNote(container: HTMLElement): void {
  const note = document.createElement('p');
  note.className = 'chart-empty';
  note.textContent = 'no data';
  container.append(note);
}

function formatNum(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (a >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return (v / 1e3).toFixed(1) + 'k';
  return String(Math.round(v * 100) / 100);
}

export function escapeHtml(s: string): string {
  const d = document.createElement('span');
  d.textContent = s;
  return d.innerHTML;
}
