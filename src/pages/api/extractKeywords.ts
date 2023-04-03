import type { APIRoute } from 'astro';
import { z } from 'zod';
import { translateKeyWords } from '../../utils/translateKeyWords';

const MAX_CONTENT_LENGTH = 600;

const FormDataSchema = z.object({
    text: z
        .string()
        .min(1, 'Please enter some text to process.')
        .max(
            MAX_CONTENT_LENGTH,
            `Input content is too long. The maximum length is ${MAX_CONTENT_LENGTH} characters.`
        ),
    language: z.string(),
    category: z.string(),
});

// Define the type for the validated data
type FormData = z.infer<typeof FormDataSchema>;

async function fetchKeywordsFromOpenAI(formData: FormData) {
    const { text, category } = formData;

    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            'OPENAI_API_KEY is missing in the environment variables.'
        );
    }

    const categoryPart =
        category !== 'general'
            ? `, taking into account the "${category}" category`
            : '';

    const systemPrompt = `Identify the most relevant keywords from the input text${categoryPart}.Provide the extracted keywords as a comma-separated list, without any additional text.`;

    console.log({ systemPrompt });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
            max_tokens: 60,
            temperature: 0.5,
            frequency_penalty: 0.8,
        }),
    };

    const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        options
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API Error: ${errorText}`);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
    const keywords = (await response.json())?.choices?.[0]?.message?.content;

    if (!keywords) {
        throw new Error('Invalid response data received from the OpenAI API.');
    }

    return keywords.trim();
}

export const post: APIRoute = async ({ request }) => {
    try {
        const formData = Object.fromEntries(await request.formData());
        const language = formData.language;

        const validationResult = FormDataSchema.safeParse(formData);

        if (!validationResult.success) {
            return new Response(
                JSON.stringify({ error: validationResult.error.message }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        let keywords = await fetchKeywordsFromOpenAI(validationResult.data);

        if (language !== 'en') {
            keywords = await translateKeyWords(keywords, language);
        }

        return new Response(JSON.stringify({ keywords }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        console.error(
            'Error processing request:',
            error instanceof Error ? error : new Error(JSON.stringify(error))
        );

        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : 'An error occurred while processing your request.',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
