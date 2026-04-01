import { useEffect } from "react";

export default function LandingPage() {
    useEffect(() => {
        const w = "https://tally.so/widgets/embed.js";
        if (document.querySelector(`script[src="${w}"]`)) return;
        const s = document.createElement("script");
        s.src = w;
        s.onload = () => window.Tally?.loadEmbeds();
        s.onerror = () =>
            document
                .querySelectorAll<HTMLIFrameElement>("iframe[data-tally-src]:not([src])")
                .forEach((e) => (e.src = e.dataset.tallySrc!));
        document.body.appendChild(s);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <img src="/arkie.png" alt="Arkie" className="max-h-12 mb-8 absolute top-6" />
            <iframe
                data-tally-src="https://tally.so/embed/WONZjP?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                loading="lazy"
                width="100%"
                height="216"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Feedback form"
            />
        </div>
    );
}
