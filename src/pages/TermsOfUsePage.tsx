import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-primary-900 text-xl">{title}</h2>
            <div className="text-sm text-primary-900 leading-relaxed">{children}</div>
        </div>
    );
}

function BulletList({ items }: { items: string[] }) {
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
                        <h1 className="font-bold text-primary-900 text-2xl">Terms of Use</h1>
                        <p className="text-xs text-primary-500">Last updated: April 2, 2026</p>
                    </div>

                    <Section title="1. Acceptance of Terms">
                        By accessing or using Arkie.app ("Service"), you agree to be bound by these
                        Terms of Use ("Terms"). If you do not agree, you may not use the Service.
                    </Section>

                    <Section title="2. Description of the Service">
                        The Service is a browser-based platform that helps users identify cafés and
                        restaurants ("Places") with sunny outdoor seating based on real-time or
                        forecasted sunlight conditions. Users may optionally create an account using
                        an email address and password.
                        <br />
                        <br />
                        The Service is provided for informational purposes only. We do not guarantee
                        the accuracy of sunlight conditions, weather data, or business information.
                    </Section>

                    <Section title="3. Eligibility">
                        To use the Service, you must:
                        <BulletList
                            items={[
                                "Be at least 16 years old, or the minimum age required in your country.",
                                "Have the legal capacity to enter into a binding agreement.",
                                "Provide accurate and complete information when creating an account.",
                            ]}
                        />
                    </Section>

                    <Section title="4. User Accounts">
                        When creating an account, you agree to:
                        <BulletList
                            items={[
                                "Provide a valid email address and secure password.",
                                "Keep your login credentials confidential.",
                                "Notify us immediately if you suspect unauthorized access.",
                            ]}
                        />
                        <p className="mt-2">
                            You are responsible for all activity under your account.
                        </p>
                        <p className="mt-1">
                            We may suspend or terminate accounts that violate these Terms or pose
                            security risks.
                        </p>
                    </Section>

                    <Section title="5. Permitted Use">
                        You may use the Service only for lawful purposes and in accordance with
                        these Terms. You agree not to:
                        <BulletList
                            items={[
                                "Access or use the Service in a way that violates any law or regulation.",
                                "Attempt to reverse engineer, decompile, or modify the Service.",
                                "Interfere with the Service's operation or security.",
                                "Use automated tools (bots, scrapers) without permission.",
                                "Upload harmful, offensive, or unlawful content.",
                            ]}
                        />
                        <p className="mt-2">
                            We reserve the right to restrict or block access for misuse.
                        </p>
                    </Section>

                    <Section title="6. Location Data">
                        The Service may request access to your device's location to show nearby
                        places. Granting access is optional, but certain features may not function
                        without it.
                        <br />
                        <br />
                        You can disable location access at any time through your browser settings.
                    </Section>

                    <Section title="7. Third-Party Services">
                        The Service may integrate with third-party providers such as:
                        <BulletList
                            items={[
                                "Map services",
                                "Weather and sunlight data providers",
                                "Analytics tools",
                            ]}
                        />
                        <p className="mt-2">
                            We are not responsible for the content, accuracy, or policies of
                            third-party services.
                        </p>
                    </Section>

                    <Section title="8. Intellectual Property">
                        All content, features, and functionality of the Service — including design,
                        text, graphics, logos, and software — are owned by us or our licensors and
                        are protected by intellectual property laws.
                        <br />
                        <br />
                        You receive a limited, non-exclusive, non-transferable license to use the
                        Service for personal, non-commercial purposes.
                    </Section>

                    <Section title="9. User-Generated Content">
                        If the Service allows users to submit content (e.g., reviews, comments), you
                        grant us a non-exclusive, worldwide, royalty-free license to use, display,
                        and distribute that content as needed to operate the Service.
                        <br />
                        <br />
                        We may remove content that violates these Terms or applicable laws.
                    </Section>

                    <Section title="10. Availability and Changes">
                        We may modify, suspend, or discontinue parts of the Service at any time
                        without notice. We are not liable for any unavailability or interruptions.
                    </Section>

                    <Section title="11. Disclaimers">
                        The Service is provided "as is" and "as available" without warranties of any
                        kind. We do not guarantee:
                        <BulletList
                            items={[
                                "Accuracy of sunlight or weather data",
                                "Accuracy of places information",
                                "Continuous or error-free operation",
                            ]}
                        />
                        <p className="mt-2">Use of the Service is at your own risk.</p>
                    </Section>

                    <Section title="12. Limitation of Liability">
                        To the maximum extent permitted by law, we are not liable for:
                        <BulletList
                            items={[
                                "Indirect, incidental, or consequential damages",
                                "Loss of data, profits, or business",
                                "Errors or inaccuracies in third-party data",
                                "Issues caused by user misuse or unauthorized access",
                            ]}
                        />
                        <p className="mt-2">
                            Our total liability is limited to the amount you paid for the Service
                            (if any).
                        </p>
                    </Section>

                    <Section title="13. Termination">
                        We may suspend or terminate your access to the Service at any time if you
                        violate these Terms or if necessary for security or legal reasons.
                        <br />
                        <br />
                        You may delete your account at any time.
                    </Section>

                    <Section title="14. Changes to These Terms">
                        We may update these Terms if needed. Changes will be posted on this page
                        with a revised "Last updated" date. Continued use of the Service constitutes
                        acceptance of the updated Terms.
                    </Section>

                    <Section title="15. Governing Law">
                        These Terms are governed by the laws of Germany, without regard to
                        conflict-of-law principles. Any disputes shall be resolved in the courts of
                        Hamburg, Germany.
                    </Section>

                    <Section title="16. Contact">
                        If you have questions, reach us at{" "}
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
