import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LiquidStore } from './Store';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform sampler2D uDisp;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  // Basic Noise function
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  void main() {
    // Basic grain
    float grain = rand(vUv * uTime) * 0.05;
    
    // Background map reads
    vec4 disp = texture2D(uDisp, vUv);
    float d = disp.r;
    
    vec2 pos = vUv;
    
    // Background color: slight dynamic noise
    vec3 color = vec3(0.99, 0.98, 0.96); // #FEFCF8
    
    // Create a liquid orange refraction instead of smoke
    vec3 highlight = vec3(1.0, 0.42, 0.2); // Brand Orange
    vec3 deepWater = vec3(1.0, 0.8, 0.5);  // Warm highlight
    
    color = mix(color, highlight, d * 0.8);
    color = mix(color, vec3(1.0), d * d * 0.5); // extra specular shine
    color -= grain;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function LiquidCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Three.js setup
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.pointerEvents = 'none';
        containerRef.current.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Ripple Canvas logic
        const rippleCanvas = document.createElement('canvas');
        rippleCanvas.width = window.innerWidth;
        rippleCanvas.height = window.innerHeight;
        const ctx = rippleCanvas.getContext('2d');

        let rippleTex = new THREE.CanvasTexture(rippleCanvas);
        rippleTex.minFilter = THREE.LinearFilter;
        rippleTex.magFilter = THREE.LinearFilter;

        // Background quad
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uDisp: { value: rippleTex },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            }
        });

        const quad = new THREE.Mesh(geometry, material);
        scene.add(quad);

        const ripples: { x: number, y: number, age: number, maxAge: number }[] = [];

        let prevMouseRaw = { x: LiquidStore.mouse.x, y: LiquidStore.mouse.y };

        let reqId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            if (LiquidStore.isMobile) return; // simple mobile skip

            let dt = clock.getDelta();
            let elapsedTime = clock.getElapsedTime();

            let dx = LiquidStore.mouse.x - prevMouseRaw.x;
            let dy = LiquidStore.mouse.y - prevMouseRaw.y;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                ripples.push({
                    x: LiquidStore.mouse.x,
                    y: LiquidStore.mouse.y,
                    age: 0,
                    maxAge: 1.2
                });
                prevMouseRaw.x = LiquidStore.mouse.x;
                prevMouseRaw.y = LiquidStore.mouse.y;
            }

            if (ctx) {
                // fade out
                ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                ctx.fillRect(0, 0, rippleCanvas.width, rippleCanvas.height);

                for (let i = ripples.length - 1; i >= 0; i--) {
                    let r = ripples[i];
                    r.age += dt;
                    if (r.age >= r.maxAge) {
                        ripples.splice(i, 1);
                        continue;
                    }

                    let life = 1.0 - (r.age / r.maxAge);
                    ctx.beginPath();
                    // radius 150px
                    let rad = 150 * (1 - life);
                    ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);

                    let grd = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, rad);
                    grd.addColorStop(0, `rgba(255, 255, 255, ${life * 0.15})`);
                    grd.addColorStop(1, "rgba(0, 0, 0, 0)");

                    ctx.fillStyle = grd;
                    ctx.fill();
                }
            }
            rippleTex.needsUpdate = true;
            material.uniforms.uTime.value = elapsedTime;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            rippleCanvas.width = window.innerWidth;
            rippleCanvas.height = window.innerHeight;

            rippleTex.dispose();
            rippleTex = new THREE.CanvasTexture(rippleCanvas);
            rippleTex.minFilter = THREE.LinearFilter;
            rippleTex.magFilter = THREE.LinearFilter;
            material.uniforms.uDisp.value = rippleTex;

            renderer.setSize(window.innerWidth, window.innerHeight);
            material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[-1]" />;
}
