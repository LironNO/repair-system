import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export const Pacman: React.FC = () => {
    const [isMoving, setIsMoving] = useState(false);
    const [eatingText, setEatingText] = useState(false);
    
    const startAnimation = () => {
        if (!isMoving) {
            setIsMoving(true);
            setEatingText(true);
            
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                setIsMoving(false);
                setEatingText(false);
            }, 2000);
        }
    };

    return (
        <div 
            className={`pacman-container cursor-pointer ${isMoving ? 'active' : ''}`}
            onClick={startAnimation}
        >
            <div className="pacman"></div>
            <style jsx>{`
                .pacman-container {
                    position: relative;
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                }

                .pacman {
                    width: 0px;
                    height: 0px;
                    border-right: 15px solid transparent;
                    border-top: 15px solid #fbbf24;
                    border-left: 15px solid #fbbf24;
                    border-bottom: 15px solid #fbbf24;
                    border-top-left-radius: 15px;
                    border-top-right-radius: 15px;
                    border-bottom-left-radius: 15px;
                    border-bottom-right-radius: 15px;
                    animation: ${isMoving ? 'eat 0.25s linear infinite' : 'none'};
                }

                @keyframes eat {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(45deg); }
                    100% { transform: rotate(0deg); }
                }
            `}</style>
        </div>
    );
}; 
