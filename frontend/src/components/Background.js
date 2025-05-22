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
                this.size = Math.random() * 25 + 25; // Increased size range (25-50 pixels)
                this.speedX = (Math.random() * 1 - 0.25); // Increased speed range
                this.speedY = (Math.random() * 1 - 0.25); // Increased speed range
                this.opacity = Math.random() * 0.3 + 0.2;
                this.type = type;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() * 0.02 - 0.01);
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;

                // Wrap around edges instead of bouncing
                if (this.x < -this.size) this.x = canvas.width + this.size;
                if (this.x > canvas.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas.height + this.size;
                if (this.y > canvas.height + this.size) this.y = -this.size;

                // Subtle opacity variation
                this.opacity = 0.2 + Math.sin(Date.now() * 0.001 + this.x) * 0.1;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                if (this.type === 'message') {
                    // Message bubble
                    ctx.beginPath();
                    ctx.moveTo(-this.size * 0.5, -this.size * 0.3);
                    ctx.lineTo(this.size * 0.5, -this.size * 0.3);
                    ctx.lineTo(this.size * 0.5, this.size * 0.3);
                    ctx.lineTo(-this.size * 0.5, this.size * 0.3);
                    ctx.lineTo(-this.size * 0.5, -this.size * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else if (this.type === 'voice') {
                    // Voice message icon
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Sound waves
                    for (let i = 1; i <= 3; i++) {
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size * (0.4 + i * 0.2), 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 - i * 0.1})`;
                        ctx.stroke();
                    }
                } else if (this.type === 'headphone') {
                    // Headphone icon
                    ctx.beginPath();
                    ctx.arc(-this.size * 0.3, 0, this.size * 0.2, 0, Math.PI * 2);
                    ctx.arc(this.size * 0.3, 0, this.size * 0.2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Headband
                    ctx.beginPath();
                    ctx.arc(0, -this.size * 0.2, this.size * 0.5, Math.PI, 0);
                    ctx.stroke();
                } else if (this.type === 'video') {
                    // Video call icon
                    ctx.beginPath();
                    ctx.rect(-this.size * 0.4, -this.size * 0.3, this.size * 0.8, this.size * 0.6);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Camera lens
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
                    ctx.fill();
                } else if (this.type === 'group') {
                    // Group chat icon
                    for (let i = 0; i < 3; i++) {
                        const angle = (i * Math.PI * 2) / 3;
                        ctx.beginPath();
                        ctx.arc(
                            Math.cos(angle) * this.size * 0.3,
                            Math.sin(angle) * this.size * 0.3,
                            this.size * 0.2,
                            0,
                            Math.PI * 2
                        );
                        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                        ctx.stroke();
                    }
                } else if (this.type === 'notification') {
                    // Notification bell
                    ctx.beginPath();
                    ctx.arc(0, -this.size * 0.1, this.size * 0.3, Math.PI * 0.8, Math.PI * 2.2);
                    ctx.lineTo(0, this.size * 0.2);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.stroke();

                    // Bell top
                    ctx.beginPath();
                    ctx.arc(0, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        // Create particles with new types
        const particles = [];
        const types = ['message', 'voice', 'headphone', 'video', 'group', 'notification'];
        for (let i = 0; i < 25; i++) {
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
                //window.location.href = '/home';
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