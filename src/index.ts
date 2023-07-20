import { load } from 'cheerio'

export interface VitePluginCrossOriginOpts {
  includes: string[]
  // excludes?: string[];
  extensions?: string[]
}

const defaultOpts: Partial<VitePluginCrossOriginOpts> = {
  extensions: ['css', 'js'],
}

export default function build(options: VitePluginCrossOriginOpts) {
  const opts = {
    ...defaultOpts,
    ...options,
  }
  const { includes = [], extensions } = opts
  const reg = new RegExp(`\.(${extensions!.join('|')})$`)

  return {
    name: 'html-crossorigin',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      const $ = load(html)
      const $links = $('link')
      const $scripts = $('script')
      const addCrossorigin = (_: number, el: cheerio.Element) => {
        const $el = $(el)
        const href = $el.attr('href') || $el.attr('src')
        const crossorigin = $el.attr('crossorigin')
        if (href && reg.test(href) && typeof crossorigin === 'undefined') {
          const parsed = new URL(href)
          if (includes.includes(parsed.hostname)) {
            $el.attr('crossorigin', 'anonymous')
          }
        }
      }

      $links.each(addCrossorigin)
      $scripts.each(addCrossorigin)

      return $.html()
    },
  }
}
