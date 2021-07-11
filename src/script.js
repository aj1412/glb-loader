import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import * as dat from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

//loading

let mixer, idleAction, walkAction, runAction, actions

const clock = new THREE.Clock()

const textureloader = new THREE.TextureLoader()

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Sizes
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scene
const pmremGenerator = new THREE.PMREMGenerator(renderer)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xbfe3dd)
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture

// Object Animation
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/libs/draco/gltf/')
const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)
loader.load(
  '/LittlestTokyo.glb',
  function (gltf) {
    const model = gltf.scene
    // model.position.set(1, 1, 0)
    model.scale.set(0.1, 0.1, 0.1)
    const scale = gui.addFolder('scale')
    scale.add(model.scale, 'x').min(0).max(5)
    scale.add(model.scale, 'y').min(0).max(5)
    scale.add(model.scale, 'z').min(0).max(5)

    const position = gui.addFolder('position')
    position.add(model.position, 'x').min(0).max(100)
    position.add(model.position, 'y').min(0).max(100)
    position.add(model.position, 'z').min(0).max(100)
    scene.add(model)

    mixer = new THREE.AnimationMixer(model)
    mixer.clipAction(gltf.animations[0]).play()

    // const animations = gltf.animations

    // mixer = new THREE.AnimationMixer(model)

    // idleAction = mixer.clipAction(animations[0])
    // walkAction = mixer.clipAction(animations[3]).play()
    // runAction = mixer.clipAction(animations[1]).play()

    animate()
  },
  undefined,
  function (e) {
    console.error(e)
  }
)

// Lights

const ambient_light = new THREE.AmbientLight(0xffffff, 1)
ambient_light.position.x = 2
ambient_light.position.y = 3
ambient_light.position.z = 4
ambient_light.intensity = 10
scene.add(ambient_light)
// // area-light

// const width = 10
// const height = 10

// RectAreaLightUniformsLib.init()

// const intensity = 10
// const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height)
// rectLight.position.set(5, 5, 0)
// rectLight.lookAt(0, 0, 0)
// scene.add(rectLight)

// const rect = gui.addFolder('rect')
// rect.add(rectLight.position, 'x').min(-9).max(9).step(0.01)
// rect.add(rectLight.position, 'y').min(-9).max(9).step(0.01)
// rect.add(rectLight.position, 'z').min(-9).max(9).step(0.01)
// rect.add(rectLight, 'intensity').min(0).max(10).step(0.01)

// rect.add(rectLight, 'width').min(0).max(1000).step(0.01)

// const rectLightHelper = new RectAreaLightHelper(rectLight)
// rectLight.add(rectLightHelper)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 0
camera.position.y = 4
camera.position.z = -80

const camera_position = gui.addFolder('camera_position')

scene.add(camera)

camera_position.add(camera.position, 'x').min(0).max(100)
camera_position.add(camera.position, 'y').min(0).max(100)
camera_position.add(camera.position, 'z').min(0).max(100)

// Controls

// Camera Rotation Control
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0.5, 0)
controls.update()
controls.enablePan = false
controls.enableDamping = true

/**
 * Animate
 */

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()

  mixer.update(delta)

  controls.update()

  // stats.update()

  renderer.render(scene, camera)
}
