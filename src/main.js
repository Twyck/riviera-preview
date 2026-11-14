import '@fontsource/anton/index.css'
import '@fontsource/instrument-serif/index.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/inter-tight/index.css'
import 'lenis/dist/lenis.css'
import './styles.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)
ScrollTrigger.config({ ignoreMobileResize: true })

const $ = (s, root = document) => root.querySelector(s)
const $$ = (s, root = document) => [...root.querySelectorAll(s)]
const html = document.documentElement
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/* --------------------------------------------------------------------------
   Sempre abertos: relógio de São Paulo e status real da casa
   (24h, fechando só na 1ª segunda-feira do mês para manutenção)
   -------------------------------------------------------------------------- */
const spParts = () => {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', weekday: 'short', day: 'numeric', year: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date())
  return Object.fromEntries(parts.map((p) => [p.type, p.value]))
}

function updateClock() {
  const p = spParts()
  const time = `${p.hour}:${p.minute}`
  const isFirstMonday = p.weekday.toLowerCase().startsWith('seg') && Number(p.day) <= 7
  $$('[data-clock]').forEach((el) => { el.textContent = time })
  $$('[data-clock-big]').forEach((el) => { el.innerHTML = `${p.hour}<span class="colon">:</span>${p.minute}` })
  html.classList.toggle('is-closed', isFirstMonday)
  $$('[data-status-short]').forEach((el) => { el.textContent = isFirstMonday ? 'Manutenção hoje' : `Aberto agora · ${time}` })
  $$('[data-status-long]').forEach((el) => { el.textContent = isFirstMonday ? 'Hoje é dia de manutenção' : 'Aberto agora' })
  $$('[data-status-sentence]').forEach((el) => {
    el.textContent = isFirstMonday
      ? 'Hoje é a primeira segunda-feira do mês, nosso dia de manutenção. Confira no Instagram.'
      : 'Agora em São Paulo. E estamos abertos.'
  })
  $$('[data-age]').forEach((el) => { el.textContent = String(Number(p.year) - 1949) })
  $$('[data-year]').forEach((el) => { el.textContent = p.year })
}
updateClock()
setInterval(updateClock, 15000)

/* --------------------------------------------------------------------------
   Lenis + ScrollTrigger
   -------------------------------------------------------------------------- */
let lenis = null
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollToY = (y, done) => {
  if (lenis) lenis.scrollTo(y, { duration: 1.3, onComplete: done })
  else { window.scrollTo(0, y); done?.() }
}
const scrollToEl = (el) => scrollToY(el.getBoundingClientRect().top + window.scrollY, () => el.focus({ preventScroll: true }))

/* --------------------------------------------------------------------------
   Navegação
   -------------------------------------------------------------------------- */
const nav = $('[data-nav]')
const burger = $('[data-burger]')
const mmenu = $('[data-mmenu]')

function openMenu() {
  mmenu.hidden = false
  requestAnimationFrame(() => mmenu.classList.add('is-open'))
  burger.setAttribute('aria-expanded', 'true')
  $('[data-burger-label]').textContent = 'Fechar'
  nav.classList.add('is-open')
  document.body.style.overflow = 'hidden'
  lenis?.stop()
  if (!reduceMotion) gsap.fromTo($$('.mmenu__links li, .mmenu__cta, .mmenu__foot', mmenu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.05, delay: 0.2 })
  $('a', mmenu).focus({ preventScroll: true })
}
function closeMenu({ restoreFocus = true } = {}) {
  if (mmenu.hidden) return
  mmenu.classList.remove('is-open')
  burger.setAttribute('aria-expanded', 'false')
  $('[data-burger-label]').textContent = 'Menu'
  nav.classList.remove('is-open')
  document.body.style.overflow = ''
  lenis?.start()
  setTimeout(() => { mmenu.hidden = true }, reduceMotion ? 0 : 700)
  if (restoreFocus) burger.focus({ preventScroll: true })
}
burger.addEventListener('click', () => (mmenu.hidden ? openMenu() : closeMenu()))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mmenu.hidden) closeMenu() })
mmenu.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return
  const items = [burger, ...$$('a', mmenu)]
  if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus() }
  else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus() }
})

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href').slice(1)
  const target = id && document.getElementById(id)
  if (!target) return
  e.preventDefault()
  const wasOpen = !mmenu.hidden
  closeMenu({ restoreFocus: false })
  const go = () => (id === 'inicio' ? scrollToY(0) : scrollToEl(target))
  wasOpen ? setTimeout(go, 120) : go()
  history.replaceState(null, '', `#${id}`)
})

ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate(self) {
    const y = self.scroll()
    nav.classList.toggle('is-solid', y > window.innerHeight * 0.5)
    const busy = nav.contains(document.activeElement) || !mmenu.hidden
    nav.classList.toggle('is-hidden', y > window.innerHeight * 0.8 && self.direction === 1 && !busy)
  },
})
nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'))

const navLinks = $$('[data-nav-link]')
$$('[data-section]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section, start: 'top 50%', end: 'bottom 50%',
    onToggle(self) {
      if (!self.isActive) return
      navLinks.forEach((l) => (l.dataset.navLink === section.dataset.section ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')))
    },
  })
})

const sticky = $('[data-sticky-cta]')
ScrollTrigger.create({
  trigger: '.hero', start: 'bottom 70%', endTrigger: '#visite', end: 'top bottom',
  onToggle: (self) => sticky.classList.toggle('is-visible', self.isActive),
})

/* --------------------------------------------------------------------------
   Linha do tempo: progresso no scroll nativo (mobile)
   -------------------------------------------------------------------------- */
const histSection = $('#historia')
const histViewport = $('[data-hist-viewport]')
const histTrack = $('[data-hist-track]')
const histBar = $('[data-hist-bar]')
let histHorizontal = false
histViewport.addEventListener('scroll', () => {
  if (histHorizontal) return
  const max = histViewport.scrollWidth - histViewport.clientWidth
  histBar.style.transform = `scaleX(${Math.max(0.12, max > 0 ? histViewport.scrollLeft / max : 0)})`
}, { passive: true })

/* --------------------------------------------------------------------------
   Cozinha: a foto fixa troca conforme a categoria lida
   -------------------------------------------------------------------------- */
function setKitchenPhoto(key) {
  $$('.kitchen__photo').forEach((ph) => {
    const on = ph.dataset.photo === key
    if (on === ph.classList.contains('is-active')) return
    ph.classList.toggle('is-active', on)
    if (reduceMotion) return
    if (on) {
      gsap.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)', zIndex: 2 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
      gsap.fromTo($('img', ph), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out' })
    } else {
      gsap.set(ph, { zIndex: 1 })
      gsap.to(ph, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut', delay: 0.1 })
    }
  })
}
$$('[data-group]').forEach((group) => {
  ScrollTrigger.create({
    trigger: group, start: 'top 55%', end: 'bottom 55%',
    onToggle: (self) => self.isActive && setKitchenPhoto(group.dataset.group),
  })
})

/* --------------------------------------------------------------------------
   Abertura
   -------------------------------------------------------------------------- */
async function intro() {
  if (reduceMotion) { html.classList.remove('js-intro'); return }
  const img = $('.hero__cut img')
  const ready = img.complete ? Promise.resolve() : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }) })
  await Promise.race([Promise.all([ready, document.fonts?.ready]), wait(1500)])

  const a = SplitText.create('[data-hero-a]', { type: 'chars', charsClass: 'char', mask: 'chars', aria: 'none' })
  const b = SplitText.create('[data-hero-b]', { type: 'chars', charsClass: 'char', mask: 'chars', aria: 'none' })
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
  tl.from(a.chars, { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.1)
    .from(b.chars, { yPercent: -110, duration: 1.1, stagger: 0.05 }, 0.25)
    .from('[data-hero-cut]', { yPercent: 40, rotate: -6, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.55)
    .from('[data-intro]', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 1)
    .from('.nav', { autoAlpha: 0, duration: 0.8 }, 0.9)
  html.classList.remove('js-intro')
}

/* --------------------------------------------------------------------------
   Coreografia
   -------------------------------------------------------------------------- */
function choreography() {
  const mm = gsap.matchMedia()

  mm.add({ desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
    const { desktop, motion } = ctx.conditions
    if (!motion) return

    /* Hero: as palavras se abrem e o recorte avança na direção de quem rola */
    if (desktop) {
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to('[data-hero-a]', { xPercent: -28, ease: 'none' }, 0)
        .to('[data-hero-b]', { xPercent: 28, ease: 'none' }, 0)
        .to('[data-hero-cut]', { scale: 1.18, yPercent: -6, ease: 'none' }, 0)
        .to('.hero__foot', { opacity: 0, yPercent: -40, ease: 'none' }, 0)
    } else {
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to('[data-hero-a]', { xPercent: -18, ease: 'none' }, 0)
        .to('[data-hero-b]', { xPercent: 18, ease: 'none' }, 0)
    }

    /* Linha do tempo horizontal guiada pelo scroll vertical (desktop) */
    if (desktop) {
      histSection.classList.add('is-horizontal')
      histHorizontal = true
      const distance = () => Math.max(0, histTrack.scrollWidth - histViewport.clientWidth)
      const tween = gsap.to(histTrack, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: {
          trigger: '[data-hist]', start: 'top top', end: () => `+=${distance()}`,
          pin: true, scrub: 0.8, invalidateOnRefresh: true,
          refreshPriority: 1, // calcula antes dos gatilhos que vêm depois na página
          onUpdate: (self) => { histBar.style.transform = `scaleX(${Math.max(0.12, self.progress)})` },
        },
      })
      // O ano "acende" (contorno vira preenchimento) quando o capítulo chega ao centro
      $$('.chap:not(.chap--now) .chap__year', histTrack).forEach((y) => {
        gsap.fromTo(y, { color: 'rgba(236, 29, 38, 0)' }, { color: 'rgba(236, 29, 38, 1)', ease: 'none', scrollTrigger: { trigger: y, containerAnimation: tween, start: 'left 70%', end: 'left 35%', scrub: true } })
      })
      const amoeba = $('[data-amoeba]')
      gsap.fromTo(amoeba, { rotate: -24, scale: 0.7 }, { rotate: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: amoeba, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } })
      return () => { histSection.classList.remove('is-horizontal'); histHorizontal = false }
    }
  })

  mm.add({ desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
    const { desktop, motion } = ctx.conditions
    if (!motion) return

    /* Manifesto: cada estrofe acende ao ser lida; o risco sublinha o refrão */
    $$('[data-stanza]').forEach((st) => {
      gsap.fromTo(st, { opacity: 0.12, y: 30 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: st, start: 'top 88%', end: 'top 55%', scrub: true } })
    })
    $$('.refrain__mark path').forEach((path) => {
      const len = path.getTotalLength()
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: path.closest('.refrain'), start: 'top 70%', end: 'top 40%', scrub: true } })
    })

    /* Títulos */
    $$('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 86%', once: true } }),
      })
    })
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 24, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
    })

    /* Parallax em camadas */
    $$('[data-parallax]').forEach((el) => {
      const v = parseFloat(el.dataset.parallax) * (desktop ? 1 : 0.5)
      gsap.fromTo(el, { yPercent: v }, { yPercent: -v, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })

    /* Cartuns colados: giram um pouco como adesivos */
    $$('.drinks__cartoon, .visit__cartoon').forEach((el, i) => {
      gsap.fromTo(el, { rotate: i % 2 ? 12 : -12 }, { rotate: i % 2 ? 4 : -4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true } })
    })

    /* Pizzas: os nomes deslizam para dentro, só até o limite do espaço livre da linha */
    $$('.pizza').forEach((row, i) => {
      const name = $('.pizza__name', row)
      const room = () => {
        const pad = parseFloat(getComputedStyle(row).paddingLeft) * 2
        return Math.max(0, Math.min(row.clientWidth - pad - name.scrollWidth, window.innerWidth * 0.14))
      }
      const sign = i % 2 === 0 ? 1 : -1 // linhas alinhadas à esquerda vão para a direita, e vice-versa
      gsap.fromTo(name, { x: 0 }, {
        x: () => sign * room(), ease: 'none',
        scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      })
    })

    /* Relógio gigante entra subindo */
    gsap.from('.visit__clock', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.visit', start: 'top 70%', once: true } })

    /* Assinatura no rodapé */
    gsap.from('[data-foot-logo] img', { yPercent: 30, opacity: 0, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: '.foot', start: 'top 70%', once: true } })
  })
}

intro()
choreography()
document.fonts?.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => {
  ScrollTrigger.refresh()
  const id = location.hash.slice(1)
  const target = id && document.getElementById(id)
  if (target && id !== 'inicio') scrollToEl(target)
})
