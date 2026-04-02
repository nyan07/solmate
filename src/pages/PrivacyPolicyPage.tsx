import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-primary-900 text-xl">{title}</h2>
            <div className="text-sm text-primary-900 leading-relaxed">{children}</div>
        </div>
    );
}

function BulletList({ items }: { items: readonly string[] }) {
    return (
        <ul className="list-disc list-outside pl-4 flex flex-col gap-1 mt-1">
            {items.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>
    );
}

export function PrivacyPolicyPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const tRaw = t as unknown as (key: string, opts: object) => unknown;
    const arr = (key: string): readonly string[] =>
        tRaw(key, { returnObjects: true }) as readonly string[];

    return (
        <div className="fixed rounded-xl inset-2 bg-white overflow-hidden flex flex-col">
            <div className="flex items-center p-4 shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary-900 hover:text-primary-700 p-1 rounded-full hover:bg-primary-100 transition-colors"
                >
                    <BsArrowLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-8 p-6 pt-2 max-w-lg mx-auto w-full">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-bold text-primary-900 text-2xl">
                            {t("privacyPolicy.title")}
                        </h1>
                        <p className="text-xs text-primary-500">{t("privacyPolicy.lastUpdated")}</p>
                    </div>

                    <Section title={t("privacyPolicy.section1.title")}>
                        {t("privacyPolicy.section1.body1")}
                        <br />
                        <br />
                        {t("privacyPolicy.section1.body2")}
                    </Section>

                    <Section title={t("privacyPolicy.section2.title")}>
                        Lena Eisenbeis
                        <br />
                        Lastropsweg 7
                        <br />
                        20255 Hamburg
                        <br />
                        {t("privacyPolicy.emailLabel")}{" "}
                        <a
                            href="mailto:contact@arkie.app"
                            className="underline hover:text-primary-700"
                        >
                            contact@arkie.app
                        </a>
                    </Section>

                    <Section title={t("privacyPolicy.section3.title")}>
                        {t("privacyPolicy.section3.intro")}
                        <BulletList items={arr("privacyPolicy.section3.items")} />
                    </Section>

                    <Section title={t("privacyPolicy.section4.title")}>
                        {t("privacyPolicy.section4.intro")}
                        <BulletList items={arr("privacyPolicy.section4.items")} />
                        <p className="mt-2">{t("privacyPolicy.section4.withdrawNote")}</p>
                    </Section>

                    <Section title={t("privacyPolicy.section5.title")}>
                        {t("privacyPolicy.section5.body1")}
                        <br />
                        <br />
                        {t("privacyPolicy.section5.body2")}
                        <BulletList items={arr("privacyPolicy.section5.items")} />
                    </Section>

                    <Section title={t("privacyPolicy.section6.title")}>
                        {t("privacyPolicy.section6.intro")}
                        <BulletList items={arr("privacyPolicy.section6.items")} />
                        <p className="mt-2">{t("privacyPolicy.section6.outro")}</p>
                    </Section>

                    <Section title={t("privacyPolicy.section7.title")}>
                        {t("privacyPolicy.section7.intro")}
                        <BulletList items={arr("privacyPolicy.section7.items")} />
                        <p className="mt-2">
                            {t("privacyPolicy.section7.contactNote")}{" "}
                            <a
                                href="mailto:contact@arkie.app"
                                className="underline hover:text-primary-700"
                            >
                                contact@arkie.app
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title={t("privacyPolicy.section8.title")}>
                        {t("privacyPolicy.section8.body")}
                    </Section>

                    <Section title={t("privacyPolicy.section9.title")}>
                        {t("privacyPolicy.section9.intro")}
                        <BulletList items={arr("privacyPolicy.section9.items")} />
                    </Section>

                    <Section title={t("privacyPolicy.section10.title")}>
                        {t("privacyPolicy.section10.body")}
                    </Section>

                    <Section title={t("privacyPolicy.section11.title")}>
                        {t("privacyPolicy.section11.body")}
                    </Section>
                </div>
            </div>
        </div>
    );
}
