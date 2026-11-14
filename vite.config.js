import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'

/**
 * <img data-pic="nome" sizes="..."> → src, srcset, width e height reais,
 * a partir de src/images.json (gerado por scripts/build-images.py).
 * Mantém o HTML legível e elimina layout shift no carregamento das fotos.
 */
function responsivePictures() {
  const manifest = () => JSON.parse(readFileSync(new URL('./src/images.json', import.meta.url), 'utf8'))
  return {
    name: 'riviera-responsive-pictures',
    transformIndexHtml(html) {
      const m = manifest()
      return html.replace(/<img([^>]*?)\sdata-pic="([\w-]+)"([^>]*?)>/g, (all, a, name, b) => {
        const pic = m[name]
        if (!pic) throw new Error(`Imagem desconhecida: ${name}`)
        const largest = pic.sizes[pic.sizes.length - 1]
        const fallback = pic.sizes.find((s) => s >= 1080) ?? largest
        const srcset = pic.sizes.map((s) => `img/${name}-${s}.webp ${s}w`).join(', ')
        const h = Math.round((pic.h * largest) / pic.w)
        const attrs = `${a}${b}`
        const sizes = /\ssizes=/.test(attrs) ? '' : ' sizes="100vw"'
        const decoding = /\sdecoding=/.test(attrs) ? '' : ' decoding="async"'
        const loading = /\sloading=/.test(attrs) ? '' : ' loading="lazy"'
        return `<img${attrs} src="img/${name}-${fallback}.webp" srcset="${srcset}"${sizes} width="${largest}" height="${h}"${decoding}${loading}>`
      })
    },
  }
}

function siteUrl(url) {
  return {
    name: 'riviera-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url.replace(/\/$/, '')),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: './',
    plugins: [responsivePictures(), siteUrl(env.SITE_URL || 'https://twyck.github.io/riviera-preview')],
    build: { target: 'es2020', cssMinify: true },
  }
})
