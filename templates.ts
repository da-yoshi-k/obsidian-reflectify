export const TEMPLATES = {
    'KPT': `## Keep
- \n
## Problem
- \n
## Try
- \n`,
    'YWT': `## やったこと
- \n
## わかったこと
- \n
## 次やること
- \n`,
    '自由記述': `## 今日のふりかえり
- \n
`
};

export type TemplateType = keyof typeof TEMPLATES;

