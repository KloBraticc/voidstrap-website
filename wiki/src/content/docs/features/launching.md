---
title: Launching and updates
description: How Voidstrap installs Roblox, keeps it updated, and what happens when you press Play.
---

## What happens at launch

1. Voidstrap checks for its own update if **Automatically update Voidstrap** is on.
2. It checks the Roblox version for your deployment channel and downloads any missing packages.
3. It applies your FastFlags, mods and Roblox settings.
4. It starts Roblox and keeps running for activity tracking, Discord, overlays and the matchmaker.

If Roblox is already running, Voidstrap can ask before starting another launch so a misclick does not close your game. Only one Roblox client runs at a time.

## Downloads

Packages download in parallel and each package is split into several chunks. Every file is checked against its MD5 hash, and Voidstrap switches to a mirror if a server fails. On **Deployment** you can tune:

- **Concurrent downloads**: packages downloaded at the same time.
- **Download segments**: parallel chunks per package.
- **Buffer size**: larger buffers can help on fast connections.
- **Download server**: the server used to install or update Roblox.

## Update timing

- **On next launch**: you get each update the next time you launch after release.
- **Fast check**: asks Roblox's own version server first, so updates are picked up the moment they go live.
- **Delayed**: keeps your version for one day after each update so early bugs get fixed first. A missing or broken install always updates right away.
- **Off**: Roblox stays on its current version.

## Deployment channel

**Production** is the normal channel. Other channels are Roblox test builds and may not exist at any given time; a missing channel shows a 403 or 404 error while downloading. Changing the channel removes the current Roblox version so the new one can install. You can also pin a specific version hash.

## Saving disk space

- **Compressed installs** packs Roblox into an archive while closed, about 40% smaller. Only the version you launch is unpacked, which takes a second or two.
- **Cache cleanup** removes old Roblox data past the age you set.
- **Clear Roblox cache** deletes Roblox's cache folders. Games load slower until it refills.
- **Force Roblox reinstallation** installs Roblox fresh on the next launch.

## Background behaviour

- **Background priority** keeps Roblox at full speed while focused and throttles it while you are tabbed out.
- **Memory trimming** releases unused memory after Roblox has been unfocused for a while. It never trims while you play.
- Voidstrap can close RobloxCrashHandler once Roblox has started safely.

## Roblox window (Windows)

Voidstrap can show the game name and server region in the title bar, use the game's icon for the window and taskbar, set a custom icon per game or subplace, and apply a Windows 11 backdrop to the frame.

## Desktop app and closing

- **Don't exit to desktop app** closes Roblox fully when you leave a game.
- **Close Voidstrap after launch** opens Roblox directly from browser joins. Overlays, Discord activity and every in game feature stop working in that mode.

## Shortcuts

The **Shortcuts** page creates desktop shortcuts for a game, a private server (share link or access code), or a Voidstrap function, and can extract Voidstrap's Roblox icons into a folder.

## Install location and test builds

**Deployment** can move the Voidstrap install; the app restarts when done. **Early builds** updates to test builds as soon as they are published. They can break, so leave it off unless you want new features first.
