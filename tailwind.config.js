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
			fontFamily: {
				"lexend": ["LexendMega-ExtraBold", "sans-serif"],
				"lexend-bold": ["LexendMega-Bold", "sans-serif"],
				"lexend-extrabold": ["LexendMega-ExtraBold", "sans-serif"],
				"lexend-medium": ["LexendMega-Medium", "sans-serif"],
				"lexend-regular": ["LexendMega-Regular", "sans-serif"]
			},
			letterSpacing: {
				"tighter-lexend": "-0.15em"
			},
			colors: {
				background: "#292c31",
				surface: "#565960",
				line: "#333333",
				lineAlt: "#666666",
				primary: {
					DEFAULT: "#0ff6be",
					dark: "#3a514b"
				},
				text: {
					light: "#f7f7f7",
					inactive: "#979897"
				}
			}
		}
	},
	plugins: []
};
