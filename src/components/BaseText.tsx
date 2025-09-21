import type { PropsWithChildren } from "react";
import type { TextProps } from "react-native";
import { Text } from "react-native";

type BaseTextProps = PropsWithChildren<
	TextProps & {
		className?: string;
		fontStyle?: "regular" | "medium" | "bold" | "extrabold";
	}
>;

export const BaseText = ({
	children,
	className = "",
	numberOfLines,
	fontStyle,
	...rest
}: BaseTextProps) => {
	const weightClass = fontStyle ? `-${fontStyle}` : "";
	return (
		<Text
			className={`font-lexend${weightClass} ${className}`.trim()}
			numberOfLines={numberOfLines}
			{...rest}
		>
			{children}
		</Text>
	);
};

export default BaseText;
