<script lang="ts">
    import { createWorker, type Worker } from 'tesseract.js';
    import { onMount } from 'svelte';

    let imageFile: File | null = null;
    let recognitionResult: string = '';
    let isProcessing: boolean = false;
    let statusMessage: string = '이미지를 업로드하거나 드래그하여 OCR을 시작하세요.';

    // Tesseract Web Worker
    let worker: Worker | null = null;

    /**
     * Tesseract Worker 초기화
    */
    onMount(async () => {
        statusMessage = 'OCR 엔진 로드 중.. (PWA 캐싱을 위해 시간이 걸릴 수 있습니다.)';

        // PWA 환경에서는 Worker 생성에 필요한 파일들을 캐시해야 합니다.
        worker = await createWorker('eng', undefined,{
            // 로깅을 비활성화하여 콘솔을 깔끔하게 유지.
            logger: () => {}
        });

        statusMessage = 'OCR 엔진 준비 완료.';
    });

    /**
     * 파일이 선택되었을 때 호출되는 핸들러
    */
    function handleImageSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            imageFile = input.files[0];
            recognitionResult = '';
            // 이미지가 선택되면 바로 OCR 시작
            if (imageFile) {
                runOcr();
            }
        }
    }

    /**
     * OCR 실행 로직
    */
    async function runOcr() {
        if (!worker || !imageFile) {
            statusMessage = '파일이 선택되지 않았거나 엔진이 준비되지 않았습니다.';
            return;
        }

        isProcessing = true;
        recognitionResult = '';
        statusMessage = '텍스트 인식 중...';

        try {
            const { data: { text } } = await worker.recognize(imageFile);

            recognitionResult = text.trim();
            statusMessage = '인식 완료.';
        } catch (error) {
            console.error('OCR Error:', error);
            statusMessage = 'OCR 중 오류가 발생했습니다. 콘솔을 확인하세요.';
        } finally {
            isProcessing = false;
        }
    }

    // 컴포넌트가 파괴될 때 Worker 종료 (메모리 관리)
    // SvelteKit에서 페이지 이동 시 자동으로 처리되지만, 명시적으로 추가할 수 있다.
    // onDestroy(async () => {
    //    worker?.terminate();
    // });
    
</script>

<svelte:head>
    <title>OCR Captcha PWA</title>
</svelte:head>

<div class="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-xl rounded-lg mt-10">
    <h1 class="text-3xl font-bold text-center text-green-600 mb-6">PWA OCR Captcha Solver</h1>
    
    <p class="text-sm text-center mb-4 {isProcessing ? 'text-yellow-600' : 'text-gray-500'}">
        {statusMessage}
    </p>

    <div class="mb-6">
        <label for="file-upload" class="flex justify-center items-center h-32 border-2 border-dashed rounded-md cursor-pointer transition duration-300
            {isProcessing ? 'bg-gray-100 border-gray-300' : 'hover:border-green-400 hover:bg-green-50 border-gray-400'}">
            
            <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p class="mt-1 text-sm text-gray-600">
                    클릭하여 이미지 업로드 또는 드래그 앤 드롭
                </p>
                {#if imageFile}
                    <p class="text-xs text-green-500 mt-1">선택된 파일: {imageFile.name}</p>
                {/if}
            </div>
            
            <input id="file-upload" type="file" accept="image/*" class="sr-only" on:change={handleImageSelect} disabled={isProcessing}>
        </label>
    </div>

    {#if imageFile}
        <div class="mb-6 border p-4 rounded-md">
            <h2 class="text-lg font-semibold mb-2">선택된 캡차 이미지</h2>
            <img src={URL.createObjectURL(imageFile)} alt="Selected Captcha" class="max-w-full h-auto rounded mb-4 shadow-sm" />
            
            <button 
                on:click={runOcr}
                disabled={isProcessing}
                class="w-full py-2 px-4 rounded-md text-white font-semibold transition duration-300 
                {isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}"
            >
                {#if isProcessing}
                    인식 중...
                {:else}
                    OCR 텍스트 인식 시작
                {/if}
            </button>
        </div>
    {/if}

    {#if recognitionResult}
        <div class="p-4 bg-gray-50 border border-green-200 rounded-md">
            <h2 class="text-lg font-semibold text-green-700 mb-2">인식 결과:</h2>
            <p class="text-xl font-mono break-all bg-white p-2 border rounded">{recognitionResult}</p>
        </div>
    {/if}
</div>