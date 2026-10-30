import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * All typefaces are vendored in assets/fonts (SIL Open Font License 1.1,
 * licence texts alongside). Rendering waits until every face has loaded.
 */
export const fontsReady = Promise.all([
  loadFont({
    family: "Playfair Display",
    url: staticFile("fonts/PlayfairDisplay-Variable.ttf"),
    weight: "400 900",
    style: "normal",
  }),
  loadFont({
    family: "Playfair Display",
    url: staticFile("fonts/PlayfairDisplay-Italic-Variable.ttf"),
    weight: "400 900",
    style: "italic",
  }),
  loadFont({
    family: "EB Garamond",
    url: staticFile("fonts/EBGaramond-Variable.ttf"),
    weight: "400 800",
    style: "normal",
  }),
  loadFont({
    family: "EB Garamond",
    url: staticFile("fonts/EBGaramond-Italic-Variable.ttf"),
    weight: "400 800",
    style: "italic",
  }),
  loadFont({
    family: "El Messiri",
    url: staticFile("fonts/ElMessiri-Variable.ttf"),
    weight: "400 700",
    style: "normal",
  }),
  loadFont({
    family: "Anonymous Pro",
    url: staticFile("fonts/AnonymousPro-Bold.ttf"),
    weight: "700",
    style: "normal",
  }),
]);
