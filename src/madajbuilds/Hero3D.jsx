import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Tube } from "@react-three/drei";
import * as THREE from "three";

// A flowing, glossy 3D tube sculpture — real WebGL geometry, materials and
// lighting (not a CSS/SVG trick). The control points below trace an
// original looping ribbon shape.
const CONTROL_POINTS = [
    [-3.4, 0.6, 0], [-2.6, 1.4, 0.4], [-1.7, 0.4, 0.2], [-1.5, -0.9, -0.3],
    [-0.6, -1.3, 0.1], [0.1, -0.2, 0.5], [0.4, 1.1, 0.1], [1.1, 1.5, -0.3],
    [1.6, 0.4, 0], [1.5, -0.8, 0.3], [2.3, -1.2, 0], [3.2, -0.2, -0.2],
    [3.6, 1.0, 0.2],
];

// Hand-written fresnel rim shader — an iridescent shimmer that hugs the
// silhouette of the tube and drifts over time. Additive, layered on top of
// the physical-material tube beneath it.
const VERTEX_SHADER = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const FRAGMENT_SHADER = /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
        float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.4);
        float shimmer = 0.5 + 0.5 * sin(uTime * 1.3 + vNormal.x * 6.0 + vNormal.y * 4.0);
        vec3 color = mix(uColorA, uColorB, shimmer);
        gl_FragColor = vec4(color, fresnel * 0.85);
    }
`;

const ShimmerSkin = ({ curve }) => {
    const matRef = useRef(null);
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color("#9db1ff") },
            uColorB: { value: new THREE.Color("#22d3ee") },
        }),
        []
    );

    useFrame((state) => {
        if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    });

    return (
        <Tube args={[curve, 220, 0.365, 24, false]} scale={1}>
            <shaderMaterial
                ref={matRef}
                vertexShader={VERTEX_SHADER}
                fragmentShader={FRAGMENT_SHADER}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.FrontSide}
            />
        </Tube>
    );
};

const RibbonTube = () => {
    const ref = useRef(null);
    const curve = useMemo(
        () => new THREE.CatmullRomCurve3(CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
        []
    );

    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.18;
    });

    return (
        <group ref={ref}>
            <Tube args={[curve, 220, 0.34, 24, false]}>
                <meshPhysicalMaterial
                    color="#5b6cff"
                    roughness={0.15}
                    metalness={0.05}
                    clearcoat={1}
                    clearcoatRoughness={0.08}
                    transmission={0.12}
                    thickness={0.8}
                    ior={1.3}
                />
            </Tube>
            <ShimmerSkin curve={curve} />
        </group>
    );
};

const Hero3D = () => (
    <Canvas
        className="hero-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
    >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.7} />
        <pointLight position={[-4, -2, 3]} intensity={0.9} color="#8ea2ff" />
        <Suspense fallback={null}>
            <RibbonTube />
            <Environment preset="city" />
        </Suspense>
    </Canvas>
);

export default Hero3D;
