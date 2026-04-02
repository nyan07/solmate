import { BsArrowLeft, BsWhatsapp } from "react-icons/bs";
import Button from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { useTranslation } from "react-i18next";
import { useLangNavigate } from "@/hooks/useLangNavigate";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-primary-900 text-xl">{title}</h2>
            <div className="text-sm text-primary-900 leading-relaxed">{children}</div>
        </div>
    );
}

export function AboutPage() {
    const navigate = useLangNavigate();
    const { t } = useTranslation();

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
                    <Section title={t("about.sections.about.title")}>
                        {t("about.sections.about.body1")}
                        <br />
                        <br />
                        {t("about.sections.about.body2")}
                    </Section>

                    <Section title={t("about.sections.howItWorks.title")}>
                        {t("about.sections.howItWorks.body")}
                    </Section>

                    <Section title={t("about.sections.feedback.title")}>
                        <p>{t("about.sections.feedback.body1")}</p>
                        <p className="mt-1">{t("about.sections.feedback.body2")}</p>
                    </Section>

                    <Button
                        href="https://chat.whatsapp.com/Dn9NswB1FRr1ivRsiwfyJs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        <BsWhatsapp className="w-4 h-4" />
                        {t("about.communityCta")}
                    </Button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
