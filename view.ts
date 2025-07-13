import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import ReflectifyPlugin from './main';
import { TEMPLATES, TemplateType } from './templates';

export const REFLECT_VIEW_TYPE = 'reflect-view';

export class ReflectView extends ItemView {
    plugin: ReflectifyPlugin;
    private selectedGranularity: 'daily' | 'weekly' | 'monthly' = 'daily';
    private selectedTemplate: TemplateType = 'KPT';

    constructor(leaf: WorkspaceLeaf, plugin: ReflectifyPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return REFLECT_VIEW_TYPE;
    }

    getDisplayText() {
        return 'Reflect Note';
    }

    getIcon() {
        return 'book-copy';
    }

    async onOpen() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('reflect-view-container');

        containerEl.createEl('h2', { text: 'ふりかえりノートを作成' });

        // Granularity Selector
        const granularityContainer = containerEl.createDiv({ cls: 'reflect-setting-container' });
        granularityContainer.createEl('h3', { text: '期間' });
        const granularitySelect = granularityContainer.createEl('select');
        granularitySelect.createEl('option', { text: '日次', value: 'daily' });
        granularitySelect.createEl('option', { text: '週次', value: 'weekly' });
        granularitySelect.createEl('option', { text: '月次', value: 'monthly' });
        granularitySelect.value = this.selectedGranularity;
        granularitySelect.addEventListener('change', (e) => {
            this.selectedGranularity = (e.target as HTMLSelectElement).value as 'daily' | 'weekly' | 'monthly';
        });

        // Template Selector
        const templateContainer = containerEl.createDiv({ cls: 'reflect-setting-container' });
        templateContainer.createEl('h3', { text: 'テンプレート' });
        const templateSelect = templateContainer.createEl('select');
        const templateOptions = Object.keys(TEMPLATES) as TemplateType[];
        templateOptions.forEach(option => {
            templateSelect.createEl('option', { text: option, value: option });
        });
        templateSelect.value = this.selectedTemplate;
        templateSelect.addEventListener('change', (e) => {
            this.selectedTemplate = (e.target as HTMLSelectElement).value as TemplateType;
        });

        // Create Button
        const buttonContainer = containerEl.createDiv({ cls: 'reflect-button-container' });
        const createButton = buttonContainer.createEl('button', { text: '作成', cls: 'mod-cta' });
        createButton.addEventListener('click', async () => {
            await this.plugin.createReflectionNote(this.selectedGranularity, this.selectedTemplate);
        });
    }
}

