import { useOAuth } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import { Text } from "@components/ui/Text";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";

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
	const [loading, setLoading] = React.useState<true | false>(false);
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
		<TouchableOpacity
			className={`h-12 w-full flex-row items-center justify-center rounded-3xl border border-[#333333] bg-[#9ee3ae] px-4 ${className || ""}`}
			onPress={handlePress}
			disabled={loading}>
			{loading ? (
				<ActivityIndicator color="#000" />
			) : (
				<>
					{icon || (
						<AntDesign
							className="mr-2"
							name="google"
							size={24}
							color="black"
						/>
					)}
					<Text
						className="android:font-normal text-base tracking-tighter-lexend text-black"
						>
						{text}
					</Text>
				</>
			)}
		</TouchableOpacity>
	);
};
