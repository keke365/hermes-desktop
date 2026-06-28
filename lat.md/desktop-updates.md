# Desktop Updates

Desktop updates use GitHub releases and expose both a startup upgrade action and a Settings auto-upgrade preference.

The Electron main process configures `electron-updater` against the repository publisher metadata from `electron-builder.yml`, which points at `fathah/hermes-desktop`. [[src/main/app/updater.ts#setupUpdater]] registers update IPC handlers, persists the auto-upgrade preference under Electron `userData`, and applies that preference to `autoUpdater.autoDownload`.

When GitHub reports a newer release, [[src/renderer/src/screens/Layout/Layout.tsx#Layout]] shows an upgrade button in the sidebar footer as soon as the app reaches the main layout. The button downloads the update when needed, shows download progress, and changes into a restart action after the update is ready.

[[src/renderer/src/components/settings/AboutPane.tsx#AboutPane]] (the About & Updates pane of the settings modal) presents the desktop app as its own card, separate from the Hermes Agent engine card — the two update on independent channels. The card shows the app version, the auto-upgrade toggle, and an explicit update action: [[src/renderer/src/components/settings/useSettingsData.ts#useSettingsData]] subscribes to the same `onUpdateAvailable`/`onUpdateDownloadProgress`/`onUpdateDownloaded`/`onUpdateError` events as the footer button and adds a manual `checkDesktopUpdate` (via `checkForUpdates`) plus a `handleDesktopUpdate` that downloads, then restarts via `installUpdate`. When auto-upgrade is enabled the startup release check downloads automatically; when disabled, downloading waits for the user's click (footer button or this card's action).

## Linux Packaging Names

Linux package metadata keeps install paths shell-safe while preserving the visible Hermes One brand.

Electron Builder installs `.deb` and `.rpm` payloads under `/opt/${productName}`, so `electron-builder.yml` uses the path-safe `productName: HermesOne` and `linux.executableName: hermes-desktop`. The Linux desktop entry keeps `Name: Hermes One` for Ubuntu menus and `StartupWMClass: HermesOne` for window matching without putting a space in the install path. `build/linux-after-install.sh` must use the same `/opt/HermesOne/chrome-sandbox` path when setting the Electron sandbox helper SUID bit.

## Ubuntu Deb Workflow

The Ubuntu deb workflow gives maintainers a fast artifact-only build for Debian-family Linux testing.

`.github/workflows/build-ubuntu-deb.yml` runs on manual dispatch, relevant pushes to `main`, and published GitHub Releases. It installs Node 22 dependencies, rebuilds native Electron modules for x64, runs the normal app build, and packages only `--linux deb --x64`. Manual and push runs upload `dist/*.deb` as the `ubuntu-deb-x64` artifact; release-triggered runs also upload the `.deb` directly to the matching GitHub Release assets with `gh release upload`.
