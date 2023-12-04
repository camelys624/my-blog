import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

import './index.css'

let camera, scene, renderer

let grid
let controls
let container

const wheels = []

const render = () => {
  controls.update()
  const time = - performance.now() / 1000
  for (let i = 0; i < wheels.length; i++) {
    wheels[i].rotation.x = time * Math.PI * 2
  }

  grid.position.z = - (time) % 1
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.offsetWidth, container.offsetHeight)
}

const init = () => {
  container = document.getElementById("container")

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  renderer.setAnimationLoop(render)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.85
  container.appendChild(renderer.domElement)

  window.addEventListener("resize", onWindowResize)

  camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 0.1, 100)
  camera.position.set(4.25, 1.4, - 4.5)

  controls = new OrbitControls(camera, container)
  controls.enableZoom = false
  controls.maxDistance = 9
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90)
  controls.target.set(0, 0.5, 0)
  controls.update()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x333333)
  scene.environment = new RGBELoader().load("./venice_sunset_1k.hdr")
  scene.environment.mapping = THREE.EquirectangularReflectionMapping
  scene.fog = new THREE.Fog(0x333333, 10, 15)

  grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff)
  grid.material.opacity = 0.2
  grid.material.depthWrite = false
  grid.material.transparent = true
  scene.add(grid)

  // materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 1.0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
  })

  const detailsMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0,
    transmission: 1.0
  })

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.5
  })

  const bodyColorInput = document.getElementById("body-color")
  bodyColorInput.addEventListener("input", function(e) {
    bodyMaterial.color.set(e.target.value)
  })

  const detailsColorInput = document.getElementById("details-color")
  detailsColorInput.addEventListener("input", function(e) {
    detailsMaterial.color.set(e.target.value)
  })

  const glassColorInput = document.getElementById("glass-color")
  glassColorInput.addEventListener("input", function (e) {
    glassMaterial.color.set(e.target.value)
  })

  // Car
  const shadow = new THREE.TextureLoader().load("./ferrari_ao.png")
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath("libs/")

  const loader = new GLTFLoader()
  loader.setDRACOLoader(dracoLoader)

  loader.load("./ferrari.glb", function(gltf) {
    const carModel = gltf.scene.children[0]
    carModel.getObjectByName("body").material = bodyMaterial

    carModel.getObjectByName("rim_fl").material = detailsMaterial
    carModel.getObjectByName("rim_fr").material = detailsMaterial
    carModel.getObjectByName("rim_rr").material = detailsMaterial
    carModel.getObjectByName("rim_rl").material = detailsMaterial
    carModel.getObjectByName("trim").material = detailsMaterial

    carModel.getObjectByName("glass").material = glassMaterial
    
    wheels.push(
      carModel.getObjectByName("wheel_fl"),
      carModel.getObjectByName("wheel_fr"),
      carModel.getObjectByName("wheel_rl"),
      carModel.getObjectByName("wheel_rr")
    )

    // shadow
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        map: shadow,
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true
      })
    )
    mesh.rotation.x = - Math.PI / 2
    mesh.renderOrder = 2
    carModel.add(mesh)

    scene.add(carModel)
  })
}

export default function Car3D() {
  useEffect(() => {
    init()
  }, [])

  return (<div className="carContainer">
    <div id="info">
      <span className="colorPicker"><input id="body-color" type="color" value="#ff0000"></input><br/>Body</span>
			<span className="colorPicker"><input id="details-color" type="color" value="#ffffff"></input><br/>Details</span>
			<span className="colorPicker"><input id="glass-color" type="color" value="#ffffff"></input><br/>Glass</span>
    </div>
    <div id="container" style={{height: '500px'}}></div>
  </div>
  )
}
