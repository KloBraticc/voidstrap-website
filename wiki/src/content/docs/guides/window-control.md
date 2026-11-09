---
title: Window control for game developers
description: Move, resize, retitle and fade the Roblox window from your own game with a few lines of Luau.
---

Window control lets your game change the player's Roblox window: move and resize it, remove its border, change its title and make it see through. It uses the same `[BloxstrapRPC]` message format as Bloxstrap and Funkstrap, so games written for Funkstrap work in Voidstrap too.

:::note
Window control only works on Windows. Players must turn on **Integrations › Window Control › Allow window control** (it is off by default) and activity tracking. Everything resets when they leave your game.
:::

## How it works

A LocalScript prints a line that starts with `[BloxstrapRPC]` followed by JSON. Roblox writes the line to its log, Voidstrap reads the log and applies the command. Nothing is sent over the network, and players without Voidstrap just see a line in their output.

## Add it to your game

Put a LocalScript in **StarterPlayer › StarterPlayerScripts**:

```lua
local HttpService = game:GetService("HttpService")

local function send(command, data)
	print("[BloxstrapRPC] " .. HttpService:JSONEncode({ command = command, data = data }))
end

send("SetWindowTitle", "Hello from my game")
send("SetWindow", { x = 100, y = 100, width = 800, height = 600, scaleWidth = 1920, scaleHeight = 1080 })
task.wait(3)
send("SetWindowTransparency", { transparency = 0.6 })
task.wait(3)
send("SetWindowBorderless", true)
task.wait(3)
send("ResetWindow")
```

Publish the place and join it through Voidstrap. Pressing Play in Studio does not work, because Studio does not run through Voidstrap.

## Commands

| Command | Data | What it does |
| --- | --- | --- |
| `SetWindow` | `{ x, y, width, height, scaleWidth, scaleHeight, reset }` | Moves and resizes the window. Every field is optional. |
| `ResetWindow` | none | Puts the window back where it started. |
| `SetWindowBorderless` | `true` or `false` | Removes or restores the window border. |
| `SetWindowTitle` | a string | Changes the window title. An empty string restores it. |
| `SetWindowTransparency` | `{ transparency }` | `1` is solid, `0` is the most see through. |

`x`, `y`, `width` and `height` are measured on a screen of `scaleWidth` by `scaleHeight` and scaled to the player's monitor, so `scaleWidth = 1920, scaleHeight = 1080` lets you think in 1080p on any display. Without the scale fields, values are real pixels. Set `reset = true` to restore the original bounds.

## Limits

- The window is never smaller than 200 by 150 and always stays on screen.
- Transparency never goes below about 10 percent, so the window cannot vanish.
- Titles are cut at 256 characters.
- Voidstrap reads up to 60 messages per second, so short animations work, but send only what changes.
- Players can turn off movement, title or transparency one by one.

## Troubleshooting

If nothing happens, check that the setting is on, that you joined through Voidstrap, and search the Voidstrap log for `WindowController`.
