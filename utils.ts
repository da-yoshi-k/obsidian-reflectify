import moment from 'moment';
import { TEMPLATES, TemplateType } from './templates';

export function getReflectionFilename(granularity: 'daily' | 'weekly'): string {
  if (granularity === 'weekly') {
    const weekNumber = moment().format('W');
    return `${moment().format('YYYY')}-W${weekNumber}-ふりかえり.md`;
  }
  // daily
  const date = moment().format('YYYY-MM-DD');
  return `${date}-ふりかえり.md`;
}

export function generateTemplate(type: TemplateType): string {
  return TEMPLATES[type] || TEMPLATES['KPT'];
}

