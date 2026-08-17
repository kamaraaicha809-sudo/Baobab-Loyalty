import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["supabase/functions/**", "seo-stack/**"],
  },
];

export default eslintConfig;
