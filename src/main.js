// Both libraries are resolved from this repo, not from a CDN:
//   gsap  -> vendor/gsap        (file: dependency, esm build)
//   lenis -> vendor/lenis       (file: dependency, built with tsdown)
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ *
 * Lenis drives the page; GSAP's ticker drives Lenis.
 * ------------------------------------------------------------------ */
const lenis = new Lenis({
  duration: 1.05,
  lerp: 0.09,
  smoothWheel: true,
  wheelMultiplier: 1,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// In-page anchors go through Lenis so smooth scroll stays in charge.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'))
    if (!target) return
    event.preventDefault()
    lenis.scrollTo(target, { offset: -20 })
  })
})

/* ------------------------------------------------------------------ *
 * Motion
 * ------------------------------------------------------------------ */
if (!reduced) {
  const split = new SplitText('.hero__title', { type: 'lines,words', linesClass: 'line-mask' })

  gsap.set(split.words, { yPercent: 118, rotate: 2 })

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })

  intro
    .from('.nav', { yPercent: -120, opacity: 0, duration: 1.1 })
    .from('.hero__kicker', { y: 16, opacity: 0, duration: 0.8 }, 0.15)
    .to(split.words, { yPercent: 0, rotate: 0, duration: 1.35, stagger: 0.045 }, 0.25)
    .from('.hero__lede', { y: 22, opacity: 0, duration: 1 }, 0.7)
    .from('.hero__meta > div', { y: 18, opacity: 0, stagger: 0.08, duration: 0.8 }, 0.85)
    .from('.scroll-cue', { opacity: 0, duration: 0.8 }, 1.1)

  // Hero drifts up and fades as the next section arrives.
  gsap.to('.hero', {
    yPercent: -12,
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })

  // Marquee drifts against the scroll direction.
  gsap.to('.marquee__track', {
    xPercent: -18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })

  // Pinned horizontal gallery.
  const track = document.querySelector('.pin__track')
  const distance = () => track.scrollWidth - window.innerWidth + 40

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.pin',
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })

  gsap.from('.card', {
    y: 60,
    opacity: 0,
    stagger: 0.09,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.pin',
      start: 'top 70%',
      once: true,
    },
  })

  // Library rows.
  gsap.from('.libs__list li', {
    y: 30,
    opacity: 0,
    stagger: 0.08,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.libs__list',
      start: 'top 82%',
      once: true,
    },
  })

  gsap.from('.start__grid pre', {
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.start__grid',
      start: 'top 85%',
      once: true,
    },
  })
}

/* ------------------------------------------------------------------ *
 * Scroll progress bar
 * ------------------------------------------------------------------ */
const bar = document.querySelector('.progress span')
lenis.on('scroll', ({ progress }) => {
  gsap.set(bar, { scaleX: progress || 0 })
})

// Cards need fresh measurements once webfonts land.
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh())
}
