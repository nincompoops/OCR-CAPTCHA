<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import '../app.css';

    onMount(() => {
        // 메인 페이지 방문 시 OCR 페이지로 바로 리디렉션
        goto('/ocr');
    });
</script>

<div class="flex items-center justify-center min-h-screen">
    <p class="text-xl text-gray-500">OCR Captcha Solver 페이지로 이동 중...</p>
</div>