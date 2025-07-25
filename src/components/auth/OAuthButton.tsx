import { shadowStyles } from "@/utils/styles";
import { useOAuth } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface OAuthButtonProps {
	strategy: OAuthStrategy;
	text: string;
	icon?: React.ReactNode;
	className?: string;
}

export const OAuthButton = ({ strategy, text, icon, className }: OAuthButtonProps) => {
	const [loading, setLoading] = React.useState(false);
	const { startOAuthFlow } = useOAuth({ strategy });

	const handlePress = async () => {
		try {
			setLoading(true);
			const { createdSessionId, setActive } = await startOAuthFlow();

			if (createdSessionId) {
				await setActive?.({ session: createdSessionId });

				setTimeout(() => {
					router.replace("/(home)");
				}, 300);
			}
		} catch (err) {
			console.error(`Error during ${strategy} authentication:`, err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableOpacity
			className={`h-12 w-full flex-row items-center justify-center bg-[#9ee3ae] px-4 border border-[#333333] ${className || ''}`}
			style={shadowStyles.standard}
			onPress={handlePress}
			disabled={loading}
		>
			{loading ? (
				<ActivityIndicator color="#000" />
			) : (
				<>
					{icon || <AntDesign className="mr-2" name="google" size={24} color="black" />}
					<Text className="text-base text-black font-extrabold android:font-normal font-lexend-medium tracking-tighter-lexend">
						{text}
					</Text>
				</>
			)}
		</TouchableOpacity>
	);
};
