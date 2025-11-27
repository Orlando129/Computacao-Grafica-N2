/**
 * Módulo Principal da Aplicação
 * Orquestra a interação entre canvas 2D, geração de curvas, revolução e renderização 3D
 */

import { ProfilePoints, generateProfile } from './curve2D.js';
import { RevolutionSurface } from './revolution.js';
import { Renderer3D } from './renderer3D.js';
import { exportJSON, exportOBJ, exportSTL } from './exporter.js';

// Estado da aplicação
const state = {
    profilePoints: new ProfilePoints(),
    currentSurface: new RevolutionSurface(),
    curveType: 'bezier',
    curveDegree: 3,
    curveResolution: 50,
    revolutionAxis: 'y',
    revolutionAngle: 360,
    angularSubdivisions: 32,
    isDragging: false,
    dragPointIndex: -1
};

// Elementos DOM
let canvas2D, ctx2D, renderer3D;

/**
 * Inicializa a aplicação
 */
function init() {
    // Canvas 2D
    canvas2D = document.getElementById('canvas2D');
    ctx2D = canvas2D.getContext('2d');
    setupCanvas2D();

    // Renderer 3D
    const container3D = document.getElementById('canvas3D');
    renderer3D = new Renderer3D(container3D);

    // Event listeners
    setupEventListeners();

    // Adiciona perfil exemplo (vaso)
    initializeExampleProfile();

    // Desenha estado inicial
    render2D();
    updateInfo();
    
    // Gera superfície inicial
    regenerateSurface();
}

/**
 * Inicializa com um perfil de exemplo (vaso)
 */
function initializeExampleProfile() {
    const w = canvas2D.width / (window.devicePixelRatio || 1);
    const h = canvas2D.height / (window.devicePixelRatio || 1);
    const centerX = w / 2;
    const centerY = h / 2;

    // Perfil de um vaso simples
    const examplePoints = [
        { x: centerX + 20, y: centerY - 150 },  // Topo interno
        { x: centerX + 80, y: centerY - 100 },  // Borda superior
        { x: centerX + 60, y: centerY },        // Meio
        { x: centerX + 90, y: centerY + 100 },  // Base larga
        { x: centerX + 50, y: centerY + 140 }   // Fundo
    ];

    examplePoints.forEach(p => state.profilePoints.addPoint(p.x, p.y));
}

/**
 * Configura canvas 2D
 */
function setupCanvas2D() {
    const container = canvas2D.parentElement;
    canvas2D.width = container.clientWidth;
    canvas2D.height = container.clientHeight;

    // High-DPI
    const dpr = window.devicePixelRatio || 1;
    canvas2D.width = container.clientWidth * dpr;
    canvas2D.height = container.clientHeight * dpr;
    canvas2D.style.width = `${container.clientWidth}px`;
    canvas2D.style.height = `${container.clientHeight}px`;
    ctx2D.scale(dpr, dpr);
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Canvas 2D - Mouse events
    canvas2D.addEventListener('mousedown', onCanvas2DMouseDown);
    canvas2D.addEventListener('mousemove', onCanvas2DMouseMove);
    canvas2D.addEventListener('mouseup', onCanvas2DMouseUp);
    canvas2D.addEventListener('contextmenu', onCanvas2DRightClick);

    // Previne scroll no canvas 2D
    canvas2D.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    // Controles de curva
    document.querySelectorAll('input[name="curveType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.curveType = e.target.value;
            regenerateAll();
        });
    });

    document.getElementById('curveDegree').addEventListener('input', (e) => {
        state.curveDegree = parseInt(e.target.value);
        document.getElementById('degreeValue').textContent = e.target.value;
        regenerateAll();
    });

    document.getElementById('curveResolution').addEventListener('input', (e) => {
        state.curveResolution = parseInt(e.target.value);
        document.getElementById('resolutionValue').textContent = e.target.value;
        regenerateAll();
    });

    // Controles de revolução
    document.getElementById('axisSelect').addEventListener('change', (e) => {
        state.revolutionAxis = e.target.value;
        regenerateSurface();
    });

    document.getElementById('revolutionAngle').addEventListener('input', (e) => {
        state.revolutionAngle = parseInt(e.target.value);
        document.getElementById('angleValue').textContent = e.target.value;
        regenerateSurface();
    });

    document.getElementById('angularSubdivisions').addEventListener('input', (e) => {
        state.angularSubdivisions = parseInt(e.target.value);
        document.getElementById('subdivValue').textContent = e.target.value;
        regenerateSurface();
    });

    // Botões de ação
    document.getElementById('clearProfile').addEventListener('click', clearProfile);
    document.getElementById('resetCamera2D').addEventListener('click', () => {
        setupCanvas2D();
        render2D();
    });
    document.getElementById('resetCamera3D').addEventListener('click', () => {
        renderer3D.resetCamera();
    });

    // Modo de visualização 3D
    document.getElementById('viewMode').addEventListener('change', (e) => {
        renderer3D.setViewMode(e.target.value);
    });

    // Exportação
    document.getElementById('exportJSON').addEventListener('click', () => {
        const profileData = {
            controlPoints: state.profilePoints.getPoints(),
            curveType: state.curveType,
            degree: state.curveDegree,
            resolution: state.curveResolution
        };
        exportJSON(state.currentSurface.getData(), profileData);
    });

    document.getElementById('exportOBJ').addEventListener('click', () => {
        exportOBJ(state.currentSurface.getData());
    });

    document.getElementById('exportSTL').addEventListener('click', () => {
        exportSTL(state.currentSurface.getData());
    });

    // Resize
    window.addEventListener('resize', () => {
        setupCanvas2D();
        render2D();
    });
}

/**
 * Event handler: Mouse down no canvas 2D
 */
function onCanvas2DMouseDown(e) {
    const rect = canvas2D.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verifica se clicou em um ponto existente
    const pointIndex = state.profilePoints.findPointAt(x, y);
    
    if (pointIndex !== -1) {
        state.isDragging = true;
        state.dragPointIndex = pointIndex;
    } else {
        // Adiciona novo ponto
        state.profilePoints.addPoint(x, y);
        regenerateAll();
    }
}

/**
 * Event handler: Mouse move no canvas 2D
 */
function onCanvas2DMouseMove(e) {
    if (state.isDragging && state.dragPointIndex !== -1) {
        const rect = canvas2D.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        state.profilePoints.movePoint(state.dragPointIndex, x, y);
        regenerateAll();
    }
}

/**
 * Event handler: Mouse up no canvas 2D
 */
function onCanvas2DMouseUp(e) {
    state.isDragging = false;
    state.dragPointIndex = -1;
}

/**
 * Event handler: Right click no canvas 2D (remove ponto)
 */
function onCanvas2DRightClick(e) {
    e.preventDefault();
    
    const rect = canvas2D.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pointIndex = state.profilePoints.findPointAt(x, y);
    if (pointIndex !== -1) {
        state.profilePoints.removePoint(pointIndex);
        regenerateAll();
    }
}

/**
 * Limpa o perfil
 */
function clearProfile() {
    state.profilePoints.clear();
    state.currentSurface.clear();
    regenerateAll();
}

/**
 * Regenera curva 2D e superfície 3D
 */
function regenerateAll() {
    render2D();
    regenerateSurface();
    updateInfo();
}

/**
 * Regenera apenas a superfície 3D
 */
function regenerateSurface() {
    const controlPoints = state.profilePoints.getPoints();
    
    if (controlPoints.length < 2) {
        state.currentSurface.clear();
        renderer3D.updateSurface(null);
        updateInfo();
        return;
    }

    // Gera perfil de curva
    const profileCurve = generateProfile(
        controlPoints,
        state.curveType,
        state.curveDegree,
        state.curveResolution
    );

    if (profileCurve.length === 0) {
        console.warn('Perfil vazio, não é possível gerar superfície');
        return;
    }

    // Valida e ajusta perfil para revolução
    const validProfile = validateAndAdjustProfile(profileCurve);

    if (validProfile.length < 2) {
        console.warn('Perfil inválido para revolução');
        return;
    }

    console.log('Gerando superfície com', validProfile.length, 'pontos do perfil');

    // Gera superfície de revolução
    state.currentSurface.generate(
        validProfile,
        state.revolutionAxis,
        state.revolutionAngle,
        state.angularSubdivisions
    );

    console.log('Superfície gerada:', state.currentSurface.getStats());

    // Atualiza renderização 3D
    renderer3D.updateSurface(state.currentSurface.getData());
    updateInfo();
}

/**
 * Valida e ajusta perfil para revolução
 * Remove pontos muito próximos ao eixo e ajusta coordenadas
 */
function validateAndAdjustProfile(profilePoints) {
    const w = canvas2D.width / (window.devicePixelRatio || 1);
    const h = canvas2D.height / (window.devicePixelRatio || 1);
    const centerX = w / 2;
    const centerY = h / 2;

    const validPoints = [];
    const minDistance = 5; // Distância mínima do eixo

    for (const point of profilePoints) {
        let adjustedPoint = { x: 0, y: 0 };

        switch (state.revolutionAxis) {
            case 'y':
                // Eixo Y vertical no centro
                // x -> distância do eixo (raio)
                // y -> altura
                const radiusY = Math.abs(point.x - centerX);
                if (radiusY >= minDistance) {
                    adjustedPoint.x = radiusY;
                    adjustedPoint.y = point.y - centerY;
                    validPoints.push(adjustedPoint);
                }
                break;

            case 'x':
                // Eixo X horizontal no centro
                const radiusX = Math.abs(point.y - centerY);
                if (radiusX >= minDistance) {
                    adjustedPoint.x = radiusX;
                    adjustedPoint.y = point.x - centerX;
                    validPoints.push(adjustedPoint);
                }
                break;

            case 'z':
                // Eixo Z (perpendicular ao plano)
                adjustedPoint.x = point.x - centerX;
                adjustedPoint.y = point.y - centerY;
                validPoints.push(adjustedPoint);
                break;
        }
    }

    return validPoints;
}

/**
 * Renderiza canvas 2D (perfil e curva)
 */
function render2D() {
    const w = canvas2D.width / (window.devicePixelRatio || 1);
    const h = canvas2D.height / (window.devicePixelRatio || 1);

    // Limpa canvas
    ctx2D.fillStyle = '#ffffff';
    ctx2D.fillRect(0, 0, w, h);

    // Desenha eixo de revolução
    drawRevolutionAxis();

    const controlPoints = state.profilePoints.getPoints();

    if (controlPoints.length === 0) return;

    // Desenha curva gerada
    if (controlPoints.length >= 2) {
        const profileCurve = generateProfile(
            controlPoints,
            state.curveType,
            state.curveDegree,
            state.curveResolution
        );
        drawCurve(profileCurve);
    }

    // Desenha polígono de controle
    drawControlPolygon(controlPoints);

    // Desenha pontos de controle
    drawControlPoints(controlPoints);
}

/**
 * Desenha eixo de revolução
 */
function drawRevolutionAxis() {
    const w = canvas2D.width / (window.devicePixelRatio || 1);
    const h = canvas2D.height / (window.devicePixelRatio || 1);

    ctx2D.strokeStyle = '#667eea';
    ctx2D.lineWidth = 3;
    ctx2D.setLineDash([10, 5]);
    ctx2D.beginPath();

    switch (state.revolutionAxis) {
        case 'y':
            // Eixo vertical no centro (eixo Y)
            ctx2D.moveTo(w / 2, 0);
            ctx2D.lineTo(w / 2, h);
            
            // Texto explicativo
            ctx2D.setLineDash([]);
            ctx2D.font = 'bold 14px sans-serif';
            ctx2D.fillStyle = '#667eea';
            ctx2D.fillText('← Eixo Y (Revolução)', w / 2 + 10, 30);
            
            // Área válida (lado direito)
            ctx2D.fillStyle = 'rgba(102, 126, 234, 0.05)';
            ctx2D.fillRect(w / 2, 0, w / 2, h);
            
            ctx2D.setLineDash([10, 5]);
            break;
            
        case 'x':
            // Eixo horizontal no centro (eixo X)
            ctx2D.moveTo(0, h / 2);
            ctx2D.lineTo(w, h / 2);
            
            // Texto explicativo
            ctx2D.setLineDash([]);
            ctx2D.font = 'bold 14px sans-serif';
            ctx2D.fillStyle = '#667eea';
            ctx2D.fillText('Eixo X (Revolução) ↑', 20, h / 2 - 10);
            
            // Área válida (parte superior)
            ctx2D.fillStyle = 'rgba(102, 126, 234, 0.05)';
            ctx2D.fillRect(0, 0, w, h / 2);
            
            ctx2D.setLineDash([10, 5]);
            break;
            
        case 'z':
            // Para eixo Z, mostra aviso
            ctx2D.setLineDash([]);
            ctx2D.font = 'bold 14px sans-serif';
            ctx2D.fillStyle = '#667eea';
            ctx2D.fillText('Eixo Z (perpendicular ao plano)', w / 2 - 100, h / 2);
            ctx2D.setLineDash([10, 5]);
            break;
    }

    ctx2D.stroke();
    ctx2D.setLineDash([]);
}

/**
 * Desenha curva gerada
 */
function drawCurve(points) {
    if (points.length < 2) return;

    ctx2D.strokeStyle = '#667eea';
    ctx2D.lineWidth = 3;
    ctx2D.beginPath();
    ctx2D.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx2D.lineTo(points[i].x, points[i].y);
    }

    ctx2D.stroke();
}

/**
 * Desenha polígono de controle
 */
function drawControlPolygon(points) {
    if (points.length < 2) return;

    ctx2D.strokeStyle = '#cbd5e0';
    ctx2D.lineWidth = 1;
    ctx2D.setLineDash([3, 3]);
    ctx2D.beginPath();
    ctx2D.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx2D.lineTo(points[i].x, points[i].y);
    }

    ctx2D.stroke();
    ctx2D.setLineDash([]);
}

/**
 * Desenha pontos de controle
 */
function drawControlPoints(points) {
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        
        // Círculo externo
        ctx2D.fillStyle = '#667eea';
        ctx2D.beginPath();
        ctx2D.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx2D.fill();

        // Círculo interno
        ctx2D.fillStyle = '#ffffff';
        ctx2D.beginPath();
        ctx2D.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx2D.fill();

        // Índice do ponto
        ctx2D.fillStyle = '#1a202c';
        ctx2D.font = '10px sans-serif';
        ctx2D.fillText(i + 1, p.x + 10, p.y - 10);
    }
}

/**
 * Atualiza informações na UI
 */
function updateInfo() {
    // Informações do perfil 2D
    const pointCount = state.profilePoints.length();
    document.getElementById('profilePoints').textContent = `Pontos: ${pointCount}`;

    // Informações da superfície 3D
    const stats = state.currentSurface.getStats();
    document.getElementById('surfaceInfo').textContent = 
        `Vértices: ${stats.vertices} | Faces: ${stats.faces}`;
}

// Inicializa quando página carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
