/**
 * Módulo principal da aplicação
 * Coordena a interação entre todos os outros módulos
 */

import * as Bezier from './bezier.js';
import * as Spline from './spline.js';
import { ControlPointsManager } from './controlPoints.js';
import { Renderer } from './renderer.js';

// Estado da aplicação
const state = {
    currentMode: 'bezier', // 'bezier' ou 'spline'
    bezierManager: new ControlPointsManager(),
    splineManager: new ControlPointsManager(),
    renderer: null,
    canvas: null,
    
    // Configurações de Bézier
    bezierConfig: {
        degree: 3,
        steps: 100,
        showControlPolygon: true,
        showPoints: true,
        showWeights: false
    },
    
    // Configurações de Spline
    splineConfig: {
        degree: 3,
        step: 0.01,
        showControlPolygon: true,
        showPoints: true
    },
    
    // Mouse
    mouseCoords: { x: 0, y: 0 }
};

/**
 * Inicializa a aplicação
 */
function init() {
    // Obtém elementos do DOM
    state.canvas = document.getElementById('canvas');
    state.renderer = new Renderer(state.canvas);
    
    // Configura event listeners
    setupCanvasEvents();
    setupTabEvents();
    setupBezierControls();
    setupSplineControls();
    
    // Renderiza inicial
    render();
    
    console.log('Aplicação inicializada com sucesso!');
}

/**
 * Configura eventos do canvas
 */
function setupCanvasEvents() {
    const canvas = state.canvas;
    
    // Mouse move - atualiza coordenadas e hover
    canvas.addEventListener('mousemove', (e) => {
        const coords = state.renderer.getCanvasCoordinates(e.clientX, e.clientY);
        state.mouseCoords = coords;
        
        // Atualiza exibição das coordenadas
        document.getElementById('mouse-coords').textContent = 
            `Mouse: (${Math.round(coords.x)}, ${Math.round(coords.y)})`;
        
        const manager = getCurrentManager();
        
        // Verifica hover
        if (!manager.isCurrentlyDragging()) {
            const hoverIndex = manager.findPointNear(coords.x, coords.y, 15);
            manager.setHoverPoint(hoverIndex);
            canvas.style.cursor = hoverIndex >= 0 ? 'pointer' : 'crosshair';
        }
        
        // Arrasta ponto
        if (manager.isCurrentlyDragging()) {
            const selectedIndex = manager.getSelectedIndex();
            manager.movePoint(selectedIndex, coords.x, coords.y);
            updatePointsList();
        }
        
        render();
    });
    
    // Mouse down - inicia arrasto ou seleciona ponto
    canvas.addEventListener('mousedown', (e) => {
        const coords = state.renderer.getCanvasCoordinates(e.clientX, e.clientY);
        const manager = getCurrentManager();
        
        const pointIndex = manager.findPointNear(coords.x, coords.y, 15);
        
        if (pointIndex >= 0) {
            manager.startDragging(pointIndex);
        } else {
            // Adiciona novo ponto
            manager.addPoint(coords.x, coords.y, 1.0);
            updatePointsList();
            updatePointCount();
        }
        
        render();
    });
    
    // Mouse up - finaliza arrasto
    canvas.addEventListener('mouseup', () => {
        getCurrentManager().stopDragging();
        render();
    });
    
    // Mouse leave - finaliza arrasto e remove hover
    canvas.addEventListener('mouseleave', () => {
        const manager = getCurrentManager();
        manager.stopDragging();
        manager.setHoverPoint(-1);
        canvas.style.cursor = 'crosshair';
        render();
    });
    
    // Previne menu de contexto
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

/**
 * Configura eventos das abas
 */
function setupTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });
}

/**
 * Alterna entre abas
 */
function switchTab(tab) {
    state.currentMode = tab;
    
    // Atualiza botões das abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Atualiza conteúdo das abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tab}-controls`);
    });
    
    updatePointCount();
    render();
}

/**
 * Configura controles de Bézier
 */
function setupBezierControls() {
    // Adicionar ponto
    document.getElementById('add-point-bezier').addEventListener('click', () => {
        const center = state.renderer.getCanvasSize();
        const x = center.width / 2 + (Math.random() - 0.5) * 100;
        const y = center.height / 2 + (Math.random() - 0.5) * 100;
        state.bezierManager.addPoint(x, y, 1.0);
        updatePointsList();
        updatePointCount();
        render();
    });
    
    // Limpar pontos
    document.getElementById('clear-points-bezier').addEventListener('click', () => {
        if (confirm('Deseja realmente limpar todos os pontos?')) {
            state.bezierManager.clearPoints();
            updatePointsList();
            updatePointCount();
            render();
        }
    });
    
    // Remover último
    document.getElementById('remove-last-bezier').addEventListener('click', () => {
        state.bezierManager.removeLastPoint();
        updatePointsList();
        updatePointCount();
        render();
    });
    
    // Grau da curva
    const degreeSlider = document.getElementById('bezier-degree');
    degreeSlider.addEventListener('input', (e) => {
        state.bezierConfig.degree = parseInt(e.target.value);
        document.getElementById('bezier-degree-value').textContent = e.target.value;
        render();
    });
    
    // Resolução
    const stepsSlider = document.getElementById('bezier-steps');
    stepsSlider.addEventListener('input', (e) => {
        state.bezierConfig.steps = parseInt(e.target.value);
        document.getElementById('bezier-steps-value').textContent = e.target.value;
        render();
    });
    
    // Checkboxes de visualização
    document.getElementById('show-control-polygon-bezier').addEventListener('change', (e) => {
        state.bezierConfig.showControlPolygon = e.target.checked;
        render();
    });
    
    document.getElementById('show-points-bezier').addEventListener('change', (e) => {
        state.bezierConfig.showPoints = e.target.checked;
        render();
    });
    
    document.getElementById('show-weights-bezier').addEventListener('change', (e) => {
        state.bezierConfig.showWeights = e.target.checked;
        render();
    });
    
    // Exportar JSON
    document.getElementById('export-bezier').addEventListener('click', () => {
        exportToJSON('bezier');
    });
}

/**
 * Configura controles de Spline
 */
function setupSplineControls() {
    // Adicionar ponto
    document.getElementById('add-point-spline').addEventListener('click', () => {
        const center = state.renderer.getCanvasSize();
        const x = center.width / 2 + (Math.random() - 0.5) * 100;
        const y = center.height / 2 + (Math.random() - 0.5) * 100;
        state.splineManager.addPoint(x, y, 1.0);
        updatePointsList();
        updatePointCount();
        render();
    });
    
    // Limpar pontos
    document.getElementById('clear-points-spline').addEventListener('click', () => {
        if (confirm('Deseja realmente limpar todos os pontos?')) {
            state.splineManager.clearPoints();
            updatePointsList();
            updatePointCount();
            render();
        }
    });
    
    // Remover último
    document.getElementById('remove-last-spline').addEventListener('click', () => {
        state.splineManager.removeLastPoint();
        updatePointsList();
        updatePointCount();
        render();
    });
    
    // Copiar de Bézier
    document.getElementById('copy-from-bezier').addEventListener('click', () => {
        const bezierPoints = state.bezierManager.getAllPoints();
        state.splineManager.setAllPoints(bezierPoints);
        updatePointsList();
        updatePointCount();
        render();
    });
    
    // Grau da spline
    const degreeSlider = document.getElementById('spline-degree');
    degreeSlider.addEventListener('input', (e) => {
        state.splineConfig.degree = parseInt(e.target.value);
        document.getElementById('spline-degree-value').textContent = e.target.value;
        render();
    });
    
    // Passo de interpolação
    const stepSlider = document.getElementById('spline-step');
    stepSlider.addEventListener('input', (e) => {
        state.splineConfig.step = parseFloat(e.target.value);
        document.getElementById('spline-step-value').textContent = e.target.value;
        render();
    });
    
    // Checkboxes de visualização
    document.getElementById('show-control-polygon-spline').addEventListener('change', (e) => {
        state.splineConfig.showControlPolygon = e.target.checked;
        render();
    });
    
    document.getElementById('show-points-spline').addEventListener('change', (e) => {
        state.splineConfig.showPoints = e.target.checked;
        render();
    });
    
    // Exportar JSON
    document.getElementById('export-spline').addEventListener('click', () => {
        exportToJSON('spline');
    });
}

/**
 * Obtém o gerenciador de pontos atual
 */
function getCurrentManager() {
    return state.currentMode === 'bezier' ? state.bezierManager : state.splineManager;
}

/**
 * Obtém a configuração atual
 */
function getCurrentConfig() {
    return state.currentMode === 'bezier' ? state.bezierConfig : state.splineConfig;
}

/**
 * Atualiza a lista de pontos na interface
 */
function updatePointsList() {
    const manager = getCurrentManager();
    const listId = state.currentMode === 'bezier' ? 'bezier-points-list' : 'spline-points-list';
    const listElement = document.getElementById(listId);
    
    const points = manager.getAllPoints();
    
    if (points.length === 0) {
        listElement.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Nenhum ponto adicionado</p>';
        return;
    }
    
    listElement.innerHTML = points.map((point, index) => `
        <div class="point-item ${index === manager.getSelectedIndex() ? 'selected' : ''}" data-index="${index}">
            <div class="point-header">
                <span>Ponto ${index}</span>
                <div class="point-actions">
                    <button class="btn-small btn-select" onclick="window.selectPoint(${index})">Selecionar</button>
                    <button class="btn-small btn-delete" onclick="window.deletePoint(${index})">Excluir</button>
                </div>
            </div>
            <div class="point-coords">
                x: ${Math.round(point.x)}, y: ${Math.round(point.y)}
            </div>
            ${state.currentMode === 'bezier' ? `
            <div class="point-weight">
                <label>Peso:</label>
                <input type="range" min="0.1" max="5" step="0.1" value="${point.weight}" 
                       onchange="window.updatePointWeight(${index}, this.value)">
                <input type="number" min="0.1" max="5" step="0.1" value="${point.weight}" 
                       onchange="window.updatePointWeight(${index}, this.value)">
            </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Atualiza contador de pontos
 */
function updatePointCount() {
    const count = getCurrentManager().getPointCount();
    document.getElementById('point-count').textContent = `Pontos: ${count}`;
}

/**
 * Renderiza a cena
 */
function render() {
    const manager = getCurrentManager();
    const config = getCurrentConfig();
    const points = manager.getAllPoints();
    
    // Limpa canvas
    state.renderer.clear();
    
    if (points.length === 0) {
        state.renderer.drawCenteredMessage('Clique no canvas para adicionar pontos');
        return;
    }
    
    // Desenha a curva
    if (state.currentMode === 'bezier' && points.length >= 2) {
        const curvePoints = Bezier.generateBezierCurve(
            points, 
            config.steps,
            config.showWeights
        );
        state.renderer.drawCurve(curvePoints, '#667eea', 3);
    } else if (state.currentMode === 'spline' && points.length >= config.degree + 1) {
        const curvePoints = Spline.generateBSplineCurve(
            points,
            config.degree,
            config.step
        );
        state.renderer.drawCurve(curvePoints, '#764ba2', 3);
    }
    
    // Desenha polígono de controle
    if (config.showControlPolygon && points.length >= 2) {
        state.renderer.drawControlPolygon(points);
    }
    
    // Desenha pesos (apenas Bézier)
    if (state.currentMode === 'bezier' && config.showWeights) {
        state.renderer.drawAllWeights(points);
    }
    
    // Desenha pontos de controle
    if (config.showPoints) {
        const color = state.currentMode === 'bezier' ? '#667eea' : '#764ba2';
        state.renderer.drawAllControlPoints(
            points,
            manager.getSelectedIndex(),
            manager.getHoverIndex(),
            color
        );
    }
}

/**
 * Exporta dados para JSON
 */
function exportToJSON(mode) {
    const manager = mode === 'bezier' ? state.bezierManager : state.splineManager;
    const config = mode === 'bezier' ? state.bezierConfig : state.splineConfig;
    
    const data = {
        mode: mode,
        config: config,
        points: manager.getAllPoints(),
        timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    
    // Cria blob e faz download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-curve-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Dados exportados:', data);
}

// Funções globais para eventos inline
window.selectPoint = (index) => {
    getCurrentManager().selectPoint(index);
    updatePointsList();
    render();
};

window.deletePoint = (index) => {
    getCurrentManager().removePoint(index);
    updatePointsList();
    updatePointCount();
    render();
};

window.updatePointWeight = (index, weight) => {
    const w = parseFloat(weight);
    state.bezierManager.updateWeight(index, w);
    render();
};

// Redimensionamento da janela
window.addEventListener('resize', () => {
    state.renderer.resize();
    render();
});

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
