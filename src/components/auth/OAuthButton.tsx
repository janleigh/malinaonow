import { useOAuth } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { BaseText as Text } from "../BaseText";

interface OAuthButtonProps {
	strategy: OAuthStrategy;
	text: string;
	icon?: React.ReactNode;
	className?: string;
}

export const OAuthButton = ({
	strategy,
	text,
	icon,
	className
}: OAuthButtonProps) => {
	const [loading, setLoading] = React.useState(false);
	const { startOAuthFlow } = useOAuth({ strategy });

	const handlePress = async () => {
		try {
			setLoading(true);
			const { createdSessionId, setActive } = await startOAuthFlow();

			if (createdSessionId) {
				await setActive?.({
					session: createdSessionId
				});

				await new Promise((resolve) => setTimeout(resolve, 200));
			}
		} catch (err) {
			console.error(`Error during ${strategy} authentication:`, err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Pressable
			className={`h-12 w-full flex-row items-center justify-center rounded-3xl border border-[#333333] bg-[#9ee3ae] px-4 ${className || ""}`}
			onPress={handlePress}
			android_ripple={{
				color: "rgba(0,0,0,0.12)",
				foreground: true
			}}
			disabled={loading}>
			{loading ? (
				<ActivityIndicator color="#000" />
			) : (
				<>
					{icon || (
						<AntDesign
							className="mr-2"
							name="google"
							size={20}
							color="black"
						/>
					)}
					<Text
						className="android:font-normal text-base text-black"
						fontName="Poppins_500Medium">
						{text}
					</Text>
				</>
			)}
		</Pressable>
	);
};
