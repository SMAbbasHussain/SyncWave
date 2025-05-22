import React, { useEffect, useRef } from 'react';
import '../styles/Background.css';

const Background = ({ children }) => {
    const canvasRef = useRef(null);

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

        // Create particles
        const particles = [];
        const types = ['message', 'voice', 'headphone', 'video', 'group', 'notification'];
        for (let i = 0; i < 25; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            particles.push(new Particle(type));
        }

        // Draw the background
        function drawBackground() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(5, 10, 20, 0.95)');
            gradient.addColorStop(0.5, 'rgba(10, 5, 25, 0.9)');
            gradient.addColorStop(1, 'rgba(5, 10, 20, 0.95)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw particles
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            // Add subtle background glow
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

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="background-container">
            <canvas ref={canvasRef} className="background-canvas" />
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Background;