# Third-party notices

SDS-Sound source code is MIT licensed. The original Super Duper Core copyright remains in [LICENSE](LICENSE). Dependencies and media retain their own licenses.

| Component | License and source | Distribution |
| --- | --- | --- |
| Super Duper Core | [MIT](LICENSE), © 2026 Super Duper Software | Source fork and installer |
| Archivo font | [SIL OFL 1.1](third_party/fonts/Archivo-OFL.txt), © 2020 Archivo Project Authors | Bundled WOFF2 font |
| IBM Plex Mono font | [SIL OFL 1.1](third_party/fonts/IBM-Plex-OFL.txt), © 2017 IBM Corp., Reserved Font Name “Plex” | Bundled WOFF2 font |
| FFmpeg Windows executable (gyan.dev essentials 6.1.1) | [GPL v3](third_party/ffmpeg/GPL-3.0.txt); [build information and source revision](third_party/ffmpeg/BUILD-INFO.txt) | Separate executable bundled for audio rendering; FFmpeg remains GPL licensed |
| Electron and Chromium | Their license files are included with the installed application as `LICENSE.electron.txt` and `LICENSES.chromium.html`. | Application runtime |

The FFmpeg source revision is `e38092ef93` at [FFmpeg's source repository](https://github.com/FFmpeg/FFmpeg/commit/e38092ef93). The bundled binary's build information lists its configure options and source provenance. FFmpeg's GPL applies to that executable, not as a replacement for the MIT license of SDS-Sound's own source.

Freesound audio files are **not** bundled with SDS-Sound. Each downloaded file has its own Creative Commons license and attribution requirements. See its Freesound sound page before reuse.
