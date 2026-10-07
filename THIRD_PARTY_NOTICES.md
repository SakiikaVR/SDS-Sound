# Third-party notices

SDS-Sound source code is MIT licensed. The original Super Duper Core copyright remains in [LICENSE](LICENSE). Dependencies and media retain their own licenses.

| Component | License and source | Distribution |
| --- | --- | --- |
| Super Duper Core | [MIT](LICENSE), © 2026 Super Duper Software | Source fork and installer |
| Archivo font | [SIL OFL 1.1](third_party/fonts/Archivo-OFL.txt), © 2020 Archivo Project Authors | Bundled WOFF2 font |
| IBM Plex Mono font | [SIL OFL 1.1](third_party/fonts/IBM-Plex-OFL.txt), © 2017 IBM Corp., Reserved Font Name “Plex” | Bundled WOFF2 font |
| FFmpeg Windows executable (gyan.dev essentials 6.1.1) | [GPL v3](third_party/ffmpeg/GPL-3.0.txt); [build information and source revision](third_party/ffmpeg/BUILD-INFO.txt); [matching FFmpeg source archive](https://github.com/SakiikaVR/SDS-Sound/releases/download/v0.1.2/FFmpeg-e38092ef93-source.tar.gz) | Separate executable bundled for audio rendering; FFmpeg remains GPL licensed |
| better-sqlite3 12.11.1 | [MIT](third_party/better-sqlite3/LICENSE), © 2017 Joshua Wise | Official Windows x64 Electron ABI 128 binary, [release asset](https://github.com/WiseLibs/better-sqlite3/releases/download/v12.11.1/better-sqlite3-v12.11.1-electron-v128-win32-x64.tar.gz), archive SHA-256 `16a24999947f0f94b51afe628bea09e11ca0892ad2a4472629dfd5e2fbd3e386` |
| Electron and Chromium | Their license files are included with the installed application as `LICENSE.electron.txt` and `LICENSES.chromium.html`. | Application runtime |

The FFmpeg source revision is `e38092ef93` at [FFmpeg's source repository](https://github.com/FFmpeg/FFmpeg/commit/e38092ef93). The source archive linked above is hosted beside the installer; its SHA-256 is `7578feb5284b22e6172c6f4020ddc43d746eb3ca44363756d1b47a96fd2d68f5`. The bundled binary's [build information](third_party/ffmpeg/BUILD-INFO.txt) lists its configure options and external libraries. FFmpeg's GPL applies to that executable, not as a replacement for the MIT license of SDS-Sound's own source.

Freesound audio files are **not** bundled with SDS-Sound. Each downloaded file has its own Creative Commons license and attribution requirements. See its Freesound sound page before reuse.
