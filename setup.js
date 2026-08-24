const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. vite.config.ts
fs.writeFileSync(path.join(__dirname, 'vite.config.ts'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  }
});
`);

// 2. tsconfig.json
fs.writeFileSync(path.join(__dirname, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx',
    strict: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noFallthroughCasesInSwitch: true
  },
  include: ['src', 'server']
}, null, 2));

// 3. tailwind.config.js
fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          yellow: '#F9D342',
          lightYellow: '#FFF9D2',
          cream: '#FFFBEB',
          dark: '#1E232A',
          gray: '#6C7A89',
          border: '#1E232A'
        }
      },
      boxShadow: {
        'pop': '4px 4px 0px #1E232A',
        'pop-lg': '6px 6px 0px #1E232A',
        'pop-sm': '2px 2px 0px #1E232A',
        'pop-pressed': '1px 1px 0px #1E232A',
      },
      fontFamily: {
        bangla: ['"Baloo Da 2"', 'sans-serif'],
        display: ['Fredoka', 'sans-serif']
      }
    },
  },
  plugins: [],
};
`);

// 4. postcss.config.js
fs.writeFileSync(path.join(__dirname, 'postcss.config.js'), `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

// 5. index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Department Clash 2026</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@500;600;700;800&family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F9D342] text-[#1E232A] select-none touch-manipulation overflow-x-hidden font-display">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

console.log('Setup completed!');
