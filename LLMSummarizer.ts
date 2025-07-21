import { requestUrl } from 'obsidian';

export interface LLMSummarizer {
  summarize(text: string, apiKey: string): Promise<string>;
}

export class OpenAISummarizer implements LLMSummarizer {
    private apiUrl = 'https://api.openai.com/v1/chat/completions';

    async summarize(text: string, apiKey: string): Promise<string> {
        if (!apiKey) {
            throw new Error('OpenAI API key is not set.');
        }

        const requestBody = {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'あなたは優秀なパーソナルアシスタントで、ユーザーが書いたデイリーノートを読み取り、振り返りに役立つサマリーを日本語で作成します。ノートの文体・語調は変えず、内容を正しく要約し、行動改善に役立つ示唆を示してください。'
                },
                {
                    role: 'user',
                    content: `
以下は特定期間のデイリーノート全文です。コードブロック・URL・引用は内容に影響しない限り無視して構いません。
重要キーワードとタグ（# で始まるもの）は優先的に活かしてください。
また、箇条書きで書く際は元となった記述を「」で囲んで引用してください。
===== ここからデイリーノート =====
${text}
===== ここまでデイリーノート =====

## 出力フォーマット（Markdown）
- **TL;DR（50〜80 文字）**: 1 行でその日の概要
- **ハイライト**: 箇条書きで 3〜5 行
- **気づき・学び**: 箇条書きで 2〜4 行
- **感情メモ**: ポジティブ／ニュートラル／ネガティブ を 1 つ選び簡単に理由
- **次回のフォーカス**: 明日取り組むべき具体的タスクを 1〜3 行
- **インサイト**: 長期的に役立つ示唆や次のアクションにつながる一言

フォーマットは必ず守り、不要な説明は入れないこと。
                    `
                }
            ]
        };

        try {
            const response = await requestUrl({
                url: this.apiUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = response.json;
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Failed to get summary from OpenAI.');
            }
        } catch (error) {
            console.error('Error summarizing with OpenAI:', error);
            throw error;
        }
    }
}
