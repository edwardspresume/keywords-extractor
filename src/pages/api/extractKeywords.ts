import type { APIRoute } from 'astro';

const MAX_CONTENT_LENGTH = 600;
async function fetchKeywordsFromOpenAI(inputContent: string) {
    if (!inputContent.trim()) {
        throw new Error('Please enter some text to process.');
    }

    if (inputContent.length > MAX_CONTENT_LENGTH) {
        throw new Error(
            `Input content is too long. The maximum length is ${MAX_CONTENT_LENGTH} characters.`
        );
    }

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
                    content:
                        'Your a skilled keywords extractor system. Extract keywords from the input text, capitalizing the first letter of each word and separating them with commas',
                },
                {
                    role: 'user',
                    content: inputContent,
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
    const keywordText = (await response.json())?.choices?.[0]?.message?.content;

    if (!keywordText) {
        throw new Error('Invalid response data received from the OpenAI API.');
    }

    return keywordText.trim();
}

export const post: APIRoute = async ({ request }) => {
    try {
        const inputContent = await request.text();
        const keywords = await fetchKeywordsFromOpenAI(inputContent);

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
