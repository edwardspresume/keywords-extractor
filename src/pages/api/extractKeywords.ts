import type { APIRoute } from 'astro';
import { z } from 'zod';

const MAX_CONTENT_LENGTH = 600;

const InputDataSchema = z
    .string()
    .min(1, 'Please enter some text to process.')
    .max(
        MAX_CONTENT_LENGTH,
        `Input content is too long. The maximum length is ${MAX_CONTENT_LENGTH} characters.`
    );

// Define the type for the validated data
type InputText = z.infer<typeof InputDataSchema>;

async function fetchKeywordsFromOpenAI(inputText: InputText) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            'OPENAI_API_KEY is missing in the environment variables.'
        );
    }

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
                    content: 'Only extract the keywords from the input text',
                },
                {
                    role: 'user',
                    content: inputText,
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
        const inputText = (await request.text()).trim();
        const validationResult = InputDataSchema.safeParse(inputText);

        if (!validationResult.success) {
            return new Response(
                JSON.stringify({ message: validationResult.error.message }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const keywords = await fetchKeywordsFromOpenAI(validationResult.data);

        return new Response(JSON.stringify({ message: keywords }), {
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
                message:
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
