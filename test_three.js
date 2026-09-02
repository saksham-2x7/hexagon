const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

// We need a quick trick to load it, but node doesn't have fetch/DOM for GLTFLoader by default.
