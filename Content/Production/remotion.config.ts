/**
 * Remotion CLI configuration for the Formanova production project.
 * All options: https://remotion.dev/docs/config
 *
 * Static files (fonts, product photography, brand marks, score) live in
 * ./assets, which is served as the public directory.
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setPublicDir("./assets");
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.setColorSpace("bt709");
