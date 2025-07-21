import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import ReflectifyPlugin from './main';
import { TEMPLATES, TemplateType } from './templates';
import { NoteCollector } from './NoteCollector';
import { OpenAISummarizer } from './LLMSummarizer';
import moment from 'moment';

export const REFLECT_VIEW_TYPE = 'reflect-view';

export class ReflectView extends ItemView {
    plugin: ReflectifyPlugin;
    private selectedGranularity: 'daily' | 'weekly' | 'monthly' = 'daily';
    private selectedTemplate: TemplateType = 'KPT';
    private startDate: string = moment().subtract(7, 'days').format('YYYY-MM-DD');
    private endDate: string = moment().format('YYYY-MM-DD');
    private referencedFilesContainer: HTMLDivElement;

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

        // --- Summary Section ---
        containerEl.createEl('h2', { text: 'デイリーノートを要約' });

        // Date Range Picker
        const dateContainer = containerEl.createDiv({ cls: 'reflect-setting-container' });
        dateContainer.createEl('h3', { text: '期間を選択' });
        const startDateInput = dateContainer.createEl('input', { type: 'date' });
        startDateInput.value = this.startDate;
        startDateInput.addEventListener('change', (e) => {
            this.startDate = (e.target as HTMLInputElement).value;
        });

        const endDateInput = dateContainer.createEl('input', { type: 'date' });
        endDateInput.value = this.endDate;
        endDateInput.addEventListener('change', (e) => {
            this.endDate = (e.target as HTMLInputElement).value;
        });

        // Summarize Button
        const summarizeButtonContainer = containerEl.createDiv({ cls: 'reflect-button-container' });
        const summarizeButton = summarizeButtonContainer.createEl('button', { text: '要約を生成', cls: 'mod-cta' });
        summarizeButton.addEventListener('click', async () => {
            await this.handleSummarize();
        });

        // Referenced Files Container
        this.referencedFilesContainer = containerEl.createDiv({ cls: 'referenced-files-container' });
    }

    async handleSummarize() {
        this.referencedFilesContainer.empty();

        const collector = new NoteCollector(this.plugin.app);
        const summarizer = new OpenAISummarizer();

        try {
            this.referencedFilesContainer.createEl('p', { text: 'デイリーノートを収集中...'});
            const { files, content: notesText } = await collector.collectDailyNotes(this.startDate, this.endDate, this.plugin.settings.dailyNoteFormat);

            this.referencedFilesContainer.empty();

            if (files.length === 0) {
                this.referencedFilesContainer.createEl('p', { text: '対象期間のデイリーノートが見つかりませんでした。' });
                return;
            }

            // Display referenced files
            this.referencedFilesContainer.createEl('h4', { text: '参照元ノート' });
            const list = this.referencedFilesContainer.createEl('ul');
            files.forEach(file => {
                list.createEl('li', { text: file.basename });
            });

            this.referencedFilesContainer.createEl('p', { text: '要約を生成中...'});

            const summary = await summarizer.summarize(notesText, this.plugin.settings.openAIApiKey);
            const summaryFilename = `Summary-${this.startDate}-to-${this.endDate}.md`;
            await this.plugin.app.vault.create(summaryFilename, summary);

            // Clear "generating..." message and show success
            const generatingMessage = this.referencedFilesContainer.querySelector('p');
            if(generatingMessage) generatingMessage.remove();

            this.referencedFilesContainer.createEl('h4', { text: '要約が完了しました' });
            this.referencedFilesContainer.createEl('p', { text: `${summaryFilename} に保存されました。` });

        } catch (error) {
            console.error('Failed to summarize notes:', error);
            this.referencedFilesContainer.empty();
            this.referencedFilesContainer.createEl('p', { text: `要約の生成中にエラーが発生しました。\n\n${error.message}` });
        }
    }
}
