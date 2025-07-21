import { App, PluginSettingTab, Setting } from 'obsidian';
import ReflectifyPlugin from './main';
import { TEMPLATES, TemplateType } from './templates';

export interface ReflectifySettings {
  templateType: TemplateType;
  openAIApiKey: string;
  dailyNoteFormat: string;
}

export const DEFAULT_SETTINGS: ReflectifySettings = {
  templateType: 'KPT',
  openAIApiKey: '',
  dailyNoteFormat: 'YYYY-MM-DD'
};

export class ReflectifySettingTab extends PluginSettingTab {
  plugin: ReflectifyPlugin;

  constructor(app: App, plugin: ReflectifyPlugin) {
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
      .addDropdown(drop => {
        const templateOptions = Object.keys(TEMPLATES) as TemplateType[];
        templateOptions.forEach(option => {
          drop.addOption(option, option);
        });
        drop
          .setValue(this.plugin.settings.templateType)
          .onChange(async (value: TemplateType) => {
            this.plugin.settings.templateType = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('デイリーノートのファイル名形式')
      .setDesc('moment.jsの形式で指定します。例: YYYY-MM-DD')
      .addText(text =>
        text
          .setPlaceholder('YYYY-MM-DD')
          .setValue(this.plugin.settings.dailyNoteFormat)
          .onChange(async (value) => {
            this.plugin.settings.dailyNoteFormat = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('OpenAI API Key')
      .setDesc('APIキーは安全に保管され、外部に共有されることはありません。')
      .addText(text =>
        text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.openAIApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openAIApiKey = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

