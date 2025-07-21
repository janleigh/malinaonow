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
				"lexend-bold": [
					'LexendMega-Bold',
					'sans-serif'
				],
				"lexend-regular": [
					'LexendMega-Regular',
					'sans-serif'
				],
				"lexend-medium": [
					'LexendMega-Medium',
					'sans-serif'
				],
				"lexend-extrabold": [
					'LexendMega-ExtraBold',
					'sans-serif'
				],
				// Public Sans
				"public-sans-bold": [
					'PublicSans-Bold',
					'sans-serif'
				],
				"public-sans-bold-italic": [
					'PublicSans-BoldItalic',
					'sans-serif'
				],
				"public-sans-extrabold": [
					'PublicSans-ExtraBold',
					'sans-serif'
				],
				"public-sans-extrabold-italic": [
					'PublicSans-ExtraBoldItalic',
					'sans-serif'
				],
				"public-sans-italic": [
					'PublicSans-Italic',
					'sans-serif'
				],
				"public-sans-medium": [
					'PublicSans-Medium',
					'sans-serif'
				],
				"public-sans-medium-italic": [
					'PublicSans-MediumItalic',
					'sans-serif'
				],
				"public-sans-regular": [
					'PublicSans-Regular',
					'sans-serif'
				],
				"public-sans-semibold": [
					'PublicSans-SemiBold',
					'sans-serif'
				],
				"public-sans-semibold-italic": [
					'PublicSans-SemiBoldItalic',
					'sans-serif'
				]

			},
			letterSpacing: {
				'tighter-lexend': '-0.15em'
			}
		}
	},
	plugins: []
};
