import { useEffect } from "react";
import { Paragraph } from "@/components/Paragraph";

export function WaitlistPage() {
    useEffect(() => {
        const w = "https://tally.so/widgets/embed.js";
        if (document.querySelector(`script[src="${w}"]`)) return;
        const s = document.createElement("script");
        s.src = w;
        s.crossOrigin = "anonymous"; // required if an integrity hash is later pinned
        s.onload = () => window.Tally?.loadEmbeds();
        s.onerror = () =>
            document
                .querySelectorAll<HTMLIFrameElement>("iframe[data-tally-src]:not([src])")
                .forEach((e) => (e.src = e.dataset.tallySrc!));
        document.body.appendChild(s);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="flex flex-col lg:max-w-1/2 items-center justify-center gap-4 text-center">
                <h1>
                    <img src="/arkie.png" alt="Arkie" className="mx-12 my-2 max-h-24" />
                </h1>
                <h2 className="text-2xl lg:text-3xl">Coming soon.</h2>
                <Paragraph>Sign up for our waitlist & be among the first to join.</Paragraph>
                <iframe
                    data-tally-src="https://tally.so/embed/WONZjP?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                    loading="lazy"
                    width="100%"
                    height="216"
                    title="Feedback form"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation"
                />
            </div>
        </div>
    );
}
