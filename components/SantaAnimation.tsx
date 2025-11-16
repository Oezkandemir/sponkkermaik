"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

/**
 * Santa Animation Component
 * Santa bounces around the screen like a ping pong ball, staying within bounds
 */
export default function SantaAnimation() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ vx: 1.5, vy: 1.5 });
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<{
    interval: NodeJS.Timeout | null;
    pos: { x: number; y: number };
    vel: { vx: number; vy: number };
  }>({
    interval: null,
    pos: { x: 0, y: 0 },
    vel: { vx: 1.5, vy: 1.5 },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const startAnimation = () => {
      // Clean up any existing intervals
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval);
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Start from random position within screen
      const startX = width * 0.2 + Math.random() * width * 0.6;
      const startY = height * 0.2 + Math.random() * height * 0.6;
      
      // Random initial velocity
      const initialVx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 0.5);
      const initialVy = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 0.5);
      
      animationRef.current.pos = { x: startX, y: startY };
      animationRef.current.vel = { vx: initialVx, vy: initialVy };
      setPosition({ x: startX, y: startY });
      setVelocity({ vx: initialVx, vy: initialVy });
      setIsVisible(true);

      animationRef.current.interval = setInterval(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const imageWidth = 150; // Half of max width (300px)
        const imageHeight = 60; // Half of height (120px)
        
        let { x, y } = animationRef.current.pos;
        let { vx, vy } = animationRef.current.vel;
        
        // Calculate new position
        let newX = x + vx;
        let newY = y + vy;

        // Bounce off left or right edge
        if (newX - imageWidth <= 0) {
          newX = imageWidth;
          vx = Math.abs(vx); // Bounce right
        } else if (newX + imageWidth >= width) {
          newX = width - imageWidth;
          vx = -Math.abs(vx); // Bounce left
        }

        // Bounce off top or bottom edge
        if (newY - imageHeight <= 0) {
          newY = imageHeight;
          vy = Math.abs(vy); // Bounce down
        } else if (newY + imageHeight >= height) {
          newY = height - imageHeight;
          vy = -Math.abs(vy); // Bounce up
        }

        // Update refs and state
        animationRef.current.pos = { x: newX, y: newY };
        animationRef.current.vel = { vx, vy };
        setPosition({ x: newX, y: newY });
        setVelocity({ vx, vy });
      }, 16); // ~60fps for smooth animation
    };

    // Start first animation after a short delay
    const initialTimeout = setTimeout(() => {
      startAnimation();
    }, 500);

    // Handle window resize - keep Santa in bounds
    const handleResize = () => {
      setPosition((prev) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const imageWidth = 150;
        const imageHeight = 60;
        
        let newX = prev.x;
        let newY = prev.y;
        
        // Keep within new bounds
        if (newX - imageWidth < 0) newX = imageWidth;
        if (newX + imageWidth > width) newX = width - imageWidth;
        if (newY - imageHeight < 0) newY = imageHeight;
        if (newY + imageHeight > height) newY = height - imageHeight;
        
        return { x: newX, y: newY };
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(initialTimeout);
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isVisible) return null;

  // Flip image when moving right (positive vx) - inverted logic
  const shouldFlip = velocity.vx > 0;

  return (
    <div
      className="fixed z-20 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) ${shouldFlip ? "scaleX(-1)" : ""}`,
        transition: "none", // No transition for smooth animation
      }}
    >
      <div className="relative">
        {/* Santa with Sleigh and Reindeer Image - Floating effect in all directions */}
        <div
          style={{
            animation: "float3d 4s ease-in-out infinite",
          }}
        >
          <Image
            src="/images/santa.png"
            alt="Santa Claus with sleigh and reindeer"
            width={300}
            height={200}
            className="drop-shadow-2xl"
            style={{
              width: "auto",
              height: "120px",
              maxWidth: "300px",
              display: "block",
            }}
            priority
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes float3d {
          0% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(8px, -8px) rotate(2deg);
          }
          50% {
            transform: translate(-6px, -12px) rotate(-1deg);
          }
          75% {
            transform: translate(-8px, 6px) rotate(1deg);
          }
          100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}

