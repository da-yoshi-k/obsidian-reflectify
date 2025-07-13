import { Plugin } from 'obsidian';
import { getReflectionFilename, generateTemplate, getPreviousReflectionLink } from './utils';
import { DEFAULT_SETTINGS, ReflectifySettingTab, ReflectifySettings } from './settings';
import { ReflectView, REFLECT_VIEW_TYPE } from './view';
import { TemplateType } from './templates';
import moment from 'moment';

export default class ReflectifyPlugin extends Plugin {
  settings: ReflectifySettings;

  async onload() {
    console.log('Reflectify loaded');
    await this.loadSettings();

    this.registerView(
      REFLECT_VIEW_TYPE,
      (leaf) => new ReflectView(leaf, this)
    );

    this.addRibbonIcon('book-copy', 'Reflect Note', () => {
      this.activateView();
    });

    this.addCommand({
      id: 'create-daily-reflection',
      name: '今日のふりかえりを書く',
      callback: () => this.createReflectionNote('daily', this.settings.templateType)
    });

    this.addSettingTab(new ReflectifySettingTab(this.app, this));
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(REFLECT_VIEW_TYPE);

    const rightLeaf = this.app.workspace.getRightLeaf(false);
    if (rightLeaf) {
      await rightLeaf.setViewState({
        type: REFLECT_VIEW_TYPE,
        active: true,
      });
    }

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(REFLECT_VIEW_TYPE)[0]
    );
  }

  async createReflectionNote(granularity: 'daily' | 'weekly', templateType: TemplateType) {
    const filename = getReflectionFilename(granularity);
    const template = generateTemplate(templateType);
    const previousLink = getPreviousReflectionLink(this.app);

    const frontmatter = `---`
        + `\ncreated: ${moment().format()}`
        + `\ntemplate: ${templateType}`
        + `\ntags: [reflectify, ${templateType.toLowerCase()}]`
        + `\n---`;

    let content = `${frontmatter}\n\n${template}`;
    if (previousLink) {
        content += `\n\n---\n前回のふりかえり → ${previousLink}`;
    }

    const file = await this.app.vault.create(filename, content);
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
