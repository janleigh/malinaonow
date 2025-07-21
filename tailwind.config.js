/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./App.tsx", "./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				lexend: [
					'LexendMega-ExtraBold',
					'sans-serif'
				],
			},
			letterSpacing: {
				'tighter-lexend': '-0.15em'
			}
		}
	},
	plugins: []
};
