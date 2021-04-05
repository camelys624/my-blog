import React, { Component } from "react"
import indexStyle from "./index.module.css"
import Header from "../components/header"
import Content from "../components/content"
import * as THREE from "three"

// import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"
// import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { OBJLoader2 } from "three/examples/jsm/loaders/OBJLoader2"
import { MtlObjBridge } from "three/examples/jsm/loaders/obj2/bridge/MtlObjBridge"
import { graphql } from "gatsby"

const OBJLoader2Example = function(elementToBindTo) {
  this.renderer = null
  this.canvas = elementToBindTo
  this.aspectRatio = 1
  this.recalcAspectRatio()

  this.scene = null
  this.cameraDefaults = {
    posCamera: new THREE.Vector3(0.0, 175.0, 500.0),
    posCameraTarget: new THREE.Vector3(0, 0, 0),
    near: 0.1,
    far: 10000,
    fov: 45
  }
  this.camera = null
  this.cameraTarget = this.cameraDefaults.posCameraTarget

  this.controls = null
}

OBJLoader2Example.prototype = {
  constructor: OBJLoader2Example,
  initGL: function() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      autoClear: true
    })
    this.renderer.setClearColor(0x050505)

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(this.cameraDefaults.fov,
      this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far)
    this.resetCamera()
    // this.controls = new DeviceOrientationControls(this.camera, this.renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0x404040)
    const directionalLight1 = new THREE.DirectionalLight(0x514493)
    const directionalLight2 = new THREE.DirectionalLight(0xFF9000)

    directionalLight1.position.set(-1000, -500, 1000)
    directionalLight2.position.set(1000, 500, -1000);

    this.scene.add(directionalLight1);
    this.scene.add(directionalLight2);
    this.scene.add(ambientLight);

    // const helper = new THREE.GridHelper(1200, 60, 0xFF4444, 0x404040);
    // this.scene.add(helper);
  },
  initContent: function() {
    const modelName = 'female02';
    // this._reportProgress({detail: {text: 'loading: ' + modelName}});

    const scope = this;
    const objLoader2 = new OBJLoader2();
    const callbackOnLoad = function(object3d) {
      scope.scene.add(object3d);
      console.log('Loading complete: ' + modelName);
      // scope._reportProgress({detail: {text: ''}});
    };

    const onLoadMtl = function(mtlParseResult) {
      objLoader2.setModelName( modelName );
      objLoader2.setLogging(true, true);
      objLoader2.addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult), true);
      objLoader2.load('./test3.obj', callbackOnLoad, null, null, null);
    };

    const mtlLoader = new MTLLoader();
    mtlLoader.load('./test3.mtl', onLoadMtl);
  },
  resizeDisplayGL: function() {
    // this.controls.handleResize();

    this.recalcAspectRatio();
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false);

    this.updateCamera();
  },
  recalcAspectRatio: function() {
    this.aspectRatio = (this.canvas.offsetHeight === 0) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
  },
  resetCamera: function() {
    this.camera.position.copy(this.cameraDefaults.posCamera);
    this.cameraTarget.copy(this.cameraDefaults.posCameraTarget);

    this.updateCamera();
  },
  updateCamera: function () {
    this.camera.aspect = this.aspectRatio;
    this.camera.lookAt(this.cameraTarget);
    this.camera.updateProjectionMatrix();
  },
  render: function() {
    if (!this.renderer.autoClear) this.renderer.clear();
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

class LineTension extends Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 500,
      width: 300,
      margin: 30,
      duration: 500
    }

  }

  async componentDidMount() {
    const width = document.body.clientWidth
    await this.setState(state => ({ width: width }))
    this.renderChart()
  }

  renderChart() {
    const app = new OBJLoader2Example(document.getElementById('myCanvas'));

    const resizeWindow = function () {
      app.resizeDisplayGL();
    }

    const render = function () {
      requestAnimationFrame(render);
      app.render();
    }

    window.addEventListener('resize', resizeWindow, false);

    console.log('Starting initialisation phase...');

    app.initGL();
    app.resizeDisplayGL();
    app.initContent();

    render();
  }

  render() {
    return (
      <div id="lineTensionChart" className={indexStyle.myIndexChart}>
        <canvas id="myCanvas" className={indexStyle.myCanvas}></canvas>
      </div>
    )
  }
}


export default function Home({ data }) {
  return (
    <div>
      <Header/>
      <LineTension/>
      <Content data={data}/>
    </div>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
