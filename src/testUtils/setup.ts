import "@testing-library/jest-dom";
import { server } from "@/mocks/server";

// AnimatePresence holds children in the DOM until exit animations complete.
// jsdom never runs CSS animations, so stub it to remove children immediately.
vi.mock("framer-motion", async (importOriginal) => {
    const actual = await importOriginal<typeof import("framer-motion")>();
    return {
        ...actual,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
