import { mount } from "svelte";
import "./global.css";
import Home from "./pages/Home.svelte";
import NotFound from "./pages/NotFound.svelte";

const page = location.pathname === "/" ? Home : NotFound;

if (page === NotFound) {
  document.title = "Page not found | Voidstrap";
  document.querySelector('meta[name="robots"]').content = "noindex";
}

const beacon = document.createElement("script");
beacon.defer = true;
beacon.crossOrigin = "anonymous";
beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
beacon.dataset.cfBeacon = '{"token":"4599e3931e7d4132bf7fee6db9c5323d"}';
document.body.append(beacon);

mount(page, { target: document.getElementById("app") });
