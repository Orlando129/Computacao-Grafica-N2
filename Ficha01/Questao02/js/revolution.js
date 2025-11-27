/**
 * Módulo de Superfície de Revolução
 * Gera malha 3D a partir de perfil 2D rotacionado em torno de um eixo
 */

/**
 * Classe para representar a geometria da superfície de revolução
 */
export class RevolutionSurface {
    constructor() {
        this.vertices = [];      // Array de vetores 3D
        this.faces = [];         // Array de índices (triângulos)
        this.normals = [];       // Normais por vértice
        this.parameters = {};    // Parâmetros usados na geração
    }

    /**
     * Gera superfície de revolução a partir de um perfil 2D
     * @param {Array} profilePoints - Pontos do perfil 2D [{x, y}, ...]
     * @param {string} axis - Eixo de revolução ('x', 'y', 'z')
     * @param {number} angle - Ângulo total de revolução (graus)
     * @param {number} subdivisions - Número de subdivisões angulares
     */
    generate(profilePoints, axis = 'y', angle = 360, subdivisions = 32) {
        if (profilePoints.length < 2) {
            console.warn('Perfil precisa de pelo menos 2 pontos');
            return;
        }

        this.clear();
        this.parameters = { axis, angle, subdivisions, profilePointsCount: profilePoints.length };

        const angleRad = (angle * Math.PI) / 180;
        const angleStep = angleRad / subdivisions;

        // Gera vértices rotacionando o perfil
        for (let i = 0; i <= subdivisions; i++) {
            const theta = i * angleStep;
            
            for (let j = 0; j < profilePoints.length; j++) {
                const point = profilePoints[j];
                const vertex = this.rotatePoint(point, theta, axis);
                this.vertices.push(vertex);
            }
        }

        // Gera faces (triângulos)
        const pointsPerRing = profilePoints.length;
        
        for (let i = 0; i < subdivisions; i++) {
            for (let j = 0; j < pointsPerRing - 1; j++) {
                const current = i * pointsPerRing + j;
                const next = current + pointsPerRing;

                // Triângulo 1
                this.faces.push([current, next, current + 1]);
                
                // Triângulo 2
                this.faces.push([current + 1, next, next + 1]);
            }
        }

        // Calcula normais
        this.calculateNormals();
    }

    /**
     * Rotaciona um ponto 2D em torno de um eixo
     * @param {Object} point - Ponto 2D {x, y}
     * @param {number} theta - Ângulo de rotação (radianos)
     * @param {string} axis - Eixo de revolução
     * @returns {Object} Ponto 3D {x, y, z}
     */
    rotatePoint(point, theta, axis) {
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        switch (axis.toLowerCase()) {
            case 'y': // Revolução em torno do eixo Y (padrão)
                return {
                    x: point.x * cos,
                    y: point.y,
                    z: point.x * sin
                };

            case 'x': // Revolução em torno do eixo X
                return {
                    x: point.x,
                    y: point.y * cos,
                    z: point.y * sin
                };

            case 'z': // Revolução em torno do eixo Z
                return {
                    x: point.x * cos - point.y * sin,
                    y: point.x * sin + point.y * cos,
                    z: 0
                };

            default:
                return { x: point.x, y: point.y, z: 0 };
        }
    }

    /**
     * Calcula normais para cada vértice (média das normais das faces adjacentes)
     */
    calculateNormals() {
        // Inicializa normais como zero
        this.normals = this.vertices.map(() => ({ x: 0, y: 0, z: 0 }));

        // Para cada face, calcula a normal e acumula nos vértices
        for (const face of this.faces) {
            const [i0, i1, i2] = face;
            const v0 = this.vertices[i0];
            const v1 = this.vertices[i1];
            const v2 = this.vertices[i2];

            // Vetores das arestas
            const edge1 = {
                x: v1.x - v0.x,
                y: v1.y - v0.y,
                z: v1.z - v0.z
            };

            const edge2 = {
                x: v2.x - v0.x,
                y: v2.y - v0.y,
                z: v2.z - v0.z
            };

            // Produto vetorial (normal da face)
            const normal = {
                x: edge1.y * edge2.z - edge1.z * edge2.y,
                y: edge1.z * edge2.x - edge1.x * edge2.z,
                z: edge1.x * edge2.y - edge1.y * edge2.x
            };

            // Acumula a normal nos três vértices da face
            for (const idx of face) {
                this.normals[idx].x += normal.x;
                this.normals[idx].y += normal.y;
                this.normals[idx].z += normal.z;
            }
        }

        // Normaliza todos os vetores normais
        for (let i = 0; i < this.normals.length; i++) {
            const n = this.normals[i];
            const length = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
            
            if (length > 0) {
                n.x /= length;
                n.y /= length;
                n.z /= length;
            }
        }
    }

    /**
     * Calcula normal de uma face individual
     * @param {Array} face - Índices dos vértices [i0, i1, i2]
     * @returns {Object} Normal unitária {x, y, z}
     */
    calculateFaceNormal(face) {
        const [i0, i1, i2] = face;
        const v0 = this.vertices[i0];
        const v1 = this.vertices[i1];
        const v2 = this.vertices[i2];

        const edge1 = {
            x: v1.x - v0.x,
            y: v1.y - v0.y,
            z: v1.z - v0.z
        };

        const edge2 = {
            x: v2.x - v0.x,
            y: v2.y - v0.y,
            z: v2.z - v0.z
        };

        const normal = {
            x: edge1.y * edge2.z - edge1.z * edge2.y,
            y: edge1.z * edge2.x - edge1.x * edge2.z,
            z: edge1.x * edge2.y - edge1.y * edge2.x
        };

        const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        
        if (length > 0) {
            normal.x /= length;
            normal.y /= length;
            normal.z /= length;
        }

        return normal;
    }

    /**
     * Limpa todos os dados da superfície
     */
    clear() {
        this.vertices = [];
        this.faces = [];
        this.normals = [];
        this.parameters = {};
    }

    /**
     * Retorna estatísticas da malha
     * @returns {Object} Estatísticas {vertices, faces, triangles}
     */
    getStats() {
        return {
            vertices: this.vertices.length,
            faces: this.faces.length,
            triangles: this.faces.length
        };
    }

    /**
     * Retorna os dados da geometria
     * @returns {Object} {vertices, faces, normals, parameters}
     */
    getData() {
        return {
            vertices: this.vertices,
            faces: this.faces,
            normals: this.normals,
            parameters: this.parameters
        };
    }
}

/**
 * Função auxiliar para criar superfície de revolução rapidamente
 * @param {Array} profilePoints - Pontos do perfil 2D
 * @param {Object} options - Opções {axis, angle, subdivisions}
 * @returns {RevolutionSurface} Superfície gerada
 */
export function createRevolutionSurface(profilePoints, options = {}) {
    const {
        axis = 'y',
        angle = 360,
        subdivisions = 32
    } = options;

    const surface = new RevolutionSurface();
    surface.generate(profilePoints, axis, angle, subdivisions);
    return surface;
}
