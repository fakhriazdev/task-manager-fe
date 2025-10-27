// hooks/useDebouncedCallback.ts
"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Debounced callback berbasis tuple args dengan cancel method.
 * - Type-safe dengan generic constraints
 * - Callback stabil dengan useCallback
 * - Auto-cleanup saat unmount
 * - Expose cancel method untuk manual cancellation
 */
export function useDebouncedCallback<A extends unknown[]>(
    fn: (...args: A) => void,
    delay = 400
) {
    const fnRef = useRef(fn);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Selalu pegang fn terbaru
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    // ✅ Cancel function yang bisa dipanggil manual
    const cancel = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // ✅ Debounced function
    const debounced = useCallback(
        (...args: A) => {
            cancel();
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                fnRef.current(...args);
            }, delay);
        },
        [delay, cancel]
    );

    // ✅ Cleanup saat unmount
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    // ✅ Return object dengan debounced function dan cancel method
    return Object.assign(debounced, { cancel });
}