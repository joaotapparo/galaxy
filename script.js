import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/* ---------------------------------- Base ---------------------------------- */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// AxesHelper
scene.add(new THREE.AxesHelper(2))
/* ------------------------------- Parameters ------------------------------- */
const parameters = {} //this object will populate with...
parameters.particlesCount = 100000 // number of particles or 'stars'
parameters.particlesSize = 0.01
parameters.galaxyRadius = 5
parameters.galaxyBranches = 3
parameters.galaxySpin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'


/* --------------------------------- Galaxy --------------------------------- */
let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    
    // Destroy old galaxy
    if( points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    
    // Geometry
    geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(parameters.particlesCount * 3) // time is times 3 because, one vertex has 'x, y, z'
    const colors = new Float32Array(parameters.particlesCount * 3)
    
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.particlesCount; i++)
    {
        const i3 = i * 3 

        // Position
        const radius = Math.random() * parameters.galaxyRadius
        const galaxyBranchesAngle = (i % parameters.galaxyBranches) / parameters.galaxyBranches * Math.PI * 2
        const galaxySpinAngle = radius * parameters.galaxySpin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius        
        
        positions[i3    ] = Math.cos(galaxyBranchesAngle + galaxySpinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(galaxyBranchesAngle + galaxySpinAngle) * radius + randomZ
        
        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.galaxyRadius)
        
        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)) // here needs to be 3 cause positions, necessary need 'x, y, z'
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Material
    material = new THREE.PointsMaterial({
        size: parameters.particlesSize,
        sizeAttenuation: true,
        depthWrite: true,
        blending: THREE.AdditiveBlending, // the more layers the brighter it will be
        vertexColors: true
    })
    
    // Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy()
/* --------------------------------- Tweaks --------------------------------- */
const parametersTweaks = gui.addFolder('Parameters')

parametersTweaks.add(parameters, 'particlesCount', 0, 500000, 100).onFinishChange(generateGalaxy)
parametersTweaks.add(parameters, 'particlesSize', 0, 1, 0.01).onFinishChange(generateGalaxy)
parametersTweaks.add(parameters, 'galaxyRadius', 0.01, 20, 0.01).onFinishChange(generateGalaxy)
parametersTweaks.add(parameters, 'galaxyBranches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
parametersTweaks.add(parameters, 'galaxySpin').min(- 5).max(5).step(0.001).onFinishChange(generateGalaxy)
parametersTweaks.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
parametersTweaks.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
parametersTweaks.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
parametersTweaks.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

/* ---------------------------------- Sizes --------------------------------- */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

/* --------------------------------- Camera --------------------------------- */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/* -------------------------------- Renderer -------------------------------- */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/* --------------------------------- Animate -------------------------------- */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()