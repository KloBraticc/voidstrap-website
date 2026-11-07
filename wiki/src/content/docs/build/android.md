---
title: Build for Android
description: Build debug and signed release APKs.
---

To test a change, you only need **Requirements** and **Debug APKs**. Signing is for releases.

## Requirements

- [JDK 17](https://adoptium.net/temurin/releases/?version=17), with `JAVA_HOME` set
- [Android SDK](https://developer.android.com/studio) with Platform 37, Build Tools, Platform Tools and **NDK 29.0.14206865**, with `ANDROID_HOME` set and licenses accepted
- A current stable [Rust toolchain](https://rustup.rs/)

Add the Rust targets once:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
```

## Debug APKs

```bash
cd android
./gradlew assembleDebug
```

On Windows, use `.\gradlew.bat assembleDebug`.

| Flavor | Output under `android/app/build/outputs/apk/` | Behavior |
| --- | --- | --- |
| `play` | `play/debug/app-play-debug.apk` | Google Play channel, no direct updater or server matchmaker |
| `direct` | `direct/debug/app-direct-debug.apk` | GitHub channel, with direct updater and server matchmaker |

Debug APKs cannot replace a release signed with a different certificate.

## Signed release APKs

Create a keystore outside the repository, and keep using the same key for updates:

```bash
keytool -genkeypair -keystore /path/to/voidstrap-release.jks -alias voidstrap -keyalg RSA -keysize 2048 -validity 10000
```

Add these to `~/.gradle/gradle.properties` (`%USERPROFILE%\.gradle\gradle.properties` on Windows). Use an absolute path, with forward slashes on Windows.

```properties
voidstrap.storeFile=/path/to/your.keystore
voidstrap.storePassword=your_store_password
voidstrap.keyAlias=your_key_alias
voidstrap.keyPassword=your_key_password
```

Then build, from `android`:

```bash
./gradlew assemblePlayRelease assembleDirectRelease
```

Without all four properties, Gradle produces unsigned APKs.

## Build through the release script

This also verifies the signature and copies the APKs to `PublishedBuilds/Android`. It requires the .NET SDK, and rejects unsigned or debug signed APKs.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\publish-all.ps1 -Only android -NoPause
```
