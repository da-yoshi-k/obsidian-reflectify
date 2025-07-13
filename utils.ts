import moment from 'moment';
import { TEMPLATES, TemplateType } from './templates';
import { App, TFile } from 'obsidian';

export function getReflectionFilename(granularity: 'daily' | 'weekly' | 'monthly'): string {
  if (granularity === 'weekly') {
    const weekNumber = moment().format('W');
    return `${moment().format('YYYY')}-W${weekNumber}-ふりかえり.md`;
  }
  if (granularity === 'monthly') {
    return `${moment().format('YYYY-MM')}-ふりかえり.md`;
  }
  // daily
  const date = moment().format('YYYY-MM-DD');
  return `${date}-ふりかえり.md`;
}

export function generateTemplate(type: TemplateType): string {
  return TEMPLATES[type] || TEMPLATES['KPT'];
}

export function getPreviousReflectionLink(app: App): string | null {
    const files = app.vault.getMarkdownFiles();
    const reflectifyNotes: TFile[] = [];

    for (const file of files) {
        const cache = app.metadataCache.getFileCache(file);
        const tags = cache?.frontmatter?.tags;
        if (tags && Array.isArray(tags) && tags.includes('reflectify')) {
            reflectifyNotes.push(file);
        }
    }

    if (reflectifyNotes.length === 0) {
        return null;
    }

    reflectifyNotes.sort((a, b) => b.basename.localeCompare(a.basename));

    return `[[${reflectifyNotes[0].basename}]]`;
}

