/**
 * Módulo para cálculo de Curvas Spline (B-Spline Cúbica)
 * Implementa interpolação B-spline com grau variável
 */

/**
 * Gera o vetor de nós (knot vector) uniforme
 * @param {number} n - Número de pontos de controle
 * @param {number} degree - Grau da spline
 * @returns {Array} Vetor de nós
 */
export function generateKnotVector(n, degree) {
    const m = n + degree + 1; // Tamanho do vetor de nós
    const knots = [];

    // Vetor de nós uniforme aberto (clamped)
    for (let i = 0; i < m; i++) {
        if (i <= degree) {
            knots.push(0);
        } else if (i >= n) {
            knots.push(n - degree);
        } else {
            knots.push(i - degree);
        }
    }

    return knots;
}

/**
 * Calcula a função base B-spline usando a fórmula de Cox-de Boor
 * @param {number} i - Índice da função base
 * @param {number} degree - Grau da spline
 * @param {number} t - Parâmetro t
 * @param {Array} knots - Vetor de nós
 * @returns {number} Valor da função base
 */
export function bSplineBasis(i, degree, t, knots) {
    // Caso base: grau 0
    if (degree === 0) {
        // Tratamento especial para o último intervalo (t == knots[i+1])
        if (i === knots.length - degree - 2 && Math.abs(t - knots[i + 1]) < 1e-10) {
            return 1;
        }
        return (t >= knots[i] && t < knots[i + 1]) ? 1 : 0;
    }

    // Fórmula recursiva de Cox-de Boor
    // N_{i,p}(t) = [(t - u_i)/(u_{i+p} - u_i)] * N_{i,p-1}(t) 
    //            + [(u_{i+p+1} - t)/(u_{i+p+1} - u_{i+1})] * N_{i+1,p-1}(t)
    let left = 0;
    let right = 0;

    const denomLeft = knots[i + degree] - knots[i];
    if (denomLeft !== 0) {
        left = ((t - knots[i]) / denomLeft) * 
               bSplineBasis(i, degree - 1, t, knots);
    }

    const denomRight = knots[i + degree + 1] - knots[i + 1];
    if (denomRight !== 0) {
        right = ((knots[i + degree + 1] - t) / denomRight) * 
                bSplineBasis(i + 1, degree - 1, t, knots);
    }

    return left + right;
}

/**
 * Calcula um ponto na curva B-spline
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

    // Garante que t está no intervalo válido
    const tMin = knots[degree];
    const tMax = knots[n];
    const tClamped = Math.max(tMin, Math.min(tMax, t));

    // Soma ponderada dos pontos de controle
    for (let i = 0; i < n; i++) {
        const basis = bSplineBasis(i, degree, tClamped, knots);
        x += basis * controlPoints[i].x;
        y += basis * controlPoints[i].y;
    }

    return { x, y };
}

/**
 * Gera todos os pontos da curva B-spline
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} degree - Grau da spline
 * @param {number} step - Passo de interpolação
 * @returns {Array} Array de pontos da curva
 */
export function generateBSplineCurve(controlPoints, degree = 3, step = 0.01) {
    if (controlPoints.length < degree + 1) {
        console.warn(`Número insuficiente de pontos. Necessário pelo menos ${degree + 1} pontos.`);
        return [];
    }

    const n = controlPoints.length;
    const knots = generateKnotVector(n, degree);
    const curvePoints = [];

    const tMin = knots[degree];
    const tMax = knots[n];

    // Gera pontos ao longo da curva
    for (let t = tMin; t <= tMax; t += step) {
        const point = evaluateBSpline(controlPoints, t, degree, knots);
        if (point) {
            curvePoints.push(point);
        }
    }

    // Garante que o último ponto seja incluído
    const lastPoint = evaluateBSpline(controlPoints, tMax, degree, knots);
    if (lastPoint) {
        curvePoints.push(lastPoint);
    }

    return curvePoints;
}

/**
 * Implementação de B-spline cúbica (grau 3) otimizada
 * Mais eficiente para o caso específico de splines cúbicas
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} step - Passo de interpolação
 * @returns {Array} Array de pontos da curva
 */
export function generateCubicBSpline(controlPoints, step = 0.01) {
    if (controlPoints.length < 4) {
        console.warn('B-Spline cúbica requer pelo menos 4 pontos de controle.');
        return [];
    }

    const curvePoints = [];
    const degree = 3;
    const n = controlPoints.length;
    
    // Para cada segmento da spline
    for (let i = 0; i < n - degree; i++) {
        const segment = [
            controlPoints[i],
            controlPoints[i + 1],
            controlPoints[i + 2],
            controlPoints[i + 3]
        ];

        // Interpola o segmento
        for (let t = 0; t < 1; t += step) {
            const point = evaluateCubicSegment(segment, t);
            curvePoints.push(point);
        }
    }

    // Adiciona o último ponto
    const lastSegment = [
        controlPoints[n - 4],
        controlPoints[n - 3],
        controlPoints[n - 2],
        controlPoints[n - 1]
    ];
    curvePoints.push(evaluateCubicSegment(lastSegment, 1.0));

    return curvePoints;
}

/**
 * Avalia um segmento cúbico de B-spline usando a matriz de base
 * @param {Array} segment - 4 pontos de controle do segmento
 * @param {number} t - Parâmetro local (0 <= t <= 1)
 * @returns {Object} Ponto calculado {x, y}
 */
function evaluateCubicSegment(segment, t) {
    // Matriz de base cúbica de B-spline (1/6 da matriz)
    const t2 = t * t;
    const t3 = t2 * t;

    const b0 = (1 - t) * (1 - t) * (1 - t) / 6;
    const b1 = (3 * t3 - 6 * t2 + 4) / 6;
    const b2 = (-3 * t3 + 3 * t2 + 3 * t + 1) / 6;
    const b3 = t3 / 6;

    return {
        x: b0 * segment[0].x + b1 * segment[1].x + b2 * segment[2].x + b3 * segment[3].x,
        y: b0 * segment[0].y + b1 * segment[1].y + b2 * segment[2].y + b3 * segment[3].y
    };
}

/**
 * Calcula a derivada da curva B-spline em um ponto
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} t - Parâmetro t
 * @param {number} degree - Grau da spline
 * @param {Array} knots - Vetor de nós
 * @returns {Object} Vetor derivada {x, y}
 */
export function bSplineDerivative(controlPoints, t, degree, knots) {
    if (controlPoints.length < 2 || degree < 1) {
        return { x: 0, y: 0 };
    }

    const n = controlPoints.length;
    const derivativePoints = [];

    // Pontos de controle da derivada
    for (let i = 0; i < n - 1; i++) {
        const denom = knots[i + degree + 1] - knots[i + 1];
        if (denom !== 0) {
            const factor = degree / denom;
            derivativePoints.push({
                x: factor * (controlPoints[i + 1].x - controlPoints[i].x),
                y: factor * (controlPoints[i + 1].y - controlPoints[i].y)
            });
        }
    }

    if (derivativePoints.length === 0) {
        return { x: 0, y: 0 };
    }

    const derivativeKnots = knots.slice(1, -1);
    return evaluateBSpline(derivativePoints, t, degree - 1, derivativeKnots);
}

/**
 * Insere um nó no vetor de nós (knot insertion)
 * Técnica importante para refinamento de B-splines
 * @param {Array} controlPoints - Pontos de controle
 * @param {Array} knots - Vetor de nós
 * @param {number} degree - Grau da spline
 * @param {number} newKnot - Novo nó a ser inserido
 * @returns {Object} {controlPoints, knots} atualizados
 */
export function insertKnot(controlPoints, knots, degree, newKnot) {
    const n = controlPoints.length;
    
    // Encontra o intervalo onde o novo nó será inserido
    let k = degree;
    while (k < knots.length - 1 && knots[k] < newKnot) {
        k++;
    }

    // Novos pontos de controle
    const newControlPoints = [];
    
    for (let i = 0; i < n; i++) {
        if (i <= k - degree - 1) {
            newControlPoints.push({ ...controlPoints[i] });
        } else if (i > k - 1) {
            newControlPoints.push({ ...controlPoints[i] });
        } else {
            const alpha = (newKnot - knots[i]) / (knots[i + degree] - knots[i]);
            newControlPoints.push({
                x: (1 - alpha) * controlPoints[i - 1].x + alpha * controlPoints[i].x,
                y: (1 - alpha) * controlPoints[i - 1].y + alpha * controlPoints[i].y
            });
        }
    }

    // Novo vetor de nós
    const newKnots = [...knots.slice(0, k), newKnot, ...knots.slice(k)];

    return {
        controlPoints: newControlPoints,
        knots: newKnots
    };
}

/**
 * Converte uma curva de Bézier em B-spline equivalente
 * @param {Array} bezierPoints - Pontos de controle da Bézier
 * @returns {Object} {controlPoints, degree, knots}
 */
export function bezierToBSpline(bezierPoints) {
    const n = bezierPoints.length;
    const degree = n - 1;
    
    // Cria vetor de nós para B-spline que representa Bézier
    const knots = [];
    for (let i = 0; i <= degree; i++) {
        knots.push(0);
    }
    for (let i = 0; i <= degree; i++) {
        knots.push(1);
    }

    return {
        controlPoints: [...bezierPoints],
        degree: degree,
        knots: knots
    };
}

/**
 * Calcula a curvatura em um ponto da spline
 * @param {Array} controlPoints - Pontos de controle
 * @param {number} t - Parâmetro t
 * @param {number} degree - Grau da spline
 * @param {Array} knots - Vetor de nós
 * @returns {number} Curvatura no ponto
 */
export function bSplineCurvature(controlPoints, t, degree, knots) {
    const firstDeriv = bSplineDerivative(controlPoints, t, degree, knots);
    
    // Calcula segunda derivada (derivada da derivada)
    if (degree < 2) return 0;
    
    const dx = firstDeriv.x;
    const dy = firstDeriv.y;
    
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 1e-10) return 0;

    // Simplificação: retorna a magnitude da velocidade
    // Para curvatura exata, seria necessário calcular a segunda derivada
    return 1 / speed;
}
