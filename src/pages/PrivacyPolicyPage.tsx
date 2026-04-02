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

export function PrivacyPolicyPage() {
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
                        <h1 className="font-bold text-primary-900 text-2xl">Privacy Policy</h1>
                        <p className="text-xs text-primary-500">Last updated: April 2, 2026</p>
                    </div>

                    <Section title="1. Introduction">
                        This Privacy Policy explains how Arkie ("we", "us", "our") collects, uses,
                        and protects your personal data when you use our browser-based service that
                        helps you identify cafés and restaurants with sunny outdoor seating
                        ("Service"). We comply with applicable data protection laws, including the
                        EU General Data Protection Regulation (GDPR).
                        <br />
                        <br />
                        By accessing or using the Service, you agree to this Privacy Policy.
                    </Section>

                    <Section title="2. Data Controller">
                        Lena Eisenbeis
                        <br />
                        Lastropsweg 7
                        <br />
                        20255 Hamburg
                        <br />
                        Email:{" "}
                        <a
                            href="mailto:contact@arkie.app"
                            className="underline hover:text-primary-700"
                        >
                            contact@arkie.app
                        </a>
                    </Section>

                    <Section title="3. Data We Collect">
                        We collect only the data necessary to operate the service and provide
                        personalized functionality.
                        <BulletList
                            items={[
                                "Account data: Email address, hashed password (managed by our authentication provider). If you sign in via Google or Apple, we receive your email address, display name, and profile picture URL from the respective provider.",
                                "Technical data: browser type, operating system, screen size, language settings, IP address, timestamps, pages viewed, and error logs.",
                                "Location data: approximate or precise location if you grant permission in your browser, only used to provide the service functionality.",
                                "Cookies and similar technologies: used for authentication, session management, and analytics.",
                                "Map or weather providers: sunlight and location data used to determine sunny places (no personal data is received from these providers).",
                            ]}
                        />
                    </Section>

                    <Section title="4. Purpose and Legal Basis of Processing">
                        We process your data for the following purposes:
                        <BulletList
                            items={[
                                "Providing the Service: showing cafés and restaurants with sunny seating based on your location (Art. 6(1)(b) GDPR).",
                                "Account management: enabling login, authentication, and security (Art. 6(1)(b)).",
                                "Improving the Service: analyzing usage patterns to optimize features (Art. 6(1)(f)).",
                                "Security and fraud prevention: protecting accounts and preventing misuse (Art. 6(1)(f)).",
                                "Optional communications: sending updates or feature announcements if you opt in (Art. 6(1)(a)).",
                            ]}
                        />
                        <p className="mt-2">
                            You may withdraw consent at any time by contacting us via email or
                            changing the settings in your user profile.
                        </p>
                    </Section>

                    <Section title="5. Data Sharing & Transfers">
                        All core data (account information) is stored on EU-based servers. We do not
                        transfer personal data outside the European Economic Area, except where
                        third-party providers may process data in accordance with their own privacy
                        policies and appropriate safeguards (Standard Contractual Clauses).
                        <br />
                        <br />
                        We share your data only when necessary to operate the Service:
                        <BulletList
                            items={[
                                "Hosting providers: to store and process data securely.",
                                "Analytics services: to understand how the Service is used (data is anonymized or pseudonymized where possible).",
                                "Weather and map providers: to retrieve sunlight and location-based information (your personal data is not shared with them unless technically required, and only with your consent).",
                                "Legal authorities: if required by law.",
                            ]}
                        />
                    </Section>

                    <Section title="6. Data Retention">
                        We retain personal data only as long as necessary:
                        <BulletList
                            items={[
                                "Account data: stored until you delete your account.",
                                "Location data: processed in real time and not stored unless required for analytics (in anonymized form).",
                                "Log files: retained for security and debugging for a limited period (e.g., 30–90 days).",
                                "Cookies: stored according to their expiration settings.",
                            ]}
                        />
                        <p className="mt-2">
                            When data is no longer needed, it is deleted or anonymized.
                        </p>
                    </Section>

                    <Section title="7. Your Rights under GDPR">
                        You have the right to:
                        <BulletList
                            items={[
                                "Access your personal data",
                                "Correct inaccurate data",
                                "Request deletion of your data",
                                "Restrict processing",
                                "Receive your data in a portable format",
                                "Object to processing based on legitimate interests",
                                "Withdraw consent",
                                "File a complaint with your local data protection authority",
                            ]}
                        />
                        <p className="mt-2">
                            To exercise your rights, contact us at{" "}
                            <a
                                href="mailto:contact@arkie.app"
                                className="underline hover:text-primary-700"
                            >
                                contact@arkie.app
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="8. Children's Privacy">
                        Arkie is not intended for children under 16. We do not knowingly collect
                        data from children. If you believe a child has provided personal data,
                        contact us so we can delete it.
                    </Section>

                    <Section title="9. Security Measures">
                        We implement appropriate technical and organizational measures, including:
                        <BulletList
                            items={[
                                "Password hashing",
                                "Encrypted data transmission (HTTPS)",
                                "Access controls",
                                "Regular security reviews",
                            ]}
                        />
                    </Section>

                    <Section title="10. Third-Party Services">
                        Arkie may link to or integrate with third-party services such as map
                        providers or weather APIs. Their privacy practices are governed by their own
                        policies. We are not responsible for their content or data handling.
                    </Section>

                    <Section title="11. Changes to This Privacy Policy">
                        We may update this Privacy Policy when needed. Updates will be posted on
                        this page with a revised "Last updated" date. Continued use of the Service
                        constitutes acceptance of the updated policy.
                    </Section>
                </div>
            </div>
        </div>
    );
}
