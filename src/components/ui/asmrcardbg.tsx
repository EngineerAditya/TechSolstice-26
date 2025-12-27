"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ASMRStaticBackgroundProps {
  className?: string;
}

/**
 * ASMRStaticBackground
 * - Adaptive particle count for mobile/desktop
 * - Respects prefers-reduced-motion
 * - Light-weight defaults to avoid mobile lag
 * - Positioned absolutely to fill container (fixes overflow issues)
 */
const ASMRCardBg: React.FC<ASMRStaticBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use container dimensions
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let animationFrameId = 0;

    // Adaptive particle density
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    // Scale particle count based on area relative to full screen
    // This prevents too many particles in small cards
    const area = width * height;
    const windowArea = (typeof window !== "undefined") ? (window.innerWidth * window.innerHeight) : area;
    const scaleFactor = Math.min(1, area / Math.max(1, windowArea));
    
    const BASE_COUNT = isMobile ? 160 : Math.round(600 / (2 / DPR));
    const PARTICLE_COUNT = Math.max(30, Math.round(BASE_COUNT * scaleFactor));

    const MAGNETIC_RADIUS = isMobile ? 180 : 280;
    const VORTEX_STRENGTH = 0.07;
    const PULL_STRENGTH = 0.12;

    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      size = 0;
      alpha = 0;
      color = "";
      rotation = 0;
      rotationSpeed = 0;
      frictionGlow = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * (isMobile ? 1.2 : 1.6) + 0.4;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        const isGlass = Math.random() > 0.7;
        this.color = isGlass ? "240, 245, 255" : "80, 80, 85";
        this.alpha = Math.random() * 0.35 + 0.08;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
      }

      update() {
        // We need mouse coordinates relative to the canvas
        // However, the mouse handler uses clientX/Y which are global
        // We need to subtract the canvas rect offset
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const relativeMouseX = mouse.x - rect.left;
        const relativeMouseY = mouse.y - rect.top;

        const dx = relativeMouseX - this.x;
        const dy = relativeMouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < MAGNETIC_RADIUS) {
          const force = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;
          this.vx += (dx / dist) * force * PULL_STRENGTH;
          this.vy += (dy / dist) * force * PULL_STRENGTH;
          this.vx += (dy / dist) * force * VORTEX_STRENGTH * 10;
          this.vy -= (dx / dist) * force * VORTEX_STRENGTH * 10;
          this.frictionGlow = force * 0.7;
        } else {
          this.frictionGlow *= 0.92;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.95;
        this.vy *= 0.95;

        this.vx += (Math.random() - 0.5) * 0.03;
        this.vy += (Math.random() - 0.5) * 0.03;

        this.rotation += this.rotationSpeed + (Math.abs(this.vx) + Math.abs(this.vy)) * 0.05;

        // Wrap around logic
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const finalAlpha = Math.min(this.alpha + this.frictionGlow, 0.9);
        ctx.fillStyle = `rgba(${this.color}, ${finalAlpha})`;

        if (this.frictionGlow > 0.3) {
          ctx.shadowBlur = 8 * this.frictionGlow;
          ctx.shadowColor = `rgba(180, 220, 255, ${this.frictionGlow})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(0, -this.size * 2.5);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size * 2.5);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    let particles: Particle[] = [];

    const init = () => {
      // Use offsetWidth/Height for container size
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;

      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
      
      // scale for DPR
      if (DPR && DPR !== 1) {
        canvas.width = Math.round(width * DPR);
        canvas.height = Math.round(height * DPR);
        // Do not set style.width/height here as it conflicts with w-full h-full class
        // canvas.style.width = `${width}px`; 
        // canvas.style.height = `${height}px`;
        ctx.scale(DPR, DPR);
      }
    };

    const render = () => {
      // slight motion blur for depth
      ctx.fillStyle = isMobile ? "rgba(10,10,12,0.22)" : "rgba(10,10,12,0.18)";
      ctx.fillRect(0, 0, width, height);

      // Draw particles (limit per frame for performance on mobile)
      const step = isMobile ? 1 : 1;
      for (let i = 0; i < particles.length; i += step) {
        const p = particles[i];
        p.update();
        p.draw();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const debouncedInit = () => {
      // small debounce on resize
      clearTimeout((debouncedInit as any)._t);
      (debouncedInit as any)._t = setTimeout(() => init(), 150);
    };

    // We can use ResizeObserver for more robust sizing if supported, 
    // but sticking to window resize is safe enough for this fix.
    // However, since we changed to container size, window resize might not capture all container resizes.
    // Ideally we should use ResizeObserver on the canvas parent.
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
       resizeObserver = new ResizeObserver(() => {
         debouncedInit();
       });
       if (canvas.parentElement) {
         resizeObserver.observe(canvas.parentElement);
       }
    } else {
       window.addEventListener("resize", debouncedInit);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    init();
    render();

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", debouncedInit);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove as EventListener);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={cn("absolute inset-0 -z-10 pointer-events-none", className)}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default ASMRCardBg;
