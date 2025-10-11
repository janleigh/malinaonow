import type { PropsWithChildren } from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";

type FontNames =
	| "Geist_400Regular"
	| "Geist_500Medium"
	| "Geist_600SemiBold"
	| "Geist_700Bold"
	| "Geist_800ExtraBold"
	| "Poppins_400Regular"
	| "Poppins_500Medium"
	| "Poppins_600SemiBold"
	| "Poppins_700Bold"
	| "Poppins_800ExtraBold";

type BaseTextProps = PropsWithChildren<
	TextProps & {
		className?: string;
		fontName?: FontNames;
		fontStyle?: "regular" | "medium" | "bold" | "extrabold";
	}
>;

export const BaseText = ({
	children,
	className = "",
	numberOfLines,
	fontName,
	fontStyle,
	...rest
}: BaseTextProps) => {
	const weightClass = fontStyle ? `-${fontStyle}` : "";
	return (
		<Text
			className={`font-${weightClass} ${className}`.trim()}
			numberOfLines={numberOfLines}
			style={fontName ? { fontFamily: fontName } : {}}
			{...rest}>
			{children}
		</Text>
	);
};

export default BaseText;
