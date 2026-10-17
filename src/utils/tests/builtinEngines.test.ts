import { describe, expect, it } from "vitest";
import { getBuiltinEngines } from "../builtinEngines";

describe("getBuiltinEngines", () => {
    it("offers the three Maia 3 models on macOS", () => {
        const engines = getBuiltinEngines("macos");
        expect(engines.map((e) => e.name)).toEqual(["Maia 3 (5M)", "Maia 3 (23M)", "Maia 3 (79M)"]);
        for (const engine of engines) {
            expect(engine.type).toBe("local");
            expect(engine.version).toBe("3");
            expect(engine.downloadLink).toMatch(/maia3-uci\/maia3-(5|23|79)m$/);
            expect(engine.path).toBe(
                engine.downloadLink!.slice(engine.downloadLink!.lastIndexOf("/") + 1),
            );
            expect(engine.extraDownloads).toEqual([expect.stringMatching(/maia3-uci\/maia3$/)]);
            expect(engine.presetSettings).toEqual([{ name: "Elo", value: "1500" }]);
            expect(engine.downloadSize).toBeGreaterThan(0);
        }
    });

    it("sizes the entries by their checkpoint, smallest first", () => {
        const sizes = getBuiltinEngines("macos").map((e) => e.downloadSize!);
        expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    });

    it("offers the same entries on Linux and nothing on Windows (POSIX launcher)", () => {
        expect(getBuiltinEngines("linux").map((e) => e.name)).toEqual(
            getBuiltinEngines("macos").map((e) => e.name),
        );
        expect(getBuiltinEngines("windows")).toEqual([]);
    });
});
