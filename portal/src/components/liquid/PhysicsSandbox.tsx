import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { LiquidStore } from './Store';

export default function PhysicsSandbox() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const engine = Matter.Engine.create();
        const width = window.innerWidth;
        const height = window.innerHeight * 0.8;

        canvasRef.current.width = width * window.devicePixelRatio;
        canvasRef.current.height = height * window.devicePixelRatio;
        const ctx = canvasRef.current.getContext('2d')!;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Boundaries
        const ground = Matter.Bodies.rectangle(width / 2, height + 50, width * 2, 100, { isStatic: true });
        const wallL = Matter.Bodies.rectangle(-50, height / 2, 100, height * 2, { isStatic: true });
        const wallR = Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 2, { isStatic: true });

        Matter.Composite.add(engine.world, [ground, wallL, wallR]);

        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 120 : 400; // massive dense shapes

        const shapes = ['cross', 'square', 'circle', 'dot', 'triangle'];
        // Using brand palette against cream background
        const colors = ['#FF6B35', '#1A1208', '#8B7D6B'];
        const bodies: Matter.Body[] = [];

        for (let i = 0; i < count; i++) {
            const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            // Bias towards orange and black
            const color = Math.random() > 0.8 ? '#8B7D6B' : (Math.random() > 0.5 ? '#FF6B35' : '#1A1208');
            const size = Math.random() * 8 + 6;

            const options = {
                restitution: 0.6,
                friction: 0.1,
                density: 0.005,
                plugin: { shapeInfo: { type: shapeType, size, color } }
            };

            let body;
            const x = Math.random() * width;
            const y = height - (Math.random() * (isMobile ? 300 : 500)) - 50;

            if (shapeType === 'circle' || shapeType === 'dot') {
                body = Matter.Bodies.circle(x, y, size, options);
            } else if (shapeType === 'triangle') {
                body = Matter.Bodies.polygon(x, y, 3, size, options);
            } else {
                body = Matter.Bodies.rectangle(x, y, size * 2, size * 2, options);
            }
            bodies.push(body);
        }
        Matter.Composite.add(engine.world, bodies);

        let preMouse = { x: LiquidStore.mouse.x, y: LiquidStore.mouse.y };

        Matter.Events.on(engine, 'beforeUpdate', () => {
            if (!isMobile) {
                let mx = LiquidStore.mouse.x;
                let my = LiquidStore.mouse.y;

                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;

                let localMx = mx - rect.left;
                let localMy = my - rect.top;

                let dx = mx - preMouse.x;
                let dy = my - preMouse.y;
                let distMove = Math.sqrt(dx * dx + dy * dy);

                if (distMove > 3) {
                    bodies.forEach(body => {
                        let distX = body.position.x - localMx;
                        let distY = body.position.y - localMy;
                        let d = Math.sqrt(distX * distX + distY * distY);
                        if (d < 200) {
                            let forceMagnitude = 0.001 * (200 - d) / 200;
                            Matter.Body.applyForce(body, body.position, {
                                x: (distX / d) * forceMagnitude,
                                y: (distY / d) * forceMagnitude
                            });
                        }
                    });
                }
                preMouse = { x: mx, y: my };
            }
        });

        const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
            if (!e.gamma || !e.beta) return;
            engine.world.gravity.x = e.gamma / 45;
            engine.world.gravity.y = Math.max(0.2, e.beta / 45); // Keep gravity somewhat downwards
        };
        if (isMobile && typeof window.DeviceOrientationEvent !== 'undefined') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                const { type, size, color } = b.plugin.shapeInfo;
                const { x, y } = b.position;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(b.angle);

                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = 2.5;

                if (type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (type === 'dot') {
                    ctx.beginPath();
                    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
                    ctx.fill();
                } else if (type === 'square') {
                    ctx.strokeRect(-size, -size, size * 2, size * 2);
                } else if (type === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(0, -size);
                    ctx.lineTo(size * 0.866, size * 0.5);
                    ctx.lineTo(-size * 0.866, size * 0.5);
                    ctx.closePath();
                    ctx.stroke();
                } else if (type === 'cross') {
                    ctx.beginPath();
                    ctx.moveTo(-size, 0);
                    ctx.lineTo(size, 0);
                    ctx.moveTo(0, -size);
                    ctx.lineTo(0, size);
                    ctx.stroke();
                }

                ctx.restore();
            }
        };

        let rafId: number;
        const tick = () => {
            Matter.Engine.update(engine, 1000 / 60);
            render();
            rafId = requestAnimationFrame(tick);
        };
        tick();

        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight * 0.8;
            canvasRef.current!.width = w * window.devicePixelRatio;
            canvasRef.current!.height = h * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            Matter.Body.setPosition(ground, { x: w / 2, y: h + 50 });
            Matter.Body.setPosition(wallL, { x: -50, y: h / 2 });
            Matter.Body.setPosition(wallR, { x: w + 50, y: h / 2 });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(rafId);
            Matter.Engine.clear(engine);
            window.removeEventListener('resize', handleResize);
            if (isMobile) window.removeEventListener('deviceorientation', handleDeviceOrientation);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-10 overflow-hidden"
            onMouseEnter={() => LiquidStore.setHover('physics')}
            onMouseLeave={() => LiquidStore.setHover('default')}
        >
            <canvas ref={canvasRef} className="w-full h-full pointer-events-none mix-blend-multiply opacity-80" />

            {/* Soft gradient to fade the shapes at the very top of the physics container so they don't have hard edges if bounced */}
            <div className="absolute top-0 w-full h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #FEFCF8, transparent)' }} />
        </div>
    );
}
