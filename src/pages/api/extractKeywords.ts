import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
    try {
        const data = await request.formData();
        const text = data.get('text')?.toString().trim();

        if (!text) {
            return new Response(
                JSON.stringify({
                    message: 'Please enter some text.',
                }),
                { status: 400 }
            );
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: `Extract keywords from the text below. Ensure the first letter of each word is capitalized and separate the words with commas:\n\n${text}`,
                max_tokens: 60,
                temperature: 0.5,
                frequency_penalty: 0.8,
            }),
        };

        const response = await fetch(
            'https://api.openai.com/v1/completions',
            options
        );

        const keyWordData = await response.json();
        const keywords = keyWordData.choices[0].text.trim();

        console.log(keywords);

        return new Response(
            JSON.stringify({
                message: keywords,
            }),
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error);
        } else {
            console.error(new Error(`Unknown error: ${JSON.stringify(error)}`));
        }

        // Return a server error response in case of an unexpected error
        return new Response(
            JSON.stringify({
                message: 'An error occurred while processing your request.',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            { status: 500 }
        );
    }
};
