import { motion, AnimatePresence } from "framer-motion";
import { BsX } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import Button from "@/components/Button";
import { useInstallPrompt } from "@/features/explorer/hooks/useInstallPrompt";

function Step({ number, text }: { number: number; text: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                {number}
            </span>
            <span className="text-sm text-neutral-700 leading-snug pt-0.5">{text}</span>
        </div>
    );
}

export function InstallPromptModal() {
    const { show, platform, dismiss, confirmAdded } = useInstallPrompt();
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        key="backdrop"
                        data-testid="install-prompt-backdrop"
                        className="fixed inset-0 z-50 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={dismiss}
                    />

                    <motion.div
                        key="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="install-prompt-title"
                        className="fixed z-50 bottom-0 left-0 right-0 mx-auto max-w-sm bg-white rounded-t-2xl px-6 pt-6 pb-8 shadow-xl"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                    >
                        <button
                            onClick={dismiss}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1"
                            aria-label={t("installPrompt.close")}
                        >
                            <BsX size={22} />
                        </button>

                        <div className="flex flex-col gap-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                                    {t("installPrompt.eyebrow")}
                                </p>
                                <h2
                                    id="install-prompt-title"
                                    className="text-lg font-semibold text-neutral-900"
                                >
                                    {t("installPrompt.title")}
                                </h2>
                            </div>

                            {platform === "ios-other" && (
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {t("installPrompt.iosOther.body")}
                                </p>
                            )}
                            {platform === "ios-safari" && (
                                <div className="flex flex-col gap-3">
                                    <Step number={1} text={t("installPrompt.ios-safari.step1")} />
                                    <Step number={2} text={t("installPrompt.ios-safari.step2")} />
                                    <Step number={3} text={t("installPrompt.ios-safari.step3")} />
                                </div>
                            )}
                            {platform === "android" && (
                                <div className="flex flex-col gap-3">
                                    <Step number={1} text={t("installPrompt.android.step1")} />
                                    <Step number={2} text={t("installPrompt.android.step2")} />
                                    <Step number={3} text={t("installPrompt.android.step3")} />
                                </div>
                            )}
                            <div className="flex flex-col gap-2 pt-1">
                                {(platform === "ios-safari" || platform === "android") && (
                                    <Button onClick={confirmAdded}>
                                        {t("installPrompt.added")}
                                    </Button>
                                )}
                                <button
                                    onClick={dismiss}
                                    className="text-sm text-neutral-400 py-2 text-center hover:text-neutral-600 transition-colors"
                                >
                                    {t("installPrompt.dismiss")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
