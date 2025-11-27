/**
 * Módulo de Renderização 3D usando Three.js
 * Gerencia cena, câmera, luzes e controles para visualização da superfície
 */

export class Renderer3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mesh = null;
        this.wireframe = null;
        this.axisHelper = null;
        this.animationId = null;
        this.viewMode = 'solid'; // 'solid', 'wireframe', 'smooth'

        this.init();
    }

    /**
     * Inicializa a cena Three.js
     */
    init() {
        // Cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a202c);

        // Câmera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.set(5, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Controles de órbita
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;

        // Previne scroll da página ao usar zoom no canvas 3D
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        // Luzes
        this.setupLights();

        // Auxiliares
        this.setupHelpers();

        // Inicia loop de animação
        this.animate();

        // Responsive
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Configura iluminação da cena
     */
    setupLights() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direcional principal
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // Luz de preenchimento
        const fillLight = new THREE.DirectionalLight(0x667eea, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Luz traseira
        const backLight = new THREE.DirectionalLight(0x764ba2, 0.2);
        backLight.position.set(0, -5, -10);
        this.scene.add(backLight);
    }

    /**
     * Configura auxiliares visuais (eixos, grid)
     */
    setupHelpers() {
        // Eixos coordenados
        this.axisHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axisHelper);

        // Grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        gridHelper.position.y = -3;
        this.scene.add(gridHelper);
    }

    /**
     * Atualiza a superfície 3D com novos dados
     * @param {Object} surfaceData - Dados da superfície {vertices, faces, normals}
     */
    updateSurface(surfaceData) {
        // Remove malha anterior
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        if (this.wireframe) {
            this.scene.remove(this.wireframe);
            this.wireframe.geometry.dispose();
            this.wireframe.material.dispose();
        }

        if (!surfaceData || surfaceData.vertices.length === 0) {
            console.log('Nenhum dado de superfície para renderizar');
            return;
        }

        console.log('Atualizando superfície 3D com', surfaceData.vertices.length, 'vértices e', surfaceData.faces.length, 'faces');

        // Cria geometria Three.js
        const geometry = new THREE.BufferGeometry();

        // Converte vértices para Float32Array
        const vertices = [];
        const normals = [];

        for (const face of surfaceData.faces) {
            for (const idx of face) {
                const v = surfaceData.vertices[idx];
                const n = surfaceData.normals[idx];
                
                vertices.push(v.x, v.y, v.z);
                normals.push(n.x, n.y, n.z);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

        // Centraliza e escala geometria
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Calcula escala para caber na cena
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 4 / maxDim : 1; // Escala para caber em ~4 unidades

        console.log('Bounding box:', box);
        console.log('Center:', center);
        console.log('Size:', size);
        console.log('Scale:', scale);

        // Translada para origem e escala
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.scale(scale, scale, scale);

        // Material baseado no modo de visualização
        this.createMeshFromGeometry(geometry);
        
        console.log('Superfície 3D renderizada com sucesso');
    }

    /**
     * Cria mesh a partir da geometria conforme modo de visualização
     * @param {THREE.BufferGeometry} geometry - Geometria
     */
    createMeshFromGeometry(geometry) {
        switch (this.viewMode) {
            case 'wireframe':
                this.createWireframeMesh(geometry);
                break;

            case 'smooth':
                this.createSmoothMesh(geometry);
                break;

            case 'solid':
            default:
                this.createSolidMesh(geometry);
                break;
        }
    }

    /**
     * Cria mesh sólida com sombreamento flat
     * @param {THREE.BufferGeometry} geometry - Geometria
     */
    createSolidMesh(geometry) {
        const material = new THREE.MeshPhongMaterial({
            color: 0x667eea,
            flatShading: true,
            side: THREE.DoubleSide,
            shininess: 30
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Adiciona wireframe sobreposto
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.1
        });

        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        this.wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        this.scene.add(this.wireframe);
    }

    /**
     * Cria mesh suavizada
     * @param {THREE.BufferGeometry} geometry - Geometria
     */
    createSmoothMesh(geometry) {
        geometry.computeVertexNormals(); // Recalcula normais suavizadas

        const material = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            metalness: 0.3,
            roughness: 0.4,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    /**
     * Cria mesh wireframe
     * @param {THREE.BufferGeometry} geometry - Geometria
     */
    createWireframeMesh(geometry) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    /**
     * Altera o modo de visualização
     * @param {string} mode - 'solid', 'wireframe', 'smooth'
     */
    setViewMode(mode) {
        this.viewMode = mode;
        
        // Se já existe geometria, recria mesh com novo modo
        if (this.mesh && this.mesh.geometry) {
            const geometry = this.mesh.geometry.clone();
            
            // Remove meshes antigos
            if (this.mesh) {
                this.scene.remove(this.mesh);
                this.mesh.material.dispose();
            }
            if (this.wireframe) {
                this.scene.remove(this.wireframe);
                this.wireframe.geometry.dispose();
                this.wireframe.material.dispose();
                this.wireframe = null;
            }

            this.createMeshFromGeometry(geometry);
        }
    }

    /**
     * Loop de animação
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Atualiza controles
        this.controls.update();

        // Renderiza cena
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Reseta a câmera para posição inicial
     */
    resetCamera() {
        this.camera.position.set(5, 5, 10);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    /**
     * Ajusta renderização quando janela é redimensionada
     */
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        
        // Força o canvas a não ultrapassar o container
        this.renderer.domElement.style.maxWidth = '100%';
        this.renderer.domElement.style.maxHeight = '100%';
    }

    /**
     * Limpa recursos e para animação
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        if (this.wireframe) {
            this.wireframe.geometry.dispose();
            this.wireframe.material.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        window.removeEventListener('resize', () => this.onWindowResize());
    }
}
