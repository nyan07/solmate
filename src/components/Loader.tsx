/**
 * Full-page loader featuring an animated version of the Arkie asterisk.
 * Combines a continuous rotation with a breathe-in/out scale pulse.
 * Uses SVG-native animateTransform — no CSS keyframes needed.
 */
export function Loader({ inline = false }: { inline?: boolean }) {
    return (
        <div
            className={
                inline
                    ? "flex items-center justify-center py-16"
                    : "fixed inset-0 z-50 flex items-center justify-center bg-primary-100"
            }
        >
            <svg
                width="72"
                height="72"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Loading"
                role="img"
            >
                {/* Outer <g>: continuous rotation around centre */}
                <g>
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="3s"
                        repeatCount="indefinite"
                    />

                    {/* Inner <g>: scale pulse anchored at centre */}
                    <g transform="translate(50 50)">
                        <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="1; 0.65; 1"
                            keyTimes="0; 0.5; 1"
                            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                            calcMode="spline"
                            dur="2s"
                            repeatCount="indefinite"
                            additive="sum"
                        />

                        {/*
                         * Six arms radiating from (0,0) — translate(50 50) handles
                         * the centering so scale collapses toward the true centre.
                         *
                         * Lengths alternate 31/27 px for the hand-drawn feel.
                         *   x2 = L · sin(θ)   y2 = −L · cos(θ)   (0° = top, CW)
                         */}
                        <g
                            stroke="#ff5a59"
                            strokeLinecap="round"
                            strokeWidth="7.5"
                            transform="translate(-50 -50)"
                        >
                            {/* 0°  top          L=31 */}
                            <line x1="50" y1="50" x2="50" y2="19" />
                            {/* 60° upper-right  L=27 */}
                            <line x1="50" y1="50" x2="73.38" y2="36.5" />
                            {/* 120° lower-right L=31 */}
                            <line x1="50" y1="50" x2="76.86" y2="65.5" />
                            {/* 180° bottom      L=27 */}
                            <line x1="50" y1="50" x2="50" y2="77" />
                            {/* 240° lower-left  L=31 */}
                            <line x1="50" y1="50" x2="23.14" y2="65.5" />
                            {/* 300° upper-left  L=27 */}
                            <line x1="50" y1="50" x2="26.62" y2="36.5" />
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
}
