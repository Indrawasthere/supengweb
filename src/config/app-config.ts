import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Supeng Web",
  version: packageJson.version,
  copyright: `© ${currentYear}, Supeng Web.`,
  meta: {
    title: "Supeng Web - Analytics Dashboard for Supeng",
    description: "Supeng Web",
  },
};
