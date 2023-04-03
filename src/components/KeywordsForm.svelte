<script lang="ts">
    let inputText = '';
    $: textLength = inputText.length;

    let isLoading = false;
    let keywords: string | null = null;
    let errorMessage: string | null = null;

    async function submit(e: Event) {
        if (!inputText) {
            errorMessage = 'Please enter some text to process.';
            return;
        }

        const formData = new FormData(e.target as HTMLFormElement);

        try {
            isLoading = true;
            const response = await fetch('/api/extractKeywords', {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                keywords = responseData.keywords;
            } else {
                errorMessage = responseData.error;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            errorMessage =
                'An unexpected error occurred while processing your request.';
        } finally {
            isLoading = false;
        }
    }

    function handleInput(e: Event) {
        inputText = (e.target as HTMLTextAreaElement).value.trim();
    }

    async function copyKeywordsToClipboard() {
        if (keywords) {
            await navigator.clipboard.writeText(keywords);
            alert('Keywords copied to clipboard!');
        }
    }
</script>

<form on:submit|preventDefault={submit}>
    <label for="inputText" class="flex justify-between items-center mb-1">
        <span>Text</span>
        <span class="text-gray-400 text-sm">
            <var>{textLength}</var><span>/600</span>
        </span>
    </label>

    <textarea
        required
        minlength="10"
        maxlength="600"
        name="text"
        on:input={handleInput}
        bind:value={inputText}
        id="inputText"
        enterkeyhint="enter"
        placeholder="Enter your text here"
        class="w-full h-40 p-2 border border-gray-300 rounded-lg shadow-sm text-gray-700"
    />

    <fieldset class="flex gap-x-3 mb-10 mt-1">
        <label>
            <span> Language </span>
            <select
                required
                name="language"
                class="w-full p-2 mt-1 border border-gray-300 rounded-lg shadow-sm text-gray-700"
            >
                <option value="en" selected>English</option>
                <option value="zh">Chinese</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ru">Russian</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
                <option value="bn">Bengali</option>
                <option value="id">Indonesian</option>
                <option value="ko">Korean</option>
                <option value="tr">Turkish</option>
            </select>
        </label>

        <label>
            <span>Category</span>
            <select
                required
                name="category"
                class="w-full p-2 mt-1 border border-gray-300 rounded-lg shadow-sm text-gray-700"
            >
                <option value="general" selected>General</option>
                <option value="academic">Academic Research</option>
                <option value="marketing">Marketing</option>
                <option value="news">News Articles</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="sports">Sports</option>
                <option value="politics">Politics</option>
                <option value="entertainment">Entertainment</option>
                <option value="environment">Environment</option>
                <option value="formal">Formal Writing</option>
                <option value="informal">Informal Writing</option>
                <option value="positive">Positive Sentiment</option>
                <option value="negative">Negative Sentiment</option>
                <option value="neutral">Neutral Sentiment</option>
            </select>
        </label>
    </fieldset>

    <button
        type="submit"
        disabled={isLoading}
        class="w-full p-3 text-white rounded-lg shadow-sm font-bold"
    >
        {isLoading ? 'Loading...' : 'Extract Keywords'}
    </button>
</form>

{#if errorMessage}
    <div
        class="p-2 mt-5 rounded-lg shadow-sm font-bold bg-red-200 text-red-700"
    >
        {errorMessage}
    </div>
{/if}

{#if keywords}
    <div
        class="p-3 mt-5 rounded-lg shadow-sm bg-gray-100 text-green-600 flex flex-col"
    >
        <div class="w-full flex justify-between items-center mb-3">
            <h3 class="font-bold">Keywords:</h3>
            <button
                on:click={copyKeywordsToClipboard}
                class="text-white bg-green-500 rounded-lg shadow-sm font-bold text-sm p-1"
            >
                Copy
            </button>
        </div>
        <p class="text-green-800">
            {keywords}
        </p>
    </div>
{/if}

<style>
    button[type='submit'] {
        transition: all 0.8s;
        background: linear-gradient(to right, #d2721c, #10b981);
        background-size: 400% 400%;
        animation: gradient 4.5s ease-in-out infinite;
    }

    button:hover {
        transform: scale(1.01);
        background: none;
        background-color: #000;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>
