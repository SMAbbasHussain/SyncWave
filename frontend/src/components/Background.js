import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Background.css';

const Background = ({ children }) => {
    const canvasRef = useRef(null);
    const [showLogo, setShowLogo] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Add Orbitron font
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size to match window
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class for chat and robot icons
        class Particle {
            constructor(type) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 20 + 10;
                this.speedX = (Math.random() * 0.5 - 0.25) * 1.9; // Slower speed (halved)
                this.speedY = (Math.random() * 0.5 - 0.25) * 1.5; // Slower speed (halved)
                this.opacity = Math.random() * 0.5 + 0.3;
                this.type = type; // Type determines the icon
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -2;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -3;

                // Slight opacity animation
                this.opacity += Math.sin(Date.now() * 0.002) * 0.01;
                if (this.opacity < 0.3) this.opacity = 0.3;
                if (this.opacity > 0.8) this.opacity = 0.8;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.translate(this.x, this.y);

                if (this.type === 'chatBubble') {
                    // Chat bubble with robot face
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Robot face inside
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2); // Head
                    ctx.fill();

                    // Eyes
                    ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(-this.size * 0.15, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
                    ctx.arc(this.size * 0.15, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.type === 'robotHead') {
                    // Robot head
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.rect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Antenna
                    ctx.beginPath();
                    ctx.moveTo(0, -this.size * 0.5);
                    ctx.lineTo(0, -this.size * 0.8);
                    ctx.stroke();

                    // Eyes
                    ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(-this.size * 0.15, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
                    ctx.arc(this.size * 0.15, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.type === 'messageSymbol') {
                    // Message symbol (envelope-like)
                    ctx.beginPath();
                    ctx.moveTo(-this.size * 0.5, -this.size * 0.3);
                    ctx.lineTo(this.size * 0.5, -this.size * 0.3);
                    ctx.lineTo(0, this.size * 0.5);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else if (this.type === 'circuitChat') {
                    // Circuit-like chat symbol
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Circuit lines
                    ctx.beginPath();
                    ctx.moveTo(-this.size * 0.3, 0);
                    ctx.lineTo(this.size * 0.3, 0);
                    ctx.moveTo(0, -this.size * 0.3);
                    ctx.lineTo(0, this.size * 0.3);
                    ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else if (this.type === 'gearRobot') {
                    // Gear-shaped robot icon
                    ctx.beginPath();
                    for (let i = 0; i < 8; i++) {
                        const angle = (i * Math.PI) / 4;
                        const innerRadius = this.size * 0.5;
                        const outerRadius = this.size * 0.7;
                        ctx.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
                        ctx.lineTo(
                            Math.cos(angle + Math.PI / 8) * outerRadius,
                            Math.sin(angle + Math.PI / 8) * outerRadius
                        );
                    }
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Center circle
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
                    ctx.fill();
                } else if (this.type === 'holoChat') {
                    // Holographic chat bubble
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Holographic lines
                    ctx.beginPath();
                    ctx.moveTo(-this.size * 0.5, 0);
                    ctx.lineTo(this.size * 0.5, 0);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        // Create particles
        const particles = [];
        const types = ['chatBubble', 'robotHead', 'messageSymbol', 'circuitChat', 'gearRobot', 'holoChat'];
        for (let i = 0; i < 30; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            particles.push(new Particle(type));
        }

        // Draw the background
        function drawBackground() {
            // Clear the canvas (transparent background)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create a darker gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(5, 10, 20, 0.95)'); // Darker blue
            gradient.addColorStop(0.5, 'rgba(10, 5, 25, 0.9)'); // Darker purple
            gradient.addColorStop(1, 'rgba(5, 10, 20, 0.95)'); // Darker blue

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw animated particles (chat and robot icons)
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            // Only draw the logo if showLogo is true
            if (showLogo) {
                // Draw the "SyncWave" logo with neon effect
                ctx.font = "bold 100px 'Orbitron'";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Neon glow effect for the text
                ctx.shadowColor = 'rgba(0, 255, 255, 0.9)'; // Cyan glow
                ctx.shadowBlur = 30 + Math.sin(Date.now() * 0.004) * 5; // Pulsing glow
                ctx.fillStyle = '#00FFFF'; // Cyan text
                ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)'; // Purple outline
                ctx.lineWidth = 1;

                // Draw the text with outline and fill
                ctx.strokeText('SyncWave', canvas.width / 2, canvas.height / 2);
                ctx.fillText('SyncWave', canvas.width / 2, canvas.height / 2);

                // Draw loading animation if transitioning
                if (isTransitioning) {
                    const time = Date.now() * 0.001;
                    const dots = '.'.repeat(Math.floor((time % 1) * 4));
                    ctx.font = "30px 'Orbitron'";
                    ctx.fillStyle = '#00FFFF';
                    ctx.fillText(`Loading${dots}`, canvas.width / 2, canvas.height / 2 + 80);
                }
            }

            // Add subtle background glow effect
            const glowGradient = ctx.createRadialGradient(
                canvas.width / 1.5,
                canvas.height / 1.5,
                0,
                canvas.width / 1.5,
                canvas.height / 1.5,
                Math.max(canvas.width, canvas.height) / 2
            );
            glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Animation loop
        let animationFrameId;
        function animate() {
            drawBackground();
            animationFrameId = requestAnimationFrame(animate);
        }
        animate();

        // Cleanup function
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [showLogo, isTransitioning]);

    // Handle route changes and transitions
    useEffect(() => {
        const handleRouteChange = async () => {
            // Show logo and transition for specific routes
            if (location.pathname === '/home') {
                setShowLogo(true);
            } else if (location.pathname === '/profile-setup') {
                // After profile setup, show transition
                setIsTransitioning(true);
                setShowLogo(true);

                // Wait for 4 seconds then navigate to home
                await new Promise(resolve => setTimeout(resolve, 4000));
                setIsTransitioning(false);
                window.location.href = '/home';
            } else {
                setShowLogo(false);
                setIsTransitioning(false);
            }
        };

        handleRouteChange();
    }, [location]);

    return (
        <div className={`background-container ${isTransitioning ? 'transitioning' : ''}`}>
            <canvas ref={canvasRef} className="background-canvas" />
            <div className={`content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                {children}
            </div>
        </div>
    );
};

export default Background;