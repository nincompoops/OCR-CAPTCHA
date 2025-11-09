<script lang="ts">
    import { createWorker, type Worker } from 'tesseract.js';
    import { onMount, onDestroy } from 'svelte';
    
    let imageFile: File | null = null;
    let recognitionResult: string = '';
    let isProcessing: boolean = false;
    
    // 한국어 지원을 명시
    let statusMessage: string = '이미지를 업로드하거나 드래그하여 OCR을 시작하세요. (현재: 영어+한국어 지원)';

    // Tesseract Web Worker
    let worker: Worker | null = null;

    /**
     * File 객체를 로드하여 Canvas를 통해 그레이스케일 처리한 후 Blob을 반환합니다.
     */
    function processImageWithCanvas(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        return reject(new Error("Failed to get canvas context."));
                    }

                    // 원본 이미지를 그립니다.
                    ctx.drawImage(img, 0, 0);
                    
                    // 픽셀 데이터 가져오기
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // 그레이스케일 변환 로직 (R, G, B 평균값 사용)
                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        data[i]     = avg; // R
                        data[i + 1] = avg; // G
                        data[i + 2] = avg; // B
                    }
                    
                    // 처리된 픽셀 데이터를 다시 Canvas에 적용
                    ctx.putImageData(imageData, 0, 0);

                    // 처리된 Canvas 내용을 Blob (PNG)으로 변환
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed.'));
                        }
                    }, 'image/png');

                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Tesseract Worker 초기화
    */
    onMount(async () => {
        statusMessage = 'OCR 엔진 로드 중.. (PWA 캐싱을 위해 시간이 걸릴 수 있습니다.)';

        // 'eng+kor'로 설정하여 한국어 언어팩을 포함시킵니다.
        worker = await createWorker('eng+kor', undefined, {
            logger: () => {}
        });

        statusMessage = 'OCR 엔진 준비 완료. (영어/한국어 지원)';
    });
    
    // 컴포넌트가 파괴될 때 Worker 종료 (메모리 관리)
    onDestroy(async () => {
        worker?.terminate();
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
     * OCR 실행 로직 (Canvas API를 이용한 그레이스케일 전처리 포함)
    */
    async function runOcr() {
        if (!worker || !imageFile) {
            statusMessage = '파일이 선택되지 않았거나 엔진이 준비되지 않았습니다.';
            return;
        }

        isProcessing = true;
        recognitionResult = '';
        statusMessage = '텍스트 인식 중... (그레이스케일 전처리 적용)';
        
        try {
            // 1. Canvas API를 사용하여 이미지 전처리 (그레이스케일)
            const processedImageBlob = await processImageWithCanvas(imageFile);
            
            statusMessage = '전처리된 이미지(Canvas API)로 텍스트 인식 중...';

            // 2. Tesseract OCR 실행
            // Blob을 Tesseract.js에 전달
            const { data: { text } } = await worker.recognize(processedImageBlob);
            recognitionResult = text.trim();
            statusMessage = '인식 완료.';
        } catch (error) {
            console.error('OCR Error:', error);
            statusMessage = `OCR 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
        } finally {
            isProcessing = false;
        }
    }
</script>

<svelte:head>
    <title>PWA OCR Captcha Solver</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6 sm:p-8 lg:p-10 bg-gray-50 shadow-2xl rounded-xl mt-10 border border-gray-200">
    <h1 class="text-4xl font-extrabold text-center text-indigo-700 mb-8">PWA OCR Captcha Solver</h1>
    
    <p class="text-base text-center mb-6 font-medium 
        {isProcessing ? 'text-orange-500 animate-pulse' : 'text-gray-600'}">
        {statusMessage}
    </p>

    <div class="mb-8">
        <label for="file-upload" class="flex justify-center items-center h-40 border-4 border-dashed rounded-lg cursor-pointer transition duration-500 ease-in-out
            {isProcessing ? 'bg-indigo-100 border-indigo-400 opacity-70' : 'hover:border-indigo-600 hover:bg-indigo-50 border-gray-300'}">
            
            <div class="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p class="mt-2 text-md font-semibold text-gray-700">
                    클릭하여 이미지 업로드 또는 드래그 앤 드롭
                </p>
                {#if imageFile}
                    <p class="text-sm text-indigo-500 mt-1 truncate max-w-full">선택된 파일: {imageFile.name}</p>
                {/if}
            </div>
            
            <input id="file-upload" type="file" accept="image/*" class="sr-only" on:change={handleImageSelect} disabled={isProcessing}>
        </label>
    </div>

    {#if imageFile}
        <div class="mb-8 p-6 bg-white border border-gray-300 rounded-lg shadow-inner">
            <h2 class="text-xl font-bold mb-3 text-gray-800">선택된 캡차 이미지 미리보기</h2>
            <div class="flex justify-center mb-4">
                 <img src={URL.createObjectURL(imageFile)} alt="Selected Captcha" class="max-w-full max-h-64 h-auto rounded-md border border-gray-200 shadow-md object-contain" />
            </div>
            
            <button 
                on:click={runOcr}
                disabled={isProcessing}
                class="w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition duration-300 ease-in-out transform hover:scale-[1.01] shadow-lg
                {isProcessing ? 'bg-gray-500 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-400/50'}"
            >
                {#if isProcessing}
                    <span class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        인식 중...
                    </span>
                {:else}
                    OCR 텍스트 인식 시작
                {/if}
            </button>
        </div>
    {/if}

    {#if recognitionResult}
        <div class="p-6 bg-green-50 border-2 border-green-400 rounded-xl shadow-inner mt-6">
            <h2 class="text-xl font-bold text-green-700 mb-3">✅ 최종 인식 결과:</h2>
            <div class="text-2xl font-mono break-all bg-white p-4 border border-green-200 rounded-lg shadow-md select-all">
                {recognitionResult}
            </div>
        </div>
    {/if}
</div>