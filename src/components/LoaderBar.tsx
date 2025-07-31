'use client';

import { useEffect, useState, useRef } from 'react';

export default function LoaderBar({ duration = 2000 }: { duration?: number }) {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(true);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        // Animate progress bar to 90% over time
        const animate = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / duration) * 90, 90);
            setProgress(newProgress);
            if (newProgress < 90) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [duration]);

    // Auto finish after mount (for short pages)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setProgress(100);
            setTimeout(() => setVisible(false), 300);
        }, duration);

        return () => clearTimeout(timeout);
    }, [duration]);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-100/30">
            <div
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all ease-out relative overflow-hidden rounded-r-full"
                style={{ width: `${progress}%`, transitionDuration: '300ms' }}
            >
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                {/* Glow */}
                <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-blue-400/60 to-transparent" />
            </div>
        </div>
    );
}
