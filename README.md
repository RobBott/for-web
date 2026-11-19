## Community Enhancements & Fixes in This Fork (RobBott/for-web)

This repository is part of the community-enhanced Stoat stack alongside [RobBott/stoatchat](https://github.com/RobBott/stoatchat) and [RobBott/self-hosted](https://github.com/RobBott/self-hosted):

- **Native Theme Presets in Settings & Server Context Menu (`ServerContextMenu.tsx`, `AppearanceMenu.tsx`, `Theme.ts`, `LoadTheme.tsx`):**
  - Switch between built-in theme presets (*Stoat Default*, *Midnight OLED*, *Nord Frost*, *Dracula*, *Catppuccin Mocha*, *Synthwave Neon*, *Forest Emerald*) directly from **User Settings → Appearance** or by **pressing-and-holding / right-clicking on any Server icon → Change theme**.
- **1-Tap Quick Reaction Bar & Favorite Emoji Memory (`MessageContextMenu.tsx`):**
  - Adds a 1-tap quick reaction bar at the top of the message context menu with active reaction highlighting and automatic memory of your most recently used emojis.
- **Mobile Pinch-to-Zoom & Double-Tap Zoom (`ImageViewer.tsx`):**
  - Adds native 2-finger pinch-to-zoom and double-tap zoom gestures for mobile touchscreens inside the full-screen image viewer.
- **iOS Safari Video Thumbnail Preloading (`Attachment.tsx`):**
  - Appends `#t=0.001` to `<video preload="metadata">` attachment sources so iPhone and iPad Safari render the first video frame instead of an empty black box.

---

<div align="center">
<h1>
  Stoat Frontend
  
  [![Stars](https://img.shields.io/github/stars/stoatchat/for-web?style=flat-square&logoColor=white)](https://github.com/stoatchat/for-web/stargazers)
  [![Forks](https://img.shields.io/github/forks/stoatchat/for-web?style=flat-square&logoColor=white)](https://github.com/stoatchat/for-web/network/members)
  [![Pull Requests](https://img.shields.io/github/issues-pr/stoatchat/for-web?style=flat-square&logoColor=white)](https://github.com/stoatchat/for-web/pulls)
  [![Issues](https://img.shields.io/github/issues/stoatchat/for-web?style=flat-square&logoColor=white)](https://github.com/stoatchat/for-web/issues)
  [![Contributors](https://img.shields.io/github/contributors/stoatchat/for-web?style=flat-square&logoColor=white)](https://github.com/stoatchat/for-web/graphs/contributors)
  [![License](https://img.shields.io/github/license/stoatchat/for-web?style=flat-square&logoColor=white)](https://github.com/stoatchat/for-web/blob/main/LICENSE)
</h1>
The official web client powering https://stoat.chat/app, built with <a href="https://www.solidjs.com/">Solid.js</a> 💖. <br/>
Track the project roadmap on <a href="https://op.stoatinternal.com/projects/revolt-for-web/roadmap">OpenProject</a>.
</div>
<br/>

## Development Guide

Before contributing, make yourself familiar with [our contribution guidelines](https://developers.stoat.chat/developing/contrib/), the [code style guidelines](./GUIDELINES.md), and the [technical documentation for this project](https://stoatchat.github.io/for-web/).

Before getting started, you'll want to install:

- [Git](https://git-scm.com/install/)
- [mise-en-place](https://mise.jdx.dev/getting-started.html)

Then proceed to setup:

```bash
# clone the repository
git clone --recursive https://github.com/stoatchat/for-web client
cd client

# update submodules if you pull new changes
# git submodule init && git submodule update

# install all packages
mise install:frozen

# build deps:
mise build:deps

# or build a specific dep (e.g. stoat.js updates):
# pnpm --filter stoat.js run build

# customise the .env
cp packages/client/.env.example packages/client/.env

# run dev server
mise dev

# run all CI checks locally
mise check
```

Finally, navigate to http://local.revolt.chat:5173.

### Using the official backend

By default, the client connects to a backend running on the same host (localhost).

If you want the client to connect to the official hosted backend instead, open the .env file at /packages/client/.env and comment out the local URL varaibles like this:

```env
# connect to local Stoat instance
#VITE_API_URL=http://localhost:14702
```

When these variables are not set, the client automatically falls back to the official backend. (See https://github.com/stoatchat/for-web/blob/main/packages/client/components/common/lib/env.ts)

## Deployment Guide

### Build the app

```bash
# install packages
mise install:frozen

# build dependencies
mise build:deps

# build for web
mise build

# ... when building for Stoat production
mise build:prod
```

You can now deploy the directory `packages/client/dist`.

### Routing Information

The app currently needs the following routes:

- `/login`
- `/pwa`
- `/dev`
- `/discover`
- `/settings`
- `/invite`
- `/bot`
- `/friends`
- `/server`
- `/channel`

This corresponds to [Content.tsx#L33](packages/client/src/index.tsx).
