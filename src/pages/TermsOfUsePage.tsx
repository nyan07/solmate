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

export function TermsOfUsePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const tRaw = t as unknown as (key: string, opts: object) => unknown;
    const arr = (key: string): readonly string[] =>
        tRaw(key, { returnObjects: true }) as readonly string[];

    const tu = "termsOfUse";

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
                            {t("termsOfUse.title")}
                        </h1>
                        <p className="text-xs text-primary-500">{t("termsOfUse.lastUpdated")}</p>
                    </div>

                    <Section title={t("termsOfUse.section1.title")}>
                        {t("termsOfUse.section1.body")}
                    </Section>

                    <Section title={t("termsOfUse.section2.title")}>
                        {t("termsOfUse.section2.body1")}
                        <br />
                        <br />
                        {t("termsOfUse.section2.body2")}
                    </Section>

                    <Section title={t("termsOfUse.section3.title")}>
                        {t("termsOfUse.section3.intro")}
                        <BulletList items={arr(`${tu}.section3.items`)} />
                    </Section>

                    <Section title={t("termsOfUse.section4.title")}>
                        {t("termsOfUse.section4.intro")}
                        <BulletList items={arr(`${tu}.section4.items`)} />
                        <p className="mt-2">{t("termsOfUse.section4.body1")}</p>
                        <p className="mt-1">{t("termsOfUse.section4.body2")}</p>
                    </Section>

                    <Section title={t("termsOfUse.section5.title")}>
                        {t("termsOfUse.section5.intro")}
                        <BulletList items={arr(`${tu}.section5.items`)} />
                        <p className="mt-2">{t("termsOfUse.section5.outro")}</p>
                    </Section>

                    <Section title={t("termsOfUse.section6.title")}>
                        {t("termsOfUse.section6.body1")}
                        <br />
                        <br />
                        {t("termsOfUse.section6.body2")}
                    </Section>

                    <Section title={t("termsOfUse.section7.title")}>
                        {t("termsOfUse.section7.intro")}
                        <BulletList items={arr(`${tu}.section7.items`)} />
                        <p className="mt-2">{t("termsOfUse.section7.outro")}</p>
                    </Section>

                    <Section title={t("termsOfUse.section8.title")}>
                        {t("termsOfUse.section8.body1")}
                        <br />
                        <br />
                        {t("termsOfUse.section8.body2")}
                    </Section>

                    <Section title={t("termsOfUse.section9.title")}>
                        {t("termsOfUse.section9.body1")}
                        <br />
                        <br />
                        {t("termsOfUse.section9.body2")}
                    </Section>

                    <Section title={t("termsOfUse.section10.title")}>
                        {t("termsOfUse.section10.body")}
                    </Section>

                    <Section title={t("termsOfUse.section11.title")}>
                        {t("termsOfUse.section11.intro")}
                        <BulletList items={arr(`${tu}.section11.items`)} />
                        <p className="mt-2">{t("termsOfUse.section11.outro")}</p>
                    </Section>

                    <Section title={t("termsOfUse.section12.title")}>
                        {t("termsOfUse.section12.intro")}
                        <BulletList items={arr(`${tu}.section12.items`)} />
                        <p className="mt-2">{t("termsOfUse.section12.outro")}</p>
                    </Section>

                    <Section title={t("termsOfUse.section13.title")}>
                        {t("termsOfUse.section13.body1")}
                        <br />
                        <br />
                        {t("termsOfUse.section13.body2")}
                    </Section>

                    <Section title={t("termsOfUse.section14.title")}>
                        {t("termsOfUse.section14.body")}
                    </Section>

                    <Section title={t("termsOfUse.section15.title")}>
                        {t("termsOfUse.section15.body")}
                    </Section>

                    <Section title={t("termsOfUse.section16.title")}>
                        {t("termsOfUse.section16.contactNote")}{" "}
                        <a
                            href="mailto:contact@arkie.app"
                            className="underline hover:text-primary-700"
                        >
                            contact@arkie.app
                        </a>
                        .
                    </Section>
                </div>
            </div>
        </div>
    );
}
