/**
 * Módulo de Curvas 2D para Perfil de Revolução
 * Implementa De Casteljau (Bézier) e Cox-de Boor (B-Spline)
 */

/**
 * Classe para gerenciar pontos de controle do perfil 2D
 */
export class ProfilePoints {
    constructor() {
        this.points = [];
        this.selectedPoint = null;
    }

    addPoint(x, y) {
        this.points.push({ x, y, id: Date.now() });
    }

    removePoint(index) {
        if (index >= 0 && index < this.points.length) {
            this.points.splice(index, 1);
        }
    }

    movePoint(index, x, y) {
        if (index >= 0 && index < this.points.length) {
            this.points[index].x = x;
            this.points[index].y = y;
        }
    }

    findPointAt(x, y, threshold = 10) {
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
            if (dist <= threshold) {
                return i;
            }
        }
        return -1;
    }

    clear() {
        this.points = [];
        this.selectedPoint = null;
    }

    getPoints() {
        return this.points;
    }

    length() {
        return this.points.length;
    }
}

/**
 * Algoritmo de De Casteljau para curvas de Bézier
 * @param {Array} controlPoints - Pontos de controle [{x, y}, ...]
 * @param {number} t - Parâmetro t ∈ [0, 1]
 * @returns {Object} Ponto calculado {x, y}
 */
export function deCasteljau(controlPoints, t) {
    if (controlPoints.length === 0) return null;
    if (controlPoints.length === 1) return { ...controlPoints[0] };

    let points = controlPoints.map(p => ({ x: p.x, y: p.y }));

    while (points.length > 1) {
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            newPoints.push({
                x: (1 - t) * points[i].x + t * points[i + 1].x,
                y: (1 - t) * points[i].y + t * points[i + 1].y
            });
        }
        points = newPoints;
    }

    return points[0];
}

/**
 * Gera curva de Bézier completa
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} resolution - Número de pontos a gerar
 * @returns {Array} Array de pontos da curva
 */
export function generateBezierCurve(controlPoints, resolution = 50) {
    if (controlPoints.length < 2) return [];

    const curvePoints = [];
    const step = 1 / resolution;

    for (let t = 0; t <= 1; t += step) {
        const point = deCasteljau(controlPoints, t);
        if (point) curvePoints.push(point);
    }

    // Garante o ponto final
    const finalPoint = deCasteljau(controlPoints, 1);
    if (finalPoint) curvePoints.push(finalPoint);

    return curvePoints;
}

/**
 * Gera vetor de nós para B-Spline (clamped uniform)
 * @param {number} n - Número de pontos de controle
 * @param {number} degree - Grau da spline
 * @returns {Array} Vetor de nós
 */
export function generateKnotVector(n, degree) {
    const m = n + degree + 1;
    const knots = [];

    // Multiplicidade degree+1 no início
    for (let i = 0; i <= degree; i++) {
        knots.push(0);
    }

    // Nós internos uniformes
    const numInternal = n - degree;
    for (let i = 1; i < numInternal; i++) {
        knots.push(i);
    }

    // Multiplicidade degree+1 no final
    const lastValue = numInternal;
    for (let i = 0; i <= degree; i++) {
        knots.push(lastValue);
    }

    return knots;
}

/**
 * Função base de Cox-de Boor recursiva
 * @param {number} i - Índice da função base
 * @param {number} degree - Grau da spline
 * @param {number} t - Parâmetro t
 * @param {Array} knots - Vetor de nós
 * @returns {number} Valor da função base
 */
export function bSplineBasis(i, degree, t, knots) {
    // Caso base: grau 0
    if (degree === 0) {
        // Tratamento para último intervalo
        if (i === knots.length - degree - 2 && Math.abs(t - knots[i + 1]) < 1e-10) {
            return 1;
        }
        return (t >= knots[i] && t < knots[i + 1]) ? 1 : 0;
    }

    // Fórmula recursiva de Cox-de Boor
    let left = 0;
    let right = 0;

    const denomLeft = knots[i + degree] - knots[i];
    if (denomLeft !== 0) {
        left = ((t - knots[i]) / denomLeft) * bSplineBasis(i, degree - 1, t, knots);
    }

    const denomRight = knots[i + degree + 1] - knots[i + 1];
    if (denomRight !== 0) {
        right = ((knots[i + degree + 1] - t) / denomRight) * bSplineBasis(i + 1, degree - 1, t, knots);
    }

    return left + right;
}

/**
 * Avalia B-Spline em um parâmetro t
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} t - Parâmetro t
 * @param {number} degree - Grau da spline
 * @param {Array} knots - Vetor de nós
 * @returns {Object} Ponto calculado {x, y}
 */
export function evaluateBSpline(controlPoints, t, degree, knots) {
    if (controlPoints.length === 0) return null;

    const n = controlPoints.length;
    let x = 0;
    let y = 0;

    const tMin = knots[degree];
    const tMax = knots[n];
    const tClamped = Math.max(tMin, Math.min(tMax, t));

    for (let i = 0; i < n; i++) {
        const basis = bSplineBasis(i, degree, tClamped, knots);
        x += basis * controlPoints[i].x;
        y += basis * controlPoints[i].y;
    }

    return { x, y };
}

/**
 * Gera curva B-Spline completa
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} degree - Grau da spline
 * @param {number} resolution - Número de pontos a gerar
 * @returns {Array} Array de pontos da curva
 */
export function generateBSplineCurve(controlPoints, degree = 3, resolution = 50) {
    if (controlPoints.length < degree + 1) {
        console.warn(`Necessário pelo menos ${degree + 1} pontos para grau ${degree}`);
        return [];
    }

    const n = controlPoints.length;
    const knots = generateKnotVector(n, degree);
    const curvePoints = [];

    const tMin = knots[degree];
    const tMax = knots[n];
    const step = (tMax - tMin) / resolution;

    for (let t = tMin; t <= tMax; t += step) {
        const point = evaluateBSpline(controlPoints, t, degree, knots);
        if (point) curvePoints.push(point);
    }

    // Garante o ponto final
    const finalPoint = evaluateBSpline(controlPoints, tMax, degree, knots);
    if (finalPoint) curvePoints.push(finalPoint);

    return curvePoints;
}

/**
 * Gera perfil de curva baseado no tipo
 * @param {Array} controlPoints - Pontos de controle
 * @param {string} type - 'bezier' ou 'spline'
 * @param {number} degree - Grau da curva
 * @param {number} resolution - Resolução
 * @returns {Array} Pontos do perfil
 */
export function generateProfile(controlPoints, type = 'bezier', degree = 3, resolution = 50) {
    if (type === 'bezier') {
        return generateBezierCurve(controlPoints, resolution);
    } else if (type === 'spline') {
        return generateBSplineCurve(controlPoints, degree, resolution);
    }
    return [];
}
