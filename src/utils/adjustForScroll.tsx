// adjustForScroll.ts
import type { Modifier } from '@dnd-kit/core'

export function adjustForScroll(getEl: () => HTMLElement | null): Modifier {
    return ({ transform }) => {
        const el = getEl()
        if (!el) return transform
        // kompensasi pergeseran scroll kontainer
        return {
            ...transform,
            x: transform.x + el.scrollLeft,
            y: transform.y + el.scrollTop,
        }
    }
}
