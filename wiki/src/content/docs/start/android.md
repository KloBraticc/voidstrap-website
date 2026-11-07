---
title: Android setup
description: Install Voidstrap on Android and give it the access it needs.
---

You need Android 7 or newer.

1. Download `Voidstrap-Android-direct-<version>.apk` from the [latest release](https://github.com/KloBraticc/Voidstrap/releases/latest).
2. Install it.
3. Choose a method below in **Settings > Voidstrap helper**. The app also shows your exact command with a copy button.

Android limits access to Roblox's files, so Voidstrap needs this permission to apply your FastFlags.

## Which method should I use?

| Method | Needs a computer? | After your phone restarts |
| --- | --- | --- |
| **Shizuku** (easiest) | No | Start Shizuku again |
| **ADB** | Yes | Run the start command again |
| **Root** | No | Nothing, it keeps working |

:::note
Mods only work with root.
:::

## Shizuku

1. Install [Shizuku](https://shizuku.rikka.app/) and follow its setup guide.
2. In Voidstrap, open **Settings > Voidstrap helper** and tap **Start with Shizuku**.
3. Allow Voidstrap when Shizuku asks.

## ADB with a USB cable

1. Open **Settings > About phone** and tap **Build number** seven times. On some phones it is inside **Software information**, or called **OS version**.
2. In **Developer options**, usually under **Settings > System**, turn on **USB debugging**.
3. On your computer, download [SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools) and extract it.
4. Open a terminal in the `platform-tools` folder.
5. Plug in your phone and run the command below. In PowerShell, use `.\adb` instead of `adb`.

   ```bash
   adb devices
   ```

6. Unlock your phone and tap **Allow**.
7. Run the start command:

   ```bash
   adb shell "content read --uri content://com.voidstrap.android.direct.start/start.sh | sh"
   ```

If `adb devices` shows nothing, try another cable. Some only charge.

## ADB over WiFi

Needs Android 11 or newer.

1. Follow steps 1 to 4 of the USB guide.
2. Put your phone and computer on the same WiFi network.
3. In **Developer options**, open **Wireless debugging** and tap **Pair device with pairing code**.
4. Pair using the details in that popup:

   ```bash
   adb pair IP:PORT CODE
   ```

5. Connect using the address on the main Wireless debugging screen. This port is different from the pairing port.

   ```bash
   adb connect IP:PORT
   ```

6. Run the start command from step 7 of the USB guide.

## Root

In Voidstrap, open **Settings**, turn on **Use root**, and allow Voidstrap in your root manager.
