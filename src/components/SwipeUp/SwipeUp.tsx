import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const CONTAINER_INSET = 16; // fixed inset-2 = 8px top + 8px bottom
const BOTTOM_NAV_HEIGHT = 64;
const HANDLE_HEIGHT = 22; // py-2 (16px) + h-1.5 (6px)

// Fix #1: Read viewport height once via visualViewport (stable on iOS Safari chrome resize)
// window.innerHeight changes as Safari's address bar shows/hides, causing layout jumps.
// visualViewport.height tracks the actual visible area and is immune to that instability.
function getStableViewportHeight(): number {
    if (typeof window === "undefined") return 800;
    return (
        (window.visualViewport?.height ?? window.innerHeight) - CONTAINER_INSET - BOTTOM_NAV_HEIGHT
    );
}

type SwipeUpProps = {
    children: React.ReactNode;
    openHeight?: number;
    topOffset?: number;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    open?: boolean;
    initialScrollTop?: number;
};

export default function SwipeUp({
    children,
    openHeight = 0.7,
    topOffset = 0,
    defaultOpen = false,
    onOpenChange,
    onScroll,
    open,
    initialScrollTop = 0,
}: SwipeUpProps) {
    // Captured once on mount — never recalculated from re-renders
    const viewportHeightRef = useRef(getStableViewportHeight());
    const defaultHeight = Math.round(viewportHeightRef.current * openHeight);
    const maxHeight = viewportHeightRef.current - topOffset;
    const peekHeight = HANDLE_HEIGHT;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [expanded, setExpanded] = useState(false);
    const controls = useAnimation();

    const TRANSITION = { type: "tween", duration: 0.2, ease: "easeOut" } as const;

    const dragStartY = useRef(0);
    const dragStartOpen = useRef(isOpen);
    const scrollRef = useRef<HTMLDivElement>(null);
    const onOpenChangeRef = useRef(onOpenChange);
    // Fix #2b: debounce timer to absorb iOS momentum/rubber-band scroll oscillation
    const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useLayoutEffect(() => {
        onOpenChangeRef.current = onOpenChange;
    });

    useEffect(() => {
        controls.start({ y: isOpen ? 0 : defaultHeight - peekHeight, transition: TRANSITION });
        if (initialScrollTop > 0 && scrollRef.current) {
            scrollRef.current.scrollTop = initialScrollTop;
        }
    }, []);

    useEffect(() => {
        if (open !== undefined) {
            const target = open ? 0 : defaultHeight - peekHeight;
            controls.start({ y: target, transition: TRANSITION });
            setIsOpen(open);
        }
    }, [open, defaultHeight, peekHeight]); // Fix #3: include derived heights so position stays correct if they ever change

    useEffect(() => {
        onOpenChangeRef.current?.(isOpen);
    }, [isOpen]);

    // Fix #2b: clean up debounce timer on unmount
    useEffect(() => {
        return () => {
            if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        dragStartY.current = e.clientY;
        dragStartOpen.current = isOpen;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
        const delta = e.clientY - dragStartY.current;
        if (expanded) {
            controls.set({ y: Math.max(0, delta) });
            return;
        }
        const base = dragStartOpen.current ? 0 : defaultHeight - peekHeight;
        const y = Math.max(0, Math.min(defaultHeight - peekHeight, base + delta));
        controls.set({ y });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
        const delta = e.clientY - dragStartY.current;
        if (expanded) {
            if (delta > 40) {
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
                setExpanded(false);
                setIsOpen(false);
                // Fix #4: snap height synchronously before animating y, so they don't compete
                controls.set({ height: defaultHeight });
                controls.start({ y: defaultHeight - peekHeight, transition: TRANSITION });
            } else {
                controls.start({ y: 0, transition: TRANSITION });
            }
            return;
        }
        const open = dragStartOpen.current ? delta < 40 : delta < -40;
        controls.start({ y: open ? 0 : defaultHeight - peekHeight, transition: TRANSITION });
        setIsOpen(open);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        // Fix #2a: clamp to 0 — iOS rubber-band overscroll can make scrollTop go negative,
        // which would otherwise flip `scrolled` false and trigger a spurious collapse.
        const scrolled = Math.max(0, el.scrollTop) > 0;
        if (scrolled && !expanded) {
            if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
            setExpanded(true);
            controls.start({ height: maxHeight, transition: TRANSITION });
        } else if (!scrolled && expanded && el.scrollHeight > maxHeight) {
            // Fix #2b: debounce collapse to absorb iOS momentum scroll oscillation around 0
            if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
            collapseTimerRef.current = setTimeout(() => {
                setExpanded(false);
                controls.start({ height: defaultHeight, transition: TRANSITION });
            }, 150);
        }
        onScroll?.(e);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            animate={controls}
            initial={{ y: defaultHeight - peekHeight, height: defaultHeight }}
            className="absolute left-0 right-0 bottom-0 z-40 flex flex-col bg-white rounded-t-2xl w-full shadow-2xl"
        >
            <div
                className="flex justify-center w-full py-2 shrink-0 cursor-grab active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <div className="w-12 h-1.5 rounded-full bg-primary-300" />
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-2 pb-16 min-h-0"
                style={{ touchAction: "pan-y" }}
                onScroll={handleScroll}
            >
                {children}
            </div>
        </motion.div>
    );
}
