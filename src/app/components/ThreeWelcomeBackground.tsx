import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeWelcomeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0E2A'); // Deep indigo to match WelcomePage
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Starfield particles
    const particleCount = 1500;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Position
      posArray[i * 3] = (Math.random() - 0.5) * 200; // Wider spread
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 200;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 200;
      // Color (mix of neon blue and purple)
      const color = Math.random() < 0.7 ? new THREE.Color('#00f7ff') : new THREE.Color('#ff00ff');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
    });
    const particleSystem = new THREE.Points(particles, material);
    scene.add(particleSystem);

    camera.position.z = 100;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Gentle auto-movement for starfield effect
      particleSystem.rotation.y += 0.0005;
      particleSystem.rotation.x += 0.0003;
      // Mouse-driven parallax
      particleSystem.rotation.x = mouseY * 0.6;
      particleSystem.rotation.y = mouseX * 0.6;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default ThreeWelcomeBackground;