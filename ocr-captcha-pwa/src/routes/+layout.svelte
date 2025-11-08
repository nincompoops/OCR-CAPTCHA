<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	
	// PWA 서비스 워커 등록
	onMount(async () => {
		if ('serviceWorker' in navigator) {
			try {
				const { Workbox } = await import('workbox-window');

				const wb = new Workbox('/sw.js');

				wb.addEventListener('installed', (event) => {
					if (event.isUpdate) {
						console.log("새로운 콘텐츠를 이용할 수 있습니다. 페이지 새로고침중...")
						} else {
							console.log("PWA 콘텐츠가 성공적으로 캐시되었습니다.");
						}
				});

				await wb.register();

			} catch (error) {
				console.error('서비스 워커 등록 실패:', error);
			}
		}
	});
	
</script>

<slot />