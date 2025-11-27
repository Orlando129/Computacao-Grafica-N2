/**
 * Módulo para cálculo de Curvas de Bézier
 * Implementa o algoritmo de De Casteljau para Bézier de grau variável
 */

/**
 * Algoritmo de De Casteljau para calcular um ponto na curva de Bézier Racional (NURBS)
 * Implementação CORRETA usando coordenadas homogêneas
 * @param {Array} points - Array de pontos de controle {x, y, weight}
 * @param {number} t - Parâmetro t (0 <= t <= 1)
 * @returns {Object} Ponto calculado {x, y}
 */
export function deCasteljau(points, t) {
    if (points.length === 0) return null;
    if (points.length === 1) return { x: points[0].x, y: points[0].y };

    // Converte para coordenadas homogêneas: (w*x, w*y, w)
    let currentPoints = points.map(p => {
        const w = p.weight || 1;
        return {
            wx: p.x * w,  // Coordenada homogênea x
            wy: p.y * w,  // Coordenada homogênea y
            w: w          // Peso
        };
    });

    // Aplica o algoritmo de De Casteljau nas coordenadas homogêneas
    while (currentPoints.length > 1) {
        const newPoints = [];
        for (let i = 0; i < currentPoints.length - 1; i++) {
            const p0 = currentPoints[i];
            const p1 = currentPoints[i + 1];
            
            // Interpolação linear em coordenadas homogêneas
            newPoints.push({
                wx: (1 - t) * p0.wx + t * p1.wx,
                wy: (1 - t) * p0.wy + t * p1.wy,
                w: (1 - t) * p0.w + t * p1.w
            });
        }
        currentPoints = newPoints;
    }

    // Converte de volta para coordenadas cartesianas: (wx/w, wy/w)
    const final = currentPoints[0];
    return { 
        x: final.wx / final.w, 
        y: final.wy / final.w 
    };
}

/**
 * Algoritmo de De Casteljau não-racional (sem pesos)
 * Versão mais simples e rápida quando todos os pesos são 1
 * @param {Array} points - Array de pontos de controle {x, y}
 * @param {number} t - Parâmetro t (0 <= t <= 1)
 * @returns {Object} Ponto calculado {x, y}
 */
export function deCasteljauSimple(points, t) {
    if (points.length === 0) return null;
    if (points.length === 1) return { x: points[0].x, y: points[0].y };

    let currentPoints = [...points];

    while (currentPoints.length > 1) {
        const newPoints = [];
        for (let i = 0; i < currentPoints.length - 1; i++) {
            const p0 = currentPoints[i];
            const p1 = currentPoints[i + 1];
            
            // Interpolação linear simples
            newPoints.push({
                x: (1 - t) * p0.x + t * p1.x,
                y: (1 - t) * p0.y + t * p1.y
            });
        }
        currentPoints = newPoints;
    }

    return { x: currentPoints[0].x, y: currentPoints[0].y };
}

/**
 * Gera todos os pontos da curva de Bézier
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} steps - Número de passos (resolução)
 * @param {boolean} useWeights - Se deve usar pesos (NURBS simplificado)
 * @returns {Array} Array de pontos da curva
 */
export function generateBezierCurve(controlPoints, steps = 100, useWeights = false) {
    if (controlPoints.length < 2) return [];

    const curvePoints = [];
    const hasWeights = controlPoints.some(p => p.weight !== undefined && p.weight !== 1);
    
    // Usa versão com ou sem pesos dependendo dos pontos
    const algorithm = (hasWeights && useWeights) ? deCasteljau : deCasteljauSimple;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = algorithm(controlPoints, t);
        if (point) {
            curvePoints.push(point);
        }
    }

    return curvePoints;
}

/**
 * Calcula o grau da curva de Bézier (n-1, onde n é o número de pontos)
 * @param {Array} controlPoints - Pontos de controle
 * @returns {number} Grau da curva
 */
export function getBezierDegree(controlPoints) {
    return Math.max(0, controlPoints.length - 1);
}

/**
 * Calcula a derivada da curva de Bézier em um ponto t
 * Útil para calcular tangentes
 * @param {Array} points - Pontos de controle
 * @param {number} t - Parâmetro t
 * @returns {Object} Vetor derivada {x, y}
 */
export function bezierDerivative(points, t) {
    if (points.length < 2) return { x: 0, y: 0 };

    const n = points.length - 1;
    const derivativePoints = [];

    // Pontos de controle da derivada
    for (let i = 0; i < n; i++) {
        derivativePoints.push({
            x: n * (points[i + 1].x - points[i].x),
            y: n * (points[i + 1].y - points[i].y)
        });
    }

    return deCasteljauSimple(derivativePoints, t);
}

/**
 * Divide uma curva de Bézier em duas no parâmetro t
 * @param {Array} points - Pontos de controle
 * @param {number} t - Parâmetro de divisão
 * @returns {Object} {left: Array, right: Array} - Duas novas curvas
 */
export function splitBezier(points, t) {
    if (points.length === 0) return { left: [], right: [] };

    const left = [points[0]];
    const right = [];
    let currentPoints = [...points];

    while (currentPoints.length > 1) {
        const newPoints = [];
        for (let i = 0; i < currentPoints.length - 1; i++) {
            const p0 = currentPoints[i];
            const p1 = currentPoints[i + 1];
            
            newPoints.push({
                x: (1 - t) * p0.x + t * p1.x,
                y: (1 - t) * p0.y + t * p1.y,
                weight: p0.weight
            });
        }
        
        left.push(newPoints[0]);
        right.unshift(newPoints[newPoints.length - 1]);
        currentPoints = newPoints;
    }
    
    right.unshift(currentPoints[0]);

    return { left, right };
}

/**
 * Eleva o grau da curva de Bézier
 * Adiciona um ponto de controle mantendo a mesma forma da curva
 * @param {Array} points - Pontos de controle
 * @returns {Array} Novos pontos de controle com grau elevado
 */
export function elevateBezierDegree(points) {
    if (points.length < 2) return points;

    const n = points.length - 1;
    const newPoints = [];

    // Primeiro ponto permanece o mesmo
    newPoints.push({ ...points[0] });

    // Calcula os novos pontos intermediários
    for (let i = 1; i <= n; i++) {
        const alpha = i / (n + 1);
        newPoints.push({
            x: alpha * points[i - 1].x + (1 - alpha) * points[i].x,
            y: alpha * points[i - 1].y + (1 - alpha) * points[i].y,
            weight: points[i].weight
        });
    }

    // Último ponto permanece o mesmo
    newPoints.push({ ...points[n] });

    return newPoints;
}

/**
 * Calcula os coeficientes binomiais (combinações)
 * Usado em algumas implementações alternativas de Bézier
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
export function binomialCoefficient(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let coeff = 1;
    for (let i = 1; i <= k; i++) {
        coeff *= (n - k + i) / i;
    }
    return coeff;
}

/**
 * Calcula o polinômio de Bernstein
 * Base para a formulação matemática de Bézier
 * @param {number} n - Grau
 * @param {number} i - Índice
 * @param {number} t - Parâmetro
 * @returns {number}
 */
export function bernsteinPolynomial(n, i, t) {
    return binomialCoefficient(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

/**
 * Implementação alternativa de Bézier usando polinômios de Bernstein
 * Menos eficiente que De Casteljau, mas útil para fins educacionais
 * @param {Array} points - Pontos de controle
 * @param {number} t - Parâmetro t
 * @returns {Object} Ponto calculado {x, y}
 */
export function bezierBernstein(points, t) {
    if (points.length === 0) return null;
    
    const n = points.length - 1;
    let x = 0;
    let y = 0;

    for (let i = 0; i <= n; i++) {
        const b = bernsteinPolynomial(n, i, t);
        x += b * points[i].x;
        y += b * points[i].y;
    }

    return { x, y };
}
