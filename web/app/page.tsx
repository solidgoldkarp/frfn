'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import localFont from 'next/font/local';

// Regular font
const teodorFont = localFont({
  src: './public/TeodorTRIAL-Thin-BF672198fb9fdb1.otf',
  display: 'swap',
});

// Italic font
const teodorItalicFont = localFont({
  src: './public/TeodorTRIAL-ThinItalic-BF672198fb9f370.otf',
  display: 'swap',
});

// Custom animation styles
const animationStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
`;

// This component creates a completely custom layout
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);

    // Lighting - more subtle
    const ambientLight = new THREE.AmbientLight(0x222222, 0.4);
    scene.add(ambientLight);

    // Add point lights with cyberpunk colors but more intense
    const pointLight1 = new THREE.PointLight(0x4700D8, 0.8, 100); // Purple
    pointLight1.position.set(1.5, 1.5, 1.5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xF900BF, 0.8, 100); // Pink
    pointLight2.position.set(-1.5, -1.5, 1.5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x004e92, 0.8, 100); // Blue
    pointLight3.position.set(1.5, -1.5, -1.5);
    scene.add(pointLight3);

    // Surface parameters
    const genus = 2;
    const resolution = 80; // Higher resolution for more detailed surface

    // Function to generate the Costa-Hoffman-Meeks surface
    function generateCostaHoffmanMeeksSurface(genus: number, resolution: number) {
      // Generate the parametric data
      const uValues = [];
      const vValues = [];
      const step = 2 * Math.PI / (resolution - 1);
      
      for (let i = 0; i < resolution; i++) {
        uValues.push(i * step);
        vValues.push(i * step);
      }
      
      // Custom gradient colors - neon cyberpunk
      const cyberpunkColors = [
        new THREE.Color("#000428"), // Dark blue
        new THREE.Color("#004e92"), // Blue
        new THREE.Color("#4700D8"), // Purple
        new THREE.Color("#9900F0"), // Violet
        new THREE.Color("#F900BF"), // Pink
        new THREE.Color("#FF85B3")  // Light pink
      ];
      
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const colors: number[] = [];
      let minZ = Infinity;
      let maxZ = -Infinity;
      
      // Calculate all vertices and find min/max Z for color normalization
      const positions: Array<{x: number, y: number, z: number, i: number, j: number}> = [];
      for (let i = 0; i < resolution; i++) {
        const u = uValues[i];
        for (let j = 0; j < resolution; j++) {
          const v = vValues[j];
          
          const r = 1 + 0.3 * Math.sin(genus * u);
          const x = r * Math.cos(u) * (1 + 0.5 * Math.cos(v));
          const y = r * Math.sin(u) * (1 + 0.5 * Math.cos(v));
          const z = 0.5 * Math.sin(v) + 0.2 * Math.sin(genus * u);
          
          positions.push({ x, y, z, i, j });
          
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }
      }
      
      // Function to interpolate colors
      function getColorAtValue(value: number) {
        const normalizedValue = (value - minZ) / (maxZ - minZ);
        const index = normalizedValue * (cyberpunkColors.length - 1);
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        
        if (lowerIndex === upperIndex) {
          return cyberpunkColors[lowerIndex];
        }
        
        const t = index - lowerIndex;
        const lowerColor = cyberpunkColors[lowerIndex];
        const upperColor = cyberpunkColors[upperIndex];
        
        const resultColor = new THREE.Color();
        resultColor.r = lowerColor.r + (upperColor.r - lowerColor.r) * t;
        resultColor.g = lowerColor.g + (upperColor.g - lowerColor.g) * t;
        resultColor.b = lowerColor.b + (upperColor.b - lowerColor.b) * t;
        
        return resultColor;
      }
      
      // Create line segments with appropriate colors
      // Horizontal lines
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const pos1 = positions.find(p => p.i === i && p.j === j);
          const pos2 = positions.find(p => p.i === i && p.j === j + 1);
          
          if (pos1 && pos2) {
            const avgZ = (pos1.z + pos2.z) / 2;
            const color = getColorAtValue(avgZ);
            
            vertices.push(pos1.x, pos1.y, pos1.z);
            vertices.push(pos2.x, pos2.y, pos2.z);
            
            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
          }
        }
      }
      
      // Vertical lines
      for (let j = 0; j < resolution; j++) {
        for (let i = 0; i < resolution - 1; i++) {
          const pos1 = positions.find(p => p.i === i && p.j === j);
          const pos2 = positions.find(p => p.i === i + 1 && p.j === j);
          
          if (pos1 && pos2) {
            const avgZ = (pos1.z + pos2.z) / 2;
            const color = getColorAtValue(avgZ);
            
            vertices.push(pos1.x, pos1.y, pos1.z);
            vertices.push(pos2.x, pos2.y, pos2.z);
            
            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
          }
        }
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 1.5, // Thicker lines for better visibility
      });
      
      const wireframe = new THREE.LineSegments(geometry, material);
      return wireframe;
    }

    // Generate the surface
    const surface = generateCostaHoffmanMeeksSurface(genus, resolution);
    scene.add(surface);

    // Set camera closer to the surface (more zoomed in)
    camera.position.set(1.2, 1.2, 1.2); // Much closer position
    camera.lookAt(0, 0, 0);

    // Animation parameters
    let time = 0;
    let autoRotate = true;

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const toRadians = (angle: number) => angle * (Math.PI / 180);

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          toRadians(deltaMove.y * 0.5),
          toRadians(deltaMove.x * 0.5),
          0,
          'XYZ'
        )
      );
      
      surface.quaternion.multiplyQuaternions(deltaRotationQuaternion, surface.quaternion);
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      if (autoRotate) {
        time += 0.003; // Slower rotation for more elegance
        surface.rotation.y = time * 0.2;
        // Add subtle oscillation
        surface.position.y = Math.sin(time * 0.5) * 0.05;
      }
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Event listeners
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(surface);
      surface.geometry.dispose();
      (surface.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* THREE.js container */}
      <div ref={containerRef} className="fixed top-0 left-0 w-full h-full opacity-90" />
      
      {/* Minimal UI */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <div className="text-center w-full max-w-md mx-auto px-4 z-10">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className={`${teodorItalicFont.className} text-[10rem] leading-none font-bold text-white opacity-90`}>
              frfn
            </h1>
          </div>
          
          {/* Animated Tagline */}
          <div className="mb-10 text-center overflow-hidden">
            <p className="text-white/80 text-lg">
              Permissionless prediction markets with
              <span className="relative inline-block ml-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient">
                dynamic liquidity
              </span>
            </p>
          </div>
          
          {/* Entry button */}
          <div className="relative z-10">
            <Link 
              href="/markets" 
              className="inline-flex items-center py-3 px-6 border border-white/20 text-white text-lg hover:border-white/50 transition-all duration-300 backdrop-blur-md bg-black/10"
            >
              <span className="mr-2">ENTER</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Market Stats Ticker */}
      <div className="fixed top-4 right-4 z-20 backdrop-blur-md bg-black/20 border border-white/10 px-4 py-2 rounded-sm">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-white/50 text-xs">Active Markets</span>
            <span className="text-white text-sm font-medium">7</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/50 text-xs">24h Volume</span>
            <span className="text-white text-sm font-medium">$240</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/50 text-xs">TVL</span>
            <span className="text-white text-sm font-medium">$80</span>
          </div>
        </div>
      </div>
      
      {/* Bottom-left Fixed Info Panel */}
      <div className="fixed bottom-4 left-4 z-20 backdrop-blur-md bg-black/20 border border-white/10 p-4 text-white text-sm space-y-2">
        <div className="group relative cursor-pointer">
          Dynamic Liquidity
          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black/80 text-xs p-2 rounded">
            Liquidity focuses automatically on uncertain outcomes (40-60% odds).
          </span>
        </div>
        <div className="group relative cursor-pointer">
          AI Oracle
          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black/80 text-xs p-2 rounded">
            AI resolves outcomes, users can dispute by staking.
          </span>
        </div>
        <div className="group relative cursor-pointer">
          Self-Improving Oracle
          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black/80 text-xs p-2 rounded">
            Disputes improve oracle accuracy over time.
          </span>
        </div>
      </div>
      
      {/* Footer with status and links */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center justify-end space-x-6">
        {/* Status indicator */}
        <div className="flex items-center space-x-2 backdrop-blur-md bg-black/20 border border-white/10 px-3 py-1.5 rounded-sm">
          <div className="relative flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
          </div>
          <span className="text-white text-xs">Active</span>
        </div>
        
        {/* Links */}
        <div className="flex items-center space-x-4 backdrop-blur-md bg-black/20 border border-white/10 px-3 py-1.5 rounded-sm">
          {/* Twitter */}
          <a href="https://x.com/frfnxyz" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>
          
          {/* Github
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a> */}
          
          {/* Docs */}
          <a href="/docs" className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>
          
          {/* Telegram */}
          {/* <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a> */}
        </div>
      </div>
      
      {/* Version tag */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white/30 text-xs z-10">
        v0.1.0-alpha
      </div>
    </>
  );
}