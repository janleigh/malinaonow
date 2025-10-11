/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./App.tsx",
		"./src/app/**/*.{js,jsx,ts,tsx}",
		"./src/components/**/*.{js,jsx,ts,tsx}"
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				background: "#161719",
				backgroundAlt: "#141617",
				lighterBackground: "#2e3034",
				surface: "#262729",
				line: "#333333",
				lineAlt: "#666666",
				primary: {
					DEFAULT: "#0ff6be",
					dark: "#3a514b"
				},
				text: {
					DEFAULT: "#f7f7f7",
					inactive: "#cacbca"
				}
			}
		}
	},
	plugins: []
};
