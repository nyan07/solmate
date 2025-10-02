/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_GOOGLE_MAPS_MAP_ID: string;
    readonly VITE_CESIUM_ION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
