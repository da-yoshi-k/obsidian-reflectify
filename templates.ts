export const TEMPLATES = {
    'KPT': `## Keep
-

## Problem
-

## Try
-
`,
    'YWT': `## やったこと
-

## わかったこと
-

## 次やること
-
`,
    '自由記述': `## 今日のふりかえり
-
`
};

export type TemplateType = keyof typeof TEMPLATES;

