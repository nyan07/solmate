import React, { useEffect, useState } from "react";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
    title?: string;
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
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const defaultHeight = Math.round(vh * openHeight);
    const closedTranslate = defaultHeight - 74;
    const controls = useDragControls();

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
            style={{ height: `${defaultHeight}px` }}
            onDragEnd={handleDragEnd}
            className={`fixed left-0 right-0 bottom-16 z-40 flex flex-col justify-center bg-neutral-lightest rounded-t-2xl w-full shadow-2xl py-2`}
            initial={{ y: defaultOpen ? 0 : closedTranslate }}
        >
            <div className="flex justify-center w-full" style={{ touchAction: "none" }} onPointerDown={event => controls.start(event)}>
                <div className="w-12 h-1.5 rounded-full bg-primary/50" />
            </div>
            <div className="w-full p-1 border-b border-primary/20 flex gap-2">
                {/* <AdjustmentsHorizontalIcon className="text-primary h-8 w-8 rounded-full p-1 bg-primary/20" />
                <XMarkIcon className="text-primary h-8 w-8 rounded-full p-1 bg-primary/20" onClick={() => navigate('/')} /> */}
            </div>
            <div className="h-full overflow-y-scroll p-2">{children}</div>
        </motion.div >
    );
}
