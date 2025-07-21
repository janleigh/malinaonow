/**
 * Common shadow styles for UI elements with consistent drop shadow effect
 */
export const shadowStyles = {
	/**
   * Standard drop shadow used throughout the app
   */
	standard: {
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 6
	},
  
	/**
   * Smaller drop shadow for less prominent elements
   */
	small: {
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 3
	}
};
