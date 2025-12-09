import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      config.env = process.env;
      return config;
    },
    experimentalStudio: true,
    experimentalSessionAndOrigin: true,
    baseUrl: "http://localhost:3000",
  },
});
