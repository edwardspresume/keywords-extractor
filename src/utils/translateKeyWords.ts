import pkg from '@google-cloud/translate';

const { Translate } = pkg.v2;

const key = process.env.GOOGLE_TRANSLATE_PROJECT_API_KEY;
const projectId = process.env.GOOGLE_TRANSLATE_PROJECT_ID;

const translate = new Translate({ projectId, key });

export async function translateKeyWords(
    keywords: string,
    targetLanguage: string
) {
    try {
        const [translation] = await translate.translate(
            keywords,
            targetLanguage
        );

        return translation;
    } catch (error) {
        console.error(`Error translating keywords: ${error}`);
        throw new Error('Failed to translate keywords.');
    }
}
