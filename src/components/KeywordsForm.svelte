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
        class="w-full p-2 text-slate-100 bg-sky-400 rounded-lg shadow-sm font-bold"
    >
        Extract Keywords
    </button>

    {#if responseMessage}
        <div
            class="p-2 mt-5 text-slate-100 rounded-lg shadow-sm font-bold"
            class:success={isSuccess}
            class:error={!isSuccess}
        >
            {responseMessage}
        </div>
    {/if}
</form>
