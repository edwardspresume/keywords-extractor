<script lang="ts">
    let responseMessage: string | null = null;
    let isSuccess: boolean = false;

    async function submit(e: SubmitEvent) {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);

        try {
            const { message, ok } = await fetch('/api/extractKeywords', {
                method: 'POST',
                body: formData,
            }).then((res) => res.json());

            responseMessage = message;

            if (!ok) {
                throw new Error(message);
            }

            isSuccess = true;
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }
</script>

<form on:submit={submit}>
    <textarea
        required
        name="text"
        class="w-full h-40 p-2 mb-5 border border-slate-200 rounded-lg shadow-sm text-slate-900"
        placeholder="Paste your text here"
    />

    <button
        type="submit"
        class="w-full p-3 text-slate-100 rounded-lg shadow-sm font-bold"
    >
        Extract Keywords
    </button>
</form>

{#if responseMessage}
    <div
        class="p-2 mt-5 text-slate-900 rounded-lg shadow-sm font-bold bg-slate-100"
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
