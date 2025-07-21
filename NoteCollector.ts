import { App, TFile } from 'obsidian';
import moment from 'moment';

export class NoteCollector {
    constructor(private app: App) {}

    async collectDailyNotes(startDate: string, endDate: string, format: string): Promise<{ files: TFile[], content: string }> {
        const allFiles = this.app.vault.getMarkdownFiles();
        const dailyNotes: TFile[] = [];
        let combinedContent = '';

        const start = moment(startDate);
        const end = moment(endDate);

        for (const file of allFiles) {
            const fileDate = moment(file.basename, format, true);
            if (fileDate.isValid() && fileDate.isBetween(start, end, 'day', '[]')) {
                dailyNotes.push(file);
            }
        }

        // Sort files by date to ensure chronological order
        dailyNotes.sort((a, b) => moment(a.basename, format).diff(moment(b.basename, format)));

        for (const file of dailyNotes) {
            const content = await this.app.vault.read(file);
            combinedContent += content + `

---

`;
        }

        return { files: dailyNotes, content: combinedContent };
    }
}
