---
title: Connect an AI client (MCP)
description: Let an MCP client manage Voidstrap settings, themes, mods and diagnostics.
---

MCP lets a compatible AI client manage Voidstrap's settings, themes, mods and diagnostics. Keep Voidstrap open while connected.

:::caution
A connected client can change your app settings and files. Review what it does, and check its privacy settings before sharing logs.
:::

## Connect

1. In Voidstrap, open the connection dialog from the app menu, or the plug button in an editor.
2. Select your client and click **Connect**.
3. Restart the client.
4. Ask it to call `get_voidstrap_overview` to check the connection.

## Manual setup

Your client must support local `stdio` servers. Add this to its MCP settings, using your own path to Voidstrap:

```json
{
  "mcpServers": {
    "voidstrap": {
      "command": "C:\\path\\to\\Voidstrap.exe",
      "args": ["mcp", "stdio"]
    }
  }
}
```

## Learn the tools

Ask the client to call `get_guide` with `{"topic":"workflow"}`. It explains the tools and links to the theme, mod and troubleshooting guides.

## Disconnect

Disable or remove the `voidstrap` server in your client.
