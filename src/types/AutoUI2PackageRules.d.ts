export interface AutoUI2ViewPolicy {
  range: number;
  policytype: string;
  oldcolumns: number;
  newcolumns: number;
  itemdecorationflag: number;
  multisetflag: number;
  resetflag: number;
}

export interface AutoUI2View {
  name?: string;
  id?: string;
  path?: string;
  view_policy?: AutoUI2ViewPolicy;
}

export interface AutoUI2Activity {
  name: string;
  policy: number;
  view?: AutoUI2View[];
}

export interface AutoUI2Package {
  name: string;
  enable: boolean;
  describe?: string;
  optimizeWebView?: boolean;
  activity: AutoUI2Activity[];
}

export type AutoUI2PackageRules = Record<string, AutoUI2Package>;

/** 仅包名 → 是否启用（写入 autoui2_enable.json） */
export type AutoUI2EnableMap = Record<string, boolean>;