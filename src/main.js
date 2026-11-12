import { mount } from "svelte";
import "./global.css";
import Home from "./pages/Home.svelte";
import NotFound from "./pages/NotFound.svelte";
import ModsLibrary from "./pages/ModsLibrary.svelte";
import AppVote from "./pages/AppVote.svelte";
import Join from "./pages/Join.svelte";

const path = location.pathname.replace(/\/+$/, "") || "/";
const page = path === "/" ? Home : path === "/mods" ? ModsLibrary : path === "/join" ? Join : path === "/vote" || path === "/vote/done" ? AppVote : NotFound;

if (page === ModsLibrary) document.title = "Mods library | Voidstrap";

if (page === AppVote) {
  document.title = "Vote | Voidstrap";
  document.querySelector('meta[name="robots"]').content = "noindex";
}

if (page === NotFound) {
  document.title = "Page not found | Voidstrap";
  document.querySelector('meta[name="robots"]').content = "noindex";
}

if (import.meta.env.PROD && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  const beacon = document.createElement("script");
  beacon.defer = true;
  beacon.crossOrigin = "anonymous";
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = '{"token":"4599e3931e7d4132bf7fee6db9c5323d"}';
  document.body.append(beacon);
}

mount(page, { target: document.getElementById("app") });
