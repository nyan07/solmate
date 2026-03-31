/** Safely extracts a string from a plain string or a Google Places LocalizedText object `{text, languageCode}`. */
export const getText = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object" && "text" in value) return (value as { text: string }).text;
    return undefined;
};
