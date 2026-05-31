import { PostHog } from "posthog-node";

const token = process.env.VITE_PUBLIC_POSTHOG_TOKEN;
const host = process.env.VITE_PUBLIC_POSTHOG_HOST;

function makeClient() {
    if (!token) return null;
    return new PostHog(token, { host, flushAt: 1, flushInterval: 0 });
}

export async function captureServerEvent(event, properties = {}) {
    const client = makeClient();
    if (!client) return;
    await client.captureImmediate({ distinctId: "server", event, properties });
}

export async function captureServerException(error, properties = {}) {
    const client = makeClient();
    if (!client) return;
    await client.captureExceptionImmediate(error, "server", properties);
}
