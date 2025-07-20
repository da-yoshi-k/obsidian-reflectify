import { App, PluginSettingTab, Setting } from 'obsidian';
import ReflectifyPlugin from './main';
import { TEMPLATES, TemplateType } from './templates';

export interface ReflectifySettings {
  templateType: TemplateType;
}

export const DEFAULT_SETTINGS: ReflectifySettings = {
  templateType: 'KPT'
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
  }
}

