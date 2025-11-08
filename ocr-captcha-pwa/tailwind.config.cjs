// tailwind.config.cjs

// CJS 파일이므로 module.exports를 사용합니다.
module.exports = {
    // 1. content 경로 확인: SvelteKit에서 사용하는 모든 경로를 포함합니다.
    content: [
        './src/**/*.{html,js,svelte,ts}',
    ],
    theme: {
        extend: {},
    },
    // 2. plugins 배열 내에서 require()를 사용하여 플러그인을 로드합니다.
    plugins: [
        // 이전에 typography 플러그인을 추가하려고 하셨으므로 포함했습니다.
        require('@tailwindcss/typography'),
        // forms 플러그인이 필요하다면 주석을 풀고 추가합니다.
        // require('@tailwindcss/forms'),
    ],
};