import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const CONTAINER_INSET = 16; // fixed inset-2 = 8px top + 8px bottom
const BOTTOM_NAV_HEIGHT = 64;
const HANDLE_HEIGHT = 22; // py-2 (16px) + h-1.5 (6px)

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
    const viewportHeight =
        typeof window !== "undefined"
            ? window.innerHeight - CONTAINER_INSET - BOTTOM_NAV_HEIGHT
            : 800;
    const defaultHeight = Math.round(viewportHeight * openHeight);
    const maxHeight = viewportHeight - topOffset;
    const peekHeight = HANDLE_HEIGHT;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [expanded, setExpanded] = useState(false);
    const controls = useAnimation();

    const TRANSITION = { type: "tween", duration: 0.2, ease: "easeOut" } as const;

    const dragStartY = useRef(0);
    const dragStartOpen = useRef(isOpen);
    const scrollRef = useRef<HTMLDivElement>(null);
    const onOpenChangeRef = useRef(onOpenChange);

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
    }, [open]);

    useEffect(() => {
        onOpenChangeRef.current?.(isOpen);
    }, [isOpen]);

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
                controls.start({
                    y: defaultHeight - peekHeight,
                    height: defaultHeight,
                    transition: TRANSITION,
                });
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
        const scrolled = el.scrollTop > 0;
        if (scrolled && !expanded) {
            setExpanded(true);
            controls.start({ height: maxHeight, transition: TRANSITION });
        } else if (!scrolled && expanded && el.scrollHeight > maxHeight) {
            // Only collapse if content actually overflows maxHeight (real scrollable content)
            setExpanded(false);
            controls.start({ height: defaultHeight, transition: TRANSITION });
        }
        onScroll?.(e);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            animate={controls}
            initial={{ y: defaultOpen ? 0 : defaultHeight - peekHeight, height: defaultHeight }}
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
