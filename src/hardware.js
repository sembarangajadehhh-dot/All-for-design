// Isi Kotak — hardware explainer
// Lenis for the scroll, GSAP + ScrollTrigger for the choreography,
// Three.js for the exploded motherboard.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import Lenis from 'lenis'
import { buildAssembly, buildLights } from './scene.js'

gsap.registerPlugin(ScrollTrigger)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* ------------------------------------------------------------------ *
 * Smooth scroll
 * ------------------------------------------------------------------ */
const lenis = new Lenis({ duration: 1.05, lerp: 0.09, wheelMultiplier: 1 })

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'))
    if (!target) return
    event.preventDefault()
    lenis.scrollTo(target, { offset: -10 })
  })
})

const progressBar = document.querySelector('.progress span')
lenis.on('scroll', ({ progress }) => {
  gsap.set(progressBar, { scaleX: clamp01(progress || 0) })
})

/* ------------------------------------------------------------------ *
 * The 3D teardown
 * ------------------------------------------------------------------ */
const canvas = document.getElementById('scene')
const hint = document.getElementById('hint')
const meter = document.getElementById('meter')
const labelsRoot = document.getElementById('labels')

let assembly = null
let renderer = null
let camera = null
let scene = null
let visible = false

const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

function initScene() {
  if (!canvas) return false

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  } catch (error) {
    console.warn('WebGL tidak tersedia:', error)
    if (hint) hint.textContent = 'Browser ini belum bisa menampilkan model 3D — penjelasannya tetap lengkap di bawah.'
    return false
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.02

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x14130f)
  scene.fog = new THREE.Fog(0x14130f, 95, 165)

  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 300)
  buildLights(scene)

  assembly = buildAssembly()
  scene.add(assembly.root)

  // Labels for the parts that carry one.
  assembly.parts
    .filter((part) => part.label)
    .forEach((part, index) => {
      const el = document.createElement('div')
      el.className = 'label'
      const name = document.createElement('b')
      name.textContent = part.label
      const note = document.createElement('i')
      note.textContent = part.note
      el.append(name, note)
      labelsRoot.append(el)
      part.el = el
      part.labelShift = index % 2 === 0 ? -22 : 22
    })

  frame()
  window.addEventListener('resize', frame)

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
    },
    { rootMargin: '120px' },
  )
  observer.observe(canvas)

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  })

  gsap.ticker.add(render)

  if (reduced) {
    assembly.setExplode(0.92)
    if (hint) hint.textContent = 'Model statis — animasi dimatikan oleh pengaturan sistem.'
  }

  return true
}

function frame() {
  if (!renderer || !camera) return

  const stage = canvas.parentElement
  const width = stage.clientWidth
  const height = stage.clientHeight
  const aspect = width / Math.max(1, height)

  renderer.setSize(width, height, false)
  camera.aspect = aspect

  const distance = THREE.MathUtils.clamp(64 * (1.4 / Math.max(0.55, aspect)), 64, 112)
  const direction = new THREE.Vector3(0.58, 0.46, 0.88).normalize()
  camera.position.copy(direction.multiplyScalar(distance))
  camera.lookAt(0, 3, 0)
  camera.userData.base = camera.position.clone()
  camera.updateProjectionMatrix()
}

const projected = new THREE.Vector3()

function render(time) {
  if (!renderer || !visible) return

  pointer.x += (pointer.tx - pointer.x) * 0.06
  pointer.y += (pointer.ty - pointer.y) * 0.06

  const drift = reduced ? 0 : Math.sin(time * 0.25) * 0.012

  const base = camera.userData.base
  if (base) {
    camera.position.x += (base.x + pointer.x * 3.4 - camera.position.x) * 0.07
    camera.position.y += (base.y - pointer.y * 2.6 - camera.position.y) * 0.07
    camera.position.z += (base.z - camera.position.z) * 0.07
  }
  camera.lookAt(0, 3, 0)
  camera.rotation.z += drift
  camera.updateMatrixWorld()

  renderer.render(scene, camera)

  if (!assembly || assembly.state.explode < 0.05) {
    for (const part of assembly?.parts || []) if (part.el) part.el.style.opacity = 0
    return
  }

  const width = canvas.clientWidth
  const height = canvas.clientHeight

  for (const part of assembly.parts) {
    if (!part.el) continue

    part.object.getWorldPosition(projected)
    projected.y += 1.6
    projected.project(camera)

    const onScreen = projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.2
    const alpha = onScreen ? clamp01((part.progress - 0.15) * 5) : 0

    part.el.style.opacity = alpha.toFixed(3)
    if (alpha <= 0) continue

    const x = (projected.x * 0.5 + 0.5) * width
    const y = (-projected.y * 0.5 + 0.5) * height + part.labelShift
    part.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(16px, -50%)`
  }
}

const ready = initScene()

/* ------------------------------------------------------------------ *
 * Explode / rebuild on scroll
 * ------------------------------------------------------------------ */
const hudStages = [
  [0.02, 'Scroll untuk membuka.'],
  [0.22, 'Tutup pendingin lepas — di bawahnya ada CPU.'],
  [0.48, 'RAM dan GPU keluar dari slotnya.'],
  [0.72, 'Penyimpanan, VRM, dan PSU ikut turun.'],
  [0.95, 'Delapan bagian, satu papan.'],
]

if (ready && !reduced) {
  const scrub = { p: 0 }

  gsap.to(scrub, {
    p: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.teardown',
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.6}`,
      pin: true,
      scrub: 0.75,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    onUpdate: () => {
      assembly.setExplode(scrub.p)
      if (meter) meter.style.transform = `scaleX(${scrub.p})`
      if (hint) {
        const stage = hudStages.filter(([at]) => scrub.p >= at).pop()
        if (stage && hint.textContent !== stage[1]) hint.textContent = stage[1]
      }
    },
  })
} else if (ready && reduced) {
  if (meter) meter.style.transform = 'scaleX(1)'
}

/* ------------------------------------------------------------------ *
 * Page motion
 * ------------------------------------------------------------------ */
if (!reduced) {
  gsap.from('.nav', { y: -20, opacity: 0, duration: 0.8, ease: 'power2.out' })

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })

  intro
    .from('.hero__kicker', { y: 14, opacity: 0, duration: 0.7 }, 0)
    .from('.hero__statement', { y: 26, opacity: 0, duration: 1.05 }, 0.06)
    .from('.hero__statement .slot', { scale: 0.86, opacity: 0, duration: 0.9 }, 0.45)
    .from('.hero__foot', { y: 22, opacity: 0, duration: 0.9 }, 0.5)
    .from('.facts div', { y: 16, opacity: 0, stagger: 0.07, duration: 0.7 }, 0.6)

  // Inline photo in the sentence drifts as you scroll past it.
  gsap.to('.hero__statement .slot img', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })

  // Every component entry reveals as it arrives.
  gsap.utils.toArray('.part').forEach((entry) => {
    gsap.from(entry.querySelectorAll('.part__body > *, .part__photo'), {
      y: 30,
      opacity: 0,
      duration: 0.85,
      stagger: 0.07,
      ease: 'power2.out',
      scrollTrigger: { trigger: entry, start: 'top 82%', once: true },
    })
  })

  gsap.from('.compare__table tbody tr', {
    y: 24,
    opacity: 0,
    stagger: 0.09,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.compare__table', start: 'top 84%', once: true },
  })

  gsap.from('.flow__steps li', {
    y: 20,
    opacity: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.flow', start: 'top 86%', once: true },
  })

  gsap.from('.quiz fieldset', {
    y: 24,
    opacity: 0,
    stagger: 0.07,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.quiz__form', start: 'top 84%', once: true },
  })
}

/* ------------------------------------------------------------------ *
 * Quiz
 * ------------------------------------------------------------------ */
const KEY = { q1: 'b', q2: 'a', q3: 'b', q4: 'a', q5: 'b' }

const form = document.getElementById('quiz')
const result = document.getElementById('quiz-result')

if (form && result) {
  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const answers = new FormData(form)
    let correct = 0
    let answered = 0

    for (const [question, answer] of Object.entries(KEY)) {
      const picked = answers.get(question)
      if (picked) answered += 1
      if (picked === answer) correct += 1
    }

    if (answered < Object.keys(KEY).length) {
      result.dataset.tone = 'meh'
      result.textContent = `Baru ${answered} dari 5 soal yang dijawab.`
      return
    }

    const tone = correct >= 4 ? 'good' : 'meh'
    const verdict =
      correct === 5
        ? 'Semua benar.'
        : correct >= 3
          ? 'Sudah lumayan — baca ulang bagian yang meleset.'
          : 'Belum tepat. Buka lagi bagian komponen di atas.'

    result.dataset.tone = tone
    result.textContent = `${correct}/5 benar. ${verdict}`
  })
}

/* ------------------------------------------------------------------ *
 * Housekeeping
 * ------------------------------------------------------------------ */
if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    ScrollTrigger.refresh()
    frame()
  })
}

window.addEventListener('load', () => ScrollTrigger.refresh())
