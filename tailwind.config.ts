import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { forest: "#173D32", moss: "#456B52", sand: "#E9D7B5", amber: "#D9A65A", ink: "#17251F" }, boxShadow: { soft: "0 18px 55px rgba(23, 61, 50, .10)" } } },
  plugins: [],
};
export default config;
