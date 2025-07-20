## Reflectify - Obsidianふりかえり支援プラグイン（MVP設計）

### ■ 目的

Obsidianで日次・週次の**ふりかえりテンプレートを自動生成**し、ユーザーが自然に記録・内省を続けられるようにする。

---

### ■ MVPで実装する主な機能

| 機能           | 概要                             | 技術要素                       |
| ------------ | ------------------------------ | -------------------------- |
| ✅ コマンド登録     | コマンドパレットから呼び出し                 | `addCommand()`             |
| ✅ テンプレート生成   | KPT, YWT 等に基づく構造を挿入            | `vault.create()`           |
| ✅ 日付付きファイル生成 | `2025-07-12-ふりかえり.md` の構成 | `moment.js`                |
| ✅ 設定画面       | テンプレートの類型選択                    | `SettingTab`               |
| ✅ 前回のリンク表示   | 1日前のファイルへのリンク                  | `vault.getMarkdownFiles()` |

---

### ■ ユーザー体験フロー

1. Obsidianを起動
2. コマンドパレットで `Reflect: 今日のふりかえりを書く` を選択
3. `2025-07-12-ふりかえり.md` が生成され、KPTテンプレートが挿入
4. 前日のファイルへのリンクも表示
5. 記入 → 保存

---

### ■ テンプレート例

```markdown
## Y（やったこと）
-

## W（わかったこと）
-

## T（次やること）
-

---

[前回のふりかえり → 2025-07-11-ふりかえり.md]
```

---

### ■ 拡張を見掛けた余地

| 機能        | 使用価値                       |
| --------- | -------------------------- |
| GPT連携     | 内省の促進、コメント自動生成             |
| リマインダー通知  | 日次の定時に記入を促す                |
| 週次/月次レビュー | マルチスケールなふりかえり               |
| 可視化UI     | Reflect Map / Tag Cloud など |

---

### ■ 使用予定API

- `this.app.vault.create()`
- `this.app.vault.getMarkdownFiles()`
- `this.loadData()` / `this.saveData()`
- `moment()`

---

### ■ 開発構成案

```
reflectify/
├── main.ts               # プラグイン本体
├── manifest.json         # メタデータ
├── settings.ts           # 設定UI
├── templates/            # KPT, YWT などのテンプレート
├── utils.ts              # 日付処理 / ファイル名補助
```

---

### ■ コード雛形（main.ts）

```ts
import { Plugin } from 'obsidian';
import { getTodayReflectionFilename, generateTemplate } from './utils';
import { DEFAULT_SETTINGS, ReflectifySettingTab, ReflectifySettings } from './settings';

export default class ReflectifyPlugin extends Plugin {
  settings: ReflectifySettings;

  async onload() {
    console.log('Reflectify loaded');
    await this.loadSettings();

    this.addCommand({
      id: 'create-daily-reflection',
      name: '今日のふりかえりを書く',
      callback: () => this.createReflectionNote()
    });

    this.addSettingTab(new ReflectifySettingTab(this.app, this));
  }

  async createReflectionNote() {
    const filename = getTodayReflectionFilename();
    const template = generateTemplate(this.settings.templateType);
    const file = await this.app.vault.create(filename, template);
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

---

### ■ コード雛形（utils.ts）

```ts
import moment from 'moment';

export function getTodayReflectionFilename(): string {
  const date = moment().format('YYYY-MM-DD');
  return `${date}-ふりかえり.md`;
}

export function generateTemplate(type: string): string {
  switch (type) {
    case 'YWT':
      return `## やったこと\n-\n\n## わかったこと\n-\n\n## 次やること\n-\n`;
    case '自由記述':
      return `## 今日のふりかえり\n-\n`;
    case 'KPT':
    default:
      return `## Keep\n-\n\n## Problem\n-\n\n## Try\n-\n`;
  }
}
```

---

### ■ コード雛形（settings.ts）

```ts
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface ReflectifySettings {
  templateType: 'KPT' | 'YWT' | '自由記述';
}

export const DEFAULT_SETTINGS: ReflectifySettings = {
  templateType: 'KPT'
};

export class ReflectifySettingTab extends PluginSettingTab {
  plugin: any;

  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'Reflectify 設定' });

    new Setting(containerEl)
      .setName('テンプレート形式')
      .setDesc('ふりかえりテンプレートの種類を選択')
      .addDropdown(drop =>
        drop
          .addOption('KPT', 'KPT')
          .addOption('YWT', 'YWT')
          .addOption('自由記述', '自由記述')
          .setValue(this.plugin.settings.templateType)
          .onChange(async (value: ReflectifySettings['templateType']) => {
            this.plugin.settings.templateType = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
```

---

これで `main.ts`, `utils.ts`, `settings.ts` を含むMVPの全体構成が揃いました。
