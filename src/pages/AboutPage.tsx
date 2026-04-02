import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsWhatsapp } from "react-icons/bs";
import Button from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-primary-900 text-xl">{title}</h2>
            <div className="text-sm text-primary-900 leading-relaxed">{children}</div>
        </div>
    );
}

export function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="fixed rounded-xl inset-2 bg-white overflow-hidden flex flex-col">
            <div className="flex items-center p-4 shrink-0">
                <button
                    onClick={() => navigate("/places")}
                    className="text-primary-900 hover:text-primary-700 p-1 rounded-full hover:bg-primary-100 transition-colors"
                >
                    <BsArrowLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-8 p-6 pt-2 max-w-lg mx-auto w-full">
                    <Section title="About">
                        Life in the north means sunshine is a rare luxury — and when it shows up,
                        you don't want to miss it. If only you knew where to go for that after-work
                        drink or Sunday brunch without tall buildings stealing the light.
                        <br />
                        <br />
                        In 2025, Lena and Dani decided to join forces to end the pain. Arkie
                        combines information about cafés and bars with map and sunlight data, all on
                        one interactive map. So stop guessing — and start soaking up that Vitamin D!
                    </Section>

                    <Section title="How Arkie works">
                        To explore places, simply zoom in using two fingers. We recommend enabling
                        your GPS location (you'll be prompted the first time you open Arkie) so you
                        can discover spots right around you. By default, Arkie highlights sunny
                        places based on your current date and time — but you can easily plan ahead
                        by adjusting both.
                    </Section>

                    <Section title="Share your feedback">
                        <p>We want the sun to always shine on you!</p>
                        <p className="mt-1">
                            Help us improve Arkie by sharing your feedback with us. Join our
                            WhatsApp community to get in touch with the Arkie team.
                        </p>
                    </Section>

                    <Button
                        href="https://chat.whatsapp.com/Dn9NswB1FRr1ivRsiwfyJs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        <BsWhatsapp className="w-4 h-4" />
                        Join Arkie's community
                    </Button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
