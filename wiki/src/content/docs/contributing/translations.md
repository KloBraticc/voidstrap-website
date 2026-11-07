---
title: Translations
description: How to translate Voidstrap.
---

| File | Contents |
| --- | --- |
| `src/Voidstrap.App/Resources/Strings.resx` | English source text |
| `src/Voidstrap.App/Resources/Strings.<language>.resx` | Translations |

## Rules

- Keep placeholders, line breaks and file filter patterns as they are.
- Don't replace an existing translation with an empty value.

## Adding new text to the app

Add the resource property and all shipped translations in the same change, and use the localization binding so the text updates when the language changes.

Maintainers sync accepted language changes with [Crowdin](https://crowdin.com/project/voidstrap).
