// Headless check of the exploded-view model: no WebGL, no DOM.
// Verifies the scene graph builds and that every part moves the way the
// scroll choreography expects.
//
//   node scripts/smoke-scene.mjs

import { buildAssembly } from '../src/scene.js'

const { root, parts, setExplode } = buildAssembly()

const checks = []
const check = (name, ok) => checks.push({ name, ok })

check('assembly has parts', parts.length === 8)
check('root is a group with children', root.children.length >= 8)

const positions = (t) => {
  setExplode(t)
  root.updateMatrixWorld(true)
  return parts.map((p) => p.object.position.clone())
}

const assembled = positions(0)
check(
  'assembled parts sit at their home position',
  parts.every((p, i) => assembled[i].distanceTo(p.home) < 0.0001),
)

const exploded = positions(1)
check(
  'every part travels at least one unit when exploded',
  exploded.every((pos, i) => pos.distanceTo(assembled[i]) > 1),
)

check(
  'all coordinates stay finite through the scrub',
  [0, 0.13, 0.37, 0.5, 0.66, 0.82, 1].every((t) => {
    positions(t)
    return parts.every((p) => {
      const { x, y, z } = p.object.position
      return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)
    })
  }),
)

const cooler = parts.find((p) => p.id === 'cooler')
const psu = parts.find((p) => p.id === 'psu')
const cpu = parts.find((p) => p.id === 'cpu')

check('cooler lifts off the board', cooler.object.position.y > cooler.home.y + 8)
check('cpu rises under the cooler', cpu.object.position.y > cpu.home.y + 4)
check('psu drops away from the board', psu.object.position.y < psu.home.y - 5)

// Parts must not interpenetrate once fully exploded: the cooler has to clear the CPU.
check(
  'cooler clears the cpu when exploded',
  cooler.object.position.y - cpu.object.position.y > 3,
)

// Partial scrub must be monotonic — the exploded view never goes backwards.
const heights = [0.1, 0.3, 0.5, 0.7, 0.9, 1].map((t) => {
  setExplode(t)
  return cooler.object.position.y
})
check(
  'explosion is monotonic',
  heights.every((h, i) => i === 0 || h >= heights[i - 1] - 0.0001),
)

let failed = 0
for (const { name, ok } of checks) {
  if (!ok) failed += 1
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`)
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed`)
process.exit(failed ? 1 : 0)
