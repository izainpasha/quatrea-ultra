// GitHub Pages SPA support: serve the app for deep links, and skip Jekyll.
import { copyFileSync, writeFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')
console.log('postbuild: 404.html + .nojekyll written')
