import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config();

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export default defineConfig({
    e2e: {
        setupNodeEvents(_, config) {
            config.env = {
                ...config.env,
                AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
                AUTH0_USERNAME: process.env.AUTH0_USERNAME,
                AUTH0_PASSWORD: process.env.AUTH0_PASSWORD,
                BACKEND_URL: process.env.BACKEND_URL,
            };

            console.log("Cypress AUTH0_DOMAIN:", config.env.AUTH0_DOMAIN);
            return config;
        },
        baseUrl: normalizeBaseUrl(
            process.env.CYPRESS_BASE_URL ||
                process.env.VITE_FRONTEND_URL ||
                "http://localhost:3000"
        ),
    },
});
