import d3 from "d3";
import Color from "color";
import { Harmonizer } from "color-harmony";
import { deterministicAssign } from "./deterministic";

// NOTE: DO NOT ADD COLORS WITHOUT EXTREMELY GOOD REASON AND DESIGN REVIEW
// NOTE: KEEP SYNCRONIZED WITH COLORS.CSS
/* eslint-disable no-color-literals */
const colors: Record<string, string> = {
  brand: "#00B385",
  "brand-light": "#b4e9dc",
  accent1: "#225796",
  accent2: "#4A90E2",
  accent3: "#F85F5A",
  accent4: "#FFA608",
  accent5: "#F2A86F",
  accent6: "#C8DBFB",
  accent7: "#4ACBAA",
  "admin-navbar": "#00B385",
  white: "#FFFFFF",
  black: "#121212",
  success: "#4ACBAA",
  danger: "#ED6E6E",
  error: "#F85F5A",
  warning: "#FFA608",
  "text-dark": "#2A2A2A",
  "text-medium": "#727272",
  "text-light": "#A3A3A3",
  "text-white": "#FFFFFF",
  "bg-black": "#121212",
  "bg-dark": "#93A1AB",
  "bg-medium": "#EDF2F5",
  "bg-light": "#F9FBFC",
  "bg-white": "#FFFFFF",
  "bg-yellow": "#FFFCF2",
  shadow: "rgba(0,0,0,0.08)",
  border: "#F0F0F0",

  /* Saturated colors for the SQL editor. Shouldn't be used elsewhere since they're not white-labelable. */
  "saturated-blue": "#4A90E2",
  "saturated-green": "#4ACBAA",
  "saturated-purple": "#885AB1",
  "saturated-red": "#F85F5A",
  "saturated-yellow": "#FFA608",
};
/* eslint-enable no-color-literals */

export type ColorFamily = typeof colors;
export type ColorName = string;
export type ColorString = string;

export default colors;
export const aliases: Record<string, string> = {
  summarize: "accent1",
  filter: "accent7",
  database: "accent2",
  dashboard: "brand",
  pulse: "accent4",
  nav: "brand",
};
export const harmony: string[] = [];
// DEPRECATED: we should remove these and use `colors` directly
// compute satured/desaturated variants using "color" lib if absolutely required
export const normal: Record<string, string> = {};
export const saturated: Record<string, string> = {};
export const desaturated: Record<string, string> = {};
// make sure to do the initial "sync"
syncColors();
export function syncColors() {
  syncHarmony();
  syncDeprecatedColorFamilies();
}
export const HARMONY_GROUP_SIZE = 8; // match initialColors length below

function syncHarmony() {
  const harmonizer = new Harmonizer();
  const initialColors = [
    colors["brand"],
    colors["accent1"],
    colors["accent2"],
    colors["accent3"],
    colors["accent4"],
    colors["accent5"],
    colors["accent6"],
    colors["accent7"],
  ];
  harmony.splice(0, harmony.length);
  // round 0 includes brand and all accents
  harmony.push(...initialColors);
  // rounds 1-4 generated harmony
  // only harmonize brand and accents 1 through 4
  const initialColorHarmonies = initialColors
    .slice(0, 5)
    .map(color => harmonizer.harmonize(color, "fiveToneD"));

  for (let roundIndex = 1; roundIndex < 5; roundIndex++) {
    for (
      let colorIndex = 0;
      colorIndex < initialColorHarmonies.length;
      colorIndex++
    ) {
      harmony.push(initialColorHarmonies[colorIndex][roundIndex]);
    }
  }
}

// syncs deprecated color families for legacy code
function syncDeprecatedColorFamilies() {
  // normal + saturated + desaturated
  normal.blue = saturated.blue = desaturated.blue = colors["brand"];
  normal.green = saturated.green = desaturated.green = colors["accent1"];
  normal.purple = saturated.purple = desaturated.purple = colors["accent2"];
  normal.red = saturated.red = desaturated.red = colors["accent3"];
  normal.yellow = saturated.yellow = desaturated.yellow = colors["accent4"];
  normal.orange = colors["accent5"];
  normal.teal = colors["accent6"];
  normal.indigo = colors["accent7"];
  normal.gray = colors["text-dark"];
  normal.grey1 = colors["text-light"];
  normal.grey2 = colors["text-medium"];
  normal.grey3 = colors["text-dark"];
  normal.text = colors["text-dark"];
}

export const getRandomColor = (family: ColorFamily): ColorString => {
  const colors: ColorString[] = Object.values(family);
  return colors[Math.floor(Math.random() * colors.length)];
};
type ColorScale = (input: number) => ColorString;
export const getColorScale = (
  extent: [number, number],
  colors: string[],
  quantile: boolean = false,
): ColorScale => {
  if (quantile) {
    return d3.scale
      .quantile<any>()
      .domain(extent)
      .range(colors);
  } else {
    const [start, end] = extent;
    return d3.scale
      .linear<any>()
      .domain(
        colors.length === 3
          ? [start, start + (end - start) / 2, end]
          : [start, end],
      )
      .range(colors);
  }
};
// HACK: d3 may return rgb values with decimals but certain rendering engines
// don't support that (e.x. Safari and CSSBox)
export function roundColor(color: ColorString): ColorString {
  return color.replace(
    /rgba\((\d+(?:\.\d+)),\s*(\d+(?:\.\d+)),\s*(\d+(?:\.\d+)),\s*(\d+\.\d+)\)/,
    (_, r, g, b, a) =>
      `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`,
  );
}

export function color(color: ColorString | ColorName): ColorString {
  if (color in colors) {
    return colors[color as ColorName];
  }

  if (color in aliases) {
    return colors[aliases[color]];
  }

  // TODO: validate this is a ColorString
  return color;
}
export function alpha(c: ColorString | ColorName, a: number): ColorString {
  return Color(color(c))
    .alpha(a)
    .string();
}
export function darken(
  c: ColorString | ColorName,
  f: number = 0.25,
): ColorString {
  return Color(color(c))
    .darken(f)
    .string();
}
export function lighten(
  c: ColorString | ColorName,
  f: number = 0.5,
): ColorString {
  return Color(color(c))
    .lighten(f)
    .string();
}
const PREFERRED_COLORS: Record<string, string[]> = {
  success: [
    "success",
    "succeeded",
    "pass",
    "passed",
    "valid",
    "complete",
    "completed",
    "accepted",
    "active",
    "profit",
  ],
  error: [
    "error",
    "fail",
    "failed",
    "failure",
    "failures",
    "invalid",
    "rejected",
    "inactive",
    "loss",
    "cost",
    "deleted",
    "pending",
  ],
  warning: ["warn", "warning", "incomplete", "unstable"],
  brand: ["count"],
  accent1: ["sum"],
  accent2: ["average"],
};
const PREFERRED_COLORS_MAP: Record<string, string> = {};

for (const color in PREFERRED_COLORS) {
  if (Object.prototype.hasOwnProperty.call(PREFERRED_COLORS, color)) {
    const keys = PREFERRED_COLORS[color];

    for (let i = 0; i < keys.length; i++) {
      PREFERRED_COLORS_MAP[keys[i]] = color;
    }
  }
}

type Key = string;

function getPreferredColor(key: Key) {
  return color(PREFERRED_COLORS_MAP[key.toLowerCase()]);
}

// returns a mapping of deterministically assigned colors to keys, optionally with a fixed value mapping
export function getColorsForValues(
  keys: string[],
  existingAssignments: Record<Key, ColorString> | null | undefined = {},
) {
  const all = Object.values(harmony);
  const primaryTier = all.slice(0, 8);
  const secondaryTier = all.slice(8);
  return deterministicAssign(
    keys,
    primaryTier,
    existingAssignments as any,
    getPreferredColor,
    [secondaryTier],
  ) as any;
}
// conviennce for a single color (only use for visualizations with a single color)
export function getColorForValue(key: Key) {
  return getColorsForValues([key])[key];
}
