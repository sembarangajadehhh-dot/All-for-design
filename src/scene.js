// A procedural exploded-view motherboard. No model files: every part is built
// from boxes and cylinders so the whole assembly ships inside this file.
//
// buildAssembly() is pure Three.js — it never touches the DOM, so it can be
// exercised in Node (see scripts/smoke-scene.mjs) as well as in the browser.

import * as THREE from 'three'

const COLORS = {
  pcb: 0x232a24,
  pcbEdge: 0x2d352c,
  ink: 0x171613,
  graphite: 0x2b2a26,
  steel: 0x8f8c84,
  brass: 0xbfb21a,
  gold: 0xd9b552,
  chip: 0x1c1b18,
}

const easeInOut = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2

function material(color, { roughness = 0.62, metalness = 0.35, emissive = 0x000000 } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive })
}

function box(w, h, d, color, opts) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, opts))
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function cylinder(r, h, color, opts, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segments), material(color, opts))
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/* ---------------------------------------------------------------- *
 * The board
 * ---------------------------------------------------------------- */
function buildBoard() {
  const group = new THREE.Group()

  const pcb = box(26, 0.7, 20, COLORS.pcb, { roughness: 0.85, metalness: 0.1 })
  group.add(pcb)

  const edge = box(26.3, 0.14, 20.3, COLORS.brass, { roughness: 0.35, metalness: 0.9 })
  edge.position.y = -0.3
  group.add(edge)

  // Deterministic scatter of surface components — texture, not decoration.
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

  for (let i = 0; i < 90; i += 1) {
    const w = 0.25 + rand() * 0.7
    const d = 0.25 + rand() * 0.7
    const h = 0.08 + rand() * 0.3
    const chipMesh = box(w, h, d, rand() > 0.82 ? COLORS.gold : COLORS.chip, {
      roughness: 0.8,
      metalness: rand() > 0.5 ? 0.7 : 0.2,
    })
    chipMesh.position.set(-12 + rand() * 24, 0.36 + h / 2, -9.4 + rand() * 18.8)
    group.add(chipMesh)
  }

  // Sockets, slots and headers that read as a real board.
  const socket = box(6.4, 0.35, 6.4, COLORS.graphite, { roughness: 0.7 })
  socket.position.set(-4, 0.5, -1)
  group.add(socket)

  const pcie = box(16, 0.4, 0.9, COLORS.ink, { roughness: 0.5, metalness: 0.5 })
  pcie.position.set(-2, 0.55, 4.4)
  group.add(pcie)

  for (const z of [-5.6, -4.2]) {
    const slot = box(9.2, 0.45, 0.55, COLORS.ink, { roughness: 0.5, metalness: 0.5 })
    slot.position.set(8.4, 0.55, z)
    group.add(slot)
  }

  const m2slot = box(7.4, 0.22, 2.2, COLORS.ink, { roughness: 0.5, metalness: 0.5 })
  m2slot.position.set(-5.5, 0.5, 4.6)
  group.add(m2slot)

  const ioShield = box(0.5, 3.2, 8, COLORS.steel, { roughness: 0.42, metalness: 0.95 })
  ioShield.position.set(-13, 1.6, -1)
  group.add(ioShield)

  const atxPower = box(1.1, 1.2, 4.6, COLORS.ink, { roughness: 0.6 })
  atxPower.position.set(10.5, 0.9, 7.4)
  group.add(atxPower)

  return group
}

/* ---------------------------------------------------------------- *
 * Explodable parts
 * ---------------------------------------------------------------- */
function buildCpu() {
  const g = new THREE.Group()

  const chipBoard = box(4.6, 0.22, 4.6, COLORS.pcbEdge, { roughness: 0.8, metalness: 0.2 })
  chipBoard.position.y = 0.11
  g.add(chipBoard)

  const ihs = box(4.0, 0.42, 4.0, COLORS.steel, { roughness: 0.28, metalness: 1 })
  ihs.position.y = 0.42
  g.add(ihs)

  const notch = box(0.5, 0.06, 0.5, COLORS.gold, { roughness: 0.3, metalness: 1 })
  notch.position.set(-1.5, 0.65, -1.5)
  g.add(notch)

  return g
}

function buildCooler() {
  const g = new THREE.Group()

  const base = box(6.6, 0.45, 6.6, COLORS.graphite, { roughness: 0.5, metalness: 0.6 })
  g.add(base)

  for (const [x, z] of [
    [-2.1, -2.1],
    [2.1, -2.1],
    [-2.1, 2.1],
    [2.1, 2.1],
  ]) {
    const pipe = cylinder(0.22, 5.2, COLORS.brass, { roughness: 0.25, metalness: 1 }, 12)
    pipe.position.set(x, 2.6, z)
    g.add(pipe)
  }

  for (let i = 0; i < 16; i += 1) {
    const fin = box(6.2, 0.06, 5.6, COLORS.steel, { roughness: 0.35, metalness: 0.95 })
    fin.position.y = 0.5 + i * 0.31
    g.add(fin)
  }

  const shroud = box(6.4, 0.1, 5.8, COLORS.brass, { roughness: 0.3, metalness: 0.9 })
  shroud.position.y = 0.52 + 16 * 0.31
  g.add(shroud)

  return g
}

function buildRam(label) {
  const g = new THREE.Group()

  const pcb = box(0.42, 0.95, 9, COLORS.pcbEdge, { roughness: 0.8, metalness: 0.15 })
  g.add(pcb)

  const contacts = box(0.44, 0.2, 8.6, COLORS.gold, { roughness: 0.22, metalness: 1 })
  contacts.position.y = -0.38
  g.add(contacts)

  for (let i = 0; i < 8; i += 1) {
    const chipMaster = box(0.5, 0.5, 0.75, COLORS.chip, { roughness: 0.85, metalness: 0.2 })
    chipMaster.position.set(0, 0.16, -3.9 + i * 1.05)
    g.add(chipMaster)
  }

  const heatSpreader = box(0.24, 0.9, 8.4, COLORS.ink, { roughness: 0.45, metalness: 0.7 })
  heatSpreader.position.x = 0.32
  g.add(heatSpreader)

  g.userData.label = label
  return g
}

function buildGpu() {
  const g = new THREE.Group()

  const shroud = box(17, 1.9, 4.6, COLORS.ink, { roughness: 0.5, metalness: 0.55 })
  g.add(shroud)

  const spine = box(17.2, 0.2, 4.8, COLORS.brass, { roughness: 0.3, metalness: 0.9 })
  spine.position.y = 0.98
  g.add(spine)

  for (const x of [-4.2, 1.2]) {
    const fan = cylinder(1.75, 0.34, COLORS.graphite, { roughness: 0.65, metalness: 0.4 })
    fan.position.set(x, -1.1, 0)
    g.add(fan)

    const hub = cylinder(0.5, 0.4, COLORS.steel, { roughness: 0.3, metalness: 1 }, 16)
    hub.position.set(x, -1.12, 0)
    g.add(hub)

    for (let b = 0; b < 9; b += 1) {
      const blade = box(1.5, 0.1, 0.42, COLORS.graphite, { roughness: 0.6 })
      blade.position.set(x, -1.12, 0)
      blade.rotation.y = (b / 9) * Math.PI * 2
      blade.position.x += Math.cos((b / 9) * Math.PI * 2) * 0.95
      blade.position.z += Math.sin((b / 9) * Math.PI * 2) * 0.95
      g.add(blade)
    }
  }

  const connector = box(5.2, 0.75, 0.7, COLORS.gold, { roughness: 0.25, metalness: 1 })
  connector.position.set(-4.6, -1.2, 0)
  g.add(connector)

  return g
}

function buildStorage() {
  const g = new THREE.Group()

  const pcb = box(7.4, 0.16, 2.3, COLORS.pcbEdge, { roughness: 0.8, metalness: 0.15 })
  g.add(pcb)

  for (const [x, w] of [
    [-2.1, 2.1],
    [0.2, 2.1],
    [2.4, 1.6],
  ]) {
    const chipMaster = box(w, 0.24, 1.7, COLORS.chip, { roughness: 0.85 })
    chipMaster.position.set(x, 0.2, 0)
    g.add(chipMaster)
  }

  const gold = box(1.1, 0.2, 2.3, COLORS.gold, { roughness: 0.25, metalness: 1 })
  gold.position.set(3.3, 0.02, 0)
  g.add(gold)

  return g
}

function buildHeatsinkPair() {
  const g = new THREE.Group()

  for (const [x, z] of [
    [-8.6, -3.2],
    [-8.6, 1.2],
  ]) {
    const base = box(1.9, 0.5, 3.4, COLORS.graphite, { roughness: 0.55, metalness: 0.5 })
    base.position.set(x, 0.25, z)
    g.add(base)

    for (let i = 0; i < 6; i += 1) {
      const fin = box(1.9, 1.5, 0.08, COLORS.steel, { roughness: 0.35, metalness: 0.95 })
      fin.position.set(x, 1.2, z - 1.5 + i * 0.58)
      g.add(fin)
    }
  }

  return g
}

function buildPsu() {
  const g = new THREE.Group()

  const shell = box(11, 7, 8, COLORS.ink, { roughness: 0.55, metalness: 0.5 })
  g.add(shell)

  const grille = cylinder(3.1, 0.25, COLORS.steel, { roughness: 0.4, metalness: 0.85 }, 32)
  grille.position.y = 3.55
  g.add(grille)

  const fan = cylinder(2.9, 0.2, COLORS.graphite, { roughness: 0.7 }, 32)
  fan.position.y = 3.45
  g.add(fan)

  const sockets = box(6.4, 1.6, 0.4, COLORS.graphite, { roughness: 0.7 })
  sockets.position.set(1.4, 0.4, 4.05)
  g.add(sockets)

  for (let i = 0; i < 5; i += 1) {
    const port = box(0.9, 0.9, 0.5, COLORS.ink, { roughness: 0.6 })
    port.position.set(-1.4 + i * 1.35, 0.4, 4.1)
    g.add(port)
  }

  return g
}

/* ---------------------------------------------------------------- *
 * Assembly
 * ---------------------------------------------------------------- */
export function buildAssembly() {
  const root = new THREE.Group()
  root.rotation.y = -0.55

  const board = buildBoard()
  root.add(board)

  const parts = []

  const add = ({ id, label, note, object, home, offset, delay = 0, spin = 0 }) => {
    object.position.set(home[0], home[1], home[2])
    root.add(object)
    parts.push({
      id,
      label,
      note,
      object,
      home: new THREE.Vector3(...home),
      offset: new THREE.Vector3(...offset),
      delay,
      spin,
      progress: 0,
    })
  }

  add({
    id: 'cooler',
    label: 'Pendingin',
    note: 'Membuang panas CPU',
    object: buildCooler(),
    home: [-4, 0.75, -1],
    offset: [0, 11, 0],
    delay: 0.0,
    spin: 0.12,
  })

  add({
    id: 'cpu',
    label: 'CPU',
    note: 'Menjalankan instruksi',
    object: buildCpu(),
    home: [-4, 0.42, -1],
    offset: [0, 6.2, 0],
    delay: 0.08,
    spin: -0.2,
  })

  add({
    id: 'ram1',
    label: 'RAM',
    note: 'Data yang sedang dipakai',
    object: buildRam('RAM'),
    home: [8.4, 1.1, -5.6],
    offset: [4, 7.5, 5],
    delay: 0.16,
    spin: 0.4,
  })

  add({
    id: 'ram2',
    label: '',
    note: '',
    object: buildRam('RAM'),
    home: [8.4, 1.1, -4.2],
    offset: [4, 9.5, 7],
    delay: 0.2,
    spin: 0.4,
  })

  add({
    id: 'gpu',
    label: 'GPU',
    note: 'Menggambar layar & 3D',
    object: buildGpu(),
    home: [-2, 2.1, 5.6],
    offset: [-1.5, 4.5, 11],
    delay: 0.24,
    spin: 0.16,
  })

  add({
    id: 'storage',
    label: 'Penyimpanan',
    note: 'SSD / HDD',
    object: buildStorage(),
    home: [-5.5, 0.75, 4.6],
    offset: [-5, 9.5, 8],
    delay: 0.3,
    spin: -0.3,
  })

  add({
    id: 'vrm',
    label: 'VRM',
    note: 'Menstabilkan tegangan CPU',
    object: buildHeatsinkPair(),
    home: [0, 0.55, 0],
    offset: [-3, 3.2, -2],
    delay: 0.34,
  })

  add({
    id: 'psu',
    label: 'PSU',
    note: 'Sumber daya listrik',
    object: buildPsu(),
    home: [4, -5, -1],
    offset: [0, -7, 0],
    delay: 0.12,
    spin: 0.1,
  })

  const state = { explode: 0 }

  function setExplode(value) {
    state.explode = Math.min(1, Math.max(0, value))

    for (const part of parts) {
      const span = Math.max(0.0001, 1 - part.delay)
      const local = Math.min(1, Math.max(0, (state.explode - part.delay) / span))
      const eased = easeInOut(local)

      part.progress = local
      part.object.position.copy(part.home).addScaledVector(part.offset, eased)
      if (part.spin) part.object.rotation.y = part.spin * eased
    }

    root.rotation.y = -0.55 + state.explode * 0.42
  }

  setExplode(0)

  return { root, parts, setExplode, state }
}

export function buildLights(scene) {
  const hemi = new THREE.HemisphereLight(0xf3efe4, 0x2a2620, 1.6)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xfff4d6, 3.1)
  key.position.set(18, 26, 16)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xbfd0e0, 1.15)
  fill.position.set(-22, 10, -14)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xbfb21a, 1.6)
  rim.position.set(-6, -12, 18)
  scene.add(rim)

  return { hemi, key, fill, rim }
}
