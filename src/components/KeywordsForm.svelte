<script lang="ts">
    let responseMessage: string | null = null;
    let isSuccess: boolean | null = null;
    let inputContent = '';
    $: textLength = inputContent.length;

    async function submit(e: SubmitEvent) {
        e.preventDefault();

        if (!inputContent.trim()) {
            isSuccess = false;
            responseMessage = 'Please enter some text to process.';
            return;
        }

        try {
            const response = await fetch('/api/extractKeywords', {
                method: 'POST',
                body: inputContent,
            });

            const responseData = await response.json();
            responseMessage = responseData.message;
            isSuccess = response.ok;
        } catch (error) {
            console.error('Error submitting form:', error);
            isSuccess = false;
            responseMessage =
                'An unexpected error occurred while processing your request.';
        }
    }

    function handleInput(e: Event) {
        inputContent = (e.target as HTMLTextAreaElement).value.trim();
    }
</script>

<form on:submit={submit}>
    <label for="inputContent" class="flex justify-between items-center mb-1">
        <span>Content</span>

        <span class="text-gray-400 text-sm">
            <var>{textLength}</var><span>/300</span>
        </span>
    </label>

    <textarea
        required
        minlength="10"
        maxlength="300"
        on:input={handleInput}
        bind:value={inputContent}
        id="inputContent"
        enterkeyhint="enter"
        placeholder="Paste your text here"
        class="w-full h-40 p-2 mb-5 border border-gray-300 rounded-lg shadow-sm text-gray-700"
    />

    <button
        type="submit"
        class="w-full p-3 text-white rounded-lg shadow-sm font-bold"
    >
        Extract Keywords
    </button>
</form>

{#if responseMessage}
    <div
        class="p-2 mt-5 text-gray-900 rounded-lg shadow-sm font-bold bg-gray-200"
        class:success={isSuccess}
        class:error={!isSuccess}
    >
        {responseMessage}
    </div>
{/if}

<style>
    .success {
        color: #10b981;
    }

    .error {
        color: #ef4444;
    }

    button {
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
