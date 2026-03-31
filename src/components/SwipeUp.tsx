import React, { useEffect, useState } from "react";
import { motion, useDragControls, useMotionValue } from "framer-motion";

type SwipeUpProps = {
    children: React.ReactNode;
    openHeight?: number;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Controlled open state */
    open?: boolean;
};

export default function SwipeUp({
    children,
    openHeight = 0.6,
    defaultOpen = false,
    onOpenChange,
    open,
}: SwipeUpProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const translateY = useMotionValue(0);
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const defaultHeight = Math.round(viewportHeight * openHeight);
    const closedTranslate = defaultHeight - 74;
    const controls = useDragControls();

    // Sync controlled mode
    useEffect(() => {
        if (open !== undefined) {
            translateY.set(open ? 0 : closedTranslate);
            setIsOpen(open);
        }
    }, [open, closedTranslate, translateY]);

    useEffect(() => {
        if (open === undefined) onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange, open]);

    const handleDragEnd = () => {
        const nowOpen = !isOpen;
        translateY.set(nowOpen ? 0 : closedTranslate);
        setIsOpen(nowOpen);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            drag="y"
            dragConstraints={{ top: 0, bottom: closedTranslate }}
            dragControls={controls}
            style={{ height: `${defaultHeight}px` }}
            onDragEnd={handleDragEnd}
            className="fixed left-0 right-0 bottom-16 z-40 flex flex-col justify-center bg-neutral-lightest rounded-t-2xl w-full shadow-2xl py-2"
            initial={{ y: defaultOpen ? 0 : closedTranslate }}
        >
            <div
                className="flex justify-center w-full"
                style={{ touchAction: "none" }}
                onPointerDown={event => controls.start(event)}
            >
                <div className="w-12 h-1.5 rounded-full bg-primary/50" />
            </div>
            <div className="w-full p-1 border-b border-primary/20" />
            <div className="h-full overflow-y-scroll p-2">{children}</div>
        </motion.div>
    );
}
