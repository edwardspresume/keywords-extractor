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
    <label>
        <select
            required
            name="language"
            class="w-full p-2 mb-5 border border-gray-300 rounded-lg shadow-sm text-gray-700"
        >
            <option value="english" selected>English</option>
            <option value="chinese">Chinese</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="russian">Russian</option>
            <option value="german">German</option>
            <option value="japanese">Japanese</option>
            <option value="portuguese">Portuguese</option>
            <option value="italian">Italian</option>
            <option value="hindi">Hindi</option>
            <option value="arabic">Arabic</option>
            <option value="bengali">Bengali</option>
            <option value="indonesian">Indonesian</option>
            <option value="korean">Korean</option>
            <option value="turkish">Turkish</option>
        </select>
    </label>

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
        class="w-full h-40 p-2 mb-5 border border-gray-300 rounded-lg shadow-sm text-gray-700"
    />

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
