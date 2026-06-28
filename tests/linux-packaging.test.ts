import { readFileSync } from "fs";
import { join } from "path";
import { load } from "js-yaml";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");

type BuilderConfig = {
  productName?: string;
  linux?: {
    executableName?: string;
    desktop?: {
      entry?: {
        Name?: string;
        StartupWMClass?: string;
      };
    };
  };
};

const builderConfig = load(
  readFileSync(join(ROOT, "electron-builder.yml"), "utf-8"),
) as BuilderConfig;
const linuxAfterInstall = readFileSync(
  join(ROOT, "build/linux-after-install.sh"),
  "utf-8",
);

describe("Linux packaging", () => {
  // @lat: [[desktop-updates#Linux Packaging Names]]
  it("keeps installed paths free of spaces while preserving the desktop display name", () => {
    expect(builderConfig.productName).toBe("HermesOne");
    expect(builderConfig.productName).not.toMatch(/\s/);
    expect(linuxAfterInstall).toContain("/opt/HermesOne/chrome-sandbox");
    expect(linuxAfterInstall).not.toContain("/opt/Hermes One");

    expect(builderConfig.linux?.executableName).toBe("hermes-desktop");
    expect(builderConfig.linux?.executableName).not.toMatch(/\s/);
    expect(builderConfig.linux?.desktop?.entry?.Name).toBe("Hermes One");
    expect(builderConfig.linux?.desktop?.entry?.StartupWMClass).toBe(
      "HermesOne",
    );
  });
});
