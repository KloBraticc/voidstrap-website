---
title: Voidstrap mods
description: Sandboxed add-ons that change the Voidstrap app itself, and how to make and publish one.
---

Voidstrap mods change the **app**, not Roblox: widgets on the home page, new pages, custom cursors, sidebar changes or small automations. They live on the page under **Private Servers**.

## Safety

Mods run in a sandbox. They cannot read your files, accounts or logins unless they ask for a permission, and every new mod waits for your approval before it runs. If a mod asks for more than it needs, say no. A clock widget does not need your Roblox account.

## Installing

Open the mods page, browse the **Library** and install. Verified and featured mods are marked. Turn any mod off or remove it from the same page.

## Making one

<ol>
<li>Create a mod from a template on the mods page.</li>
<li>Write it in TypeScript or JavaScript using the <code>$</code> API: <code>$.ui</code> for widgets, <code>$.clock</code> for timers, <code>$.roblox</code> for Roblox requests.</li>
<li>Validate and test it, then reload. Errors show in the mod's problems list.</li>
</ol>

## Publishing

Run the preflight check and fix everything it flags, then publish. You sign in with GitHub and confirm before anything goes public.

## Working with an AI tool

Voidstrap has an MCP bridge so tools can build mods for you. See [MCP](/guides/mcp/).
