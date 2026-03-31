import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const BOTTOM_NAV_HEIGHT = 64;

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
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const defaultHeight = Math.round(viewportHeight * openHeight);
    const maxHeight = viewportHeight - topOffset;
    const peekHeight = 74 + BOTTOM_NAV_HEIGHT;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [expanded, setExpanded] = useState(false);
    const controls = useAnimation();

    const dragStartY = useRef(0);
    const dragStartOpen = useRef(isOpen);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        controls.start({ y: isOpen ? 0 : defaultHeight - peekHeight });
        if (initialScrollTop > 0 && scrollRef.current) {
            scrollRef.current.scrollTop = initialScrollTop;
        }
    }, []);

    useEffect(() => {
        if (open !== undefined) {
            const target = open ? 0 : defaultHeight - peekHeight;
            controls.start({ y: target });
            setIsOpen(open);
        }
    }, [open]);

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (expanded) return;
        dragStartY.current = e.clientY;
        dragStartOpen.current = isOpen;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (expanded || !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
        const delta = e.clientY - dragStartY.current;
        const base = dragStartOpen.current ? 0 : defaultHeight - peekHeight;
        const y = Math.max(0, Math.min(defaultHeight - peekHeight, base + delta));
        controls.set({ y });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (expanded || !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
        const delta = e.clientY - dragStartY.current;
        const open = dragStartOpen.current ? delta < 40 : delta < -40;
        controls.start({
            y: open ? 0 : defaultHeight - peekHeight,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        });
        setIsOpen(open);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrolled = e.currentTarget.scrollTop > 0;
        if (scrolled !== expanded) {
            setExpanded(scrolled);
            controls.start({
                height: scrolled ? maxHeight : defaultHeight,
                transition: { type: "spring", stiffness: 300, damping: 30 },
            });
        }
        onScroll?.(e);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            animate={controls}
            initial={{ y: defaultOpen ? 0 : defaultHeight - peekHeight, height: defaultHeight }}
            className="fixed left-0 right-0 bottom-0 z-40 flex flex-col bg-neutral-lightest rounded-t-2xl w-full shadow-2xl"
        >
            <div
                className="flex justify-center w-full py-2 shrink-0 cursor-grab active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <div className="w-12 h-1.5 rounded-full bg-primary/50" />
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
