// Bundles the built site into one portable HTML file: CSS, JS, and every image
// inlined, so it opens by double-click with no server and no repo.
//
//   node scripts/bundle-single.mjs   ->  isi-kotak.html

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

console.log('• building with relative asset paths…')
execFileSync('npx', ['vite', 'build', '--base', './'], { cwd: root, stdio: 'inherit' })

let html = readFileSync(join(dist, 'index.html'), 'utf8')

const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' }

const dataUri = (filePath) => {
  const ext = extname(filePath).toLowerCase()
  const body = readFileSync(filePath).toString('base64')
  return `data:${mime[ext] || 'application/octet-stream'};base64,${body}`
}

// 1. Stylesheet -> <style>
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (tag, href) => {
  if (/^https?:/.test(href)) return tag // remote (Google Fonts) stays a link
  const file = join(dist, href.replace(/^\.?\//, ''))
  return `<style>\n${readFileSync(file, 'utf8')}\n</style>`
})

// 2. Module script -> inline <script>
html = html.replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (tag, pre, src, post) => {
  if (/^https?:/.test(src)) return tag
  const file = join(dist, src.replace(/^\.?\//, ''))
  const code = readFileSync(file, 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${code}\n</script>`
})

// 3. Images -> data URIs
html = html.replace(/src="(\.?\/img\/[^"]+)"/g, (tag, src) => {
  const file = join(root, 'public', src.replace(/^\.?\//, ''))
  if (!existsSync(file)) {
    console.warn(`  ! missing image, left as-is: ${src}`)
    return tag
  }
  return `src="${dataUri(file)}"`
})

// 4. The lab page does not exist inside a single file — drop that footer link.
html = html.replace(/<p><a href="\/lab\.html">[^<]*<\/a><\/p>/, '<p>Versi satu file — bisa dibuka tanpa server.</p>')

// 5. Tell the reader what this file is.
html = html.replace(
  '</head>',
  '  <meta name="generator" content="isi-kotak single-file build" />\n  </head>',
)

const out = join(root, 'isi-kotak.html')
writeFileSync(out, html)

const kb = (statSync(out).size / 1024).toFixed(0)
console.log(`\n✓ ${out}  (${kb} kB, semua aset tertanam)`)
