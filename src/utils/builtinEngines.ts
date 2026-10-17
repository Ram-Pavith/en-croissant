import type { Platform } from "@tauri-apps/plugin-os";
import type { GoMode } from "@/bindings";
import type { LocalEngine } from "./engines";

/**
 * Catalog entry for an engine that can be installed from the "Download" tab.
 *
 * Mirrors the remote catalog shape (a LocalEngine without its `id`, which is
 * only assigned on install) and adds the fields needed to install engines
 * composed of several files.
 */
export type CatalogEngine = Omit<LocalEngine, "id"> & {
    /** Extra files downloaded into the engines directory alongside the main one. */
    extraDownloads?: string[];
    /** Subdirectory of the engines directory where the main archive is extracted. */
    downloadDir?: string;
    /** UCI options applied on install. `{{ENGINES_DIR}}` is replaced with the engines directory. */
    presetSettings?: { name: string; value: string }[];
    /** Default search limit applied on install. */
    presetGo?: GoMode;
};

const MAIA3_BASE =
    "https://raw.githubusercontent.com/franciscoBSalgueiro/en-croissant/master/maia3-uci";

/** Maia 3 model presets: (launcher script, checkpoint size in bytes). */
const MAIA3_MODELS: { preset: string; label: string; weights: number }[] = [
    { preset: "maia3-5m", label: "5M", weights: 20968049 },
    { preset: "maia3-23m", label: "23M", weights: 91799307 },
    { preset: "maia3-79m", label: "79M", weights: 315651851 },
];

/**
 * Engines that ship with the app because they are not available in the remote
 * catalog.
 *
 * Maia 3 (https://github.com/CSSLab/maia3) is a human-like model conditioned
 * on rating. It is a Python package with no native build, so each entry
 * installs two small scripts: a per-model wrapper and the shared `maia3`
 * launcher, which on first use creates a Python environment from a pinned
 * snapshot of the package, pre-caches the weights and then runs the package's
 * own UCI entry point. The static UCI banner it prints while setting up keeps
 * engine configuration instant. POSIX shell only, so macOS and Linux.
 */
export function getBuiltinEngines(os: Platform): CatalogEngine[] {
    if (os !== "macos" && os !== "linux") {
        return [];
    }
    return MAIA3_MODELS.map(({ preset, label, weights }) => ({
        type: "local" as const,
        name: `Maia 3 (${label})`,
        version: "3",
        elo: 1500,
        downloadLink: `${MAIA3_BASE}/${preset}`,
        path: preset,
        downloadSize: weights,
        extraDownloads: [`${MAIA3_BASE}/maia3`],
        // the rating the model imitates; adjustable later in the engine settings
        presetSettings: [{ name: "Elo", value: "1500" }],
    }));
}
