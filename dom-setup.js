// --- START OF FILE js/dom-setup.js ---

// --- DOM Elements ---
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const controls = document.getElementById('controls');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');
const sizeLabel = document.getElementById('size-label'); // Make sure this ID exists in HTML
const structureControlsContainer = document.getElementById('structure-controls'); // Make sure this ID exists
const infoPanel = document.getElementById('info-panel');
const vizTitle = document.getElementById('viz-title'); // Make sure this ID exists
const vizDescription = document.getElementById('viz-description'); // Make sure this ID exists
const vizArea = document.getElementById('visualization-area');
const navButtons = sidebar.querySelectorAll('button[data-viz]');

// --- State Variables ---
let currentViz = null;
// let data = []; // For sorting, etc. - Keep if used by other non-graph algos
let animationSpeed = 400; // Should be initialized from slider later
let isPaused = false;
let isRunning = false;
let animationTimeoutId = null;
let currentAlgorithm = null;
// let size = 20; // REMOVED: Global size is no longer used directly. Will be managed per visualization.
// let nodes = []; // Renamed to graphNodes
// let edges = []; // Renamed to graphEdges
let structureInstance = null; // For stack, queue etc.
let hanoiState = null;

// Graph-specific state variables
let graphNodes = [];
let graphEdges = [];
let adj = new Map();
let currentGraphConfig = { isDirected: false, isWeighted: false, numNodes: 0, layout: 'circle' }; // Added layout

let visualizations = {}; // CRITICAL: This MUST be defined here, before any algo files try to use it.

// --- Constants ---
const MAX_DATA_VALUE = 100;
const MIN_DATA_VALUE = 10;
// const HANOI_MAX_DISKS = 5; // This will be a property of the hanoi viz object itself.