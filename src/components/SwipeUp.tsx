import React, { useEffect, useState } from "react";
import { motion, useDragControls, useMotionValue, useSpring } from "framer-motion";

type SwipeUpProps = {
    children: React.ReactNode;
    openHeight?: number;
    threshold?: number;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    /** Optional snap points (0 to 1 fraction of viewport). Example: [0.3, 0.6, 1] */
    snapPoints?: number[];
    /** Controlled mode: pass open state externally */
    open?: boolean;
    /** Called when user finishes swipe to snap to a point */
    onSnap?: (snapIndex: number) => void;
};

export default function SwipeUp({
    children,
    openHeight = 0.6,
    defaultOpen = true,
    onOpenChange,
    open,
}: SwipeUpProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const translateY = useMotionValue(0);
    //const springY = useSpring(translateY, { stiffness: 400, damping: 40 });
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const defaultHeight = Math.round(vh * openHeight);
    const closedTranslate = defaultHeight + 20;
    const controls = useDragControls()

    // Sync controlled mode
    useEffect(() => {
        if (open !== undefined) {
            const t = open ? 0 : closedTranslate;
            translateY.set(t);
            setIsOpen(open);
        }
    }, [open, closedTranslate, translateY]);

    useEffect(() => {
        if (open === undefined) onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange, open]);

    const handleDragEnd = () => {
        let target = 0;
        let newOpen = true;

        if (open) {
            target = closedTranslate;
            newOpen = false;
        } else {
            target = 0;
            newOpen = true;
        }

        translateY.set(target);
        setIsOpen(newOpen);
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            drag="y"
            dragConstraints={{ top: 0, bottom: closedTranslate }}
            dragControls={controls}
            style={{ touchAction: "none" }}
            onDragEnd={handleDragEnd}
            className={`fixed left-0 right-0 bottom-0 z-40 flex justify-center`}
            initial={{ y: defaultOpen ? 0 : closedTranslate }}
        >
            <div
                className="w-full rounded-t-2xl shadow-2xl py-6 bg-neutral-lightest"
                style={{
                    maxHeight: `${defaultHeight}px`,
                    overflow: "hidden auto",
                    boxSizing: "border-box",
                }}
            >
                <div className="flex justify-center mb-3">
                    <div className="w-12 h-1.5 rounded-full bg-primary/50" style={{ touchAction: "none" }} onPointerDown={event => controls.start(event)} />
                </div>
                <div className="h-full overflow-auto">{children}</div>
            </div>
        </motion.div >
    );
}
