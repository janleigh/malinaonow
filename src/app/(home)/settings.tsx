import { useAuth } from "@/context/AuthContext";
import { LANGUAGES, useTranslation } from "@/context/TranslationContext";
import { shadowStyles } from "@/lib/utils/styles";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
	const { language, setLanguage, t } = useTranslation();
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	// Handle language change
	const changeLanguage = async (languageId: string) => {
		try {
			setIsLoading(true);
			await setLanguage(languageId);
            
			// Show confirmation
			Alert.alert(
				t('settings.languageChanged'),
				t('settings.languageChangedDesc'),
				[{ text: "OK" }]
			);
		} catch (error) {
			console.error("Failed to save language preference:", error);
			Alert.alert(
				t('common.error'),
				"Failed to save language preference. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						{t('settings.title')}
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(home)")}
					>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<ScrollView className="flex-1 p-4">
					<View className="mb-6">
						<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black mb-2">
							{t('settings.language')}
						</Text>
						<Text className="text-sm text-gray-600 font-lexend tracking-tighter-lexend mb-4">
							{t('settings.selectLanguage')}
						</Text>
						<View className="space-y-3">
							{LANGUAGES.map((lang) => (
								<TouchableOpacity
									key={lang.id}
									className={`flex-row items-center justify-between p-4 border ${
										language === lang.id
											? "border-black bg-[#fed787]"
											: "border-gray-300 bg-white"
									}`}
									style={shadowStyles.small}
									onPress={() => changeLanguage(lang.id)}
									disabled={isLoading}
								>
									<Text className="font-lexend tracking-tighter-lexend text-black">
										{lang.name}
									</Text>
									{language === lang.id && (
										<Feather
											name="check"
											size={20}
											color="black"
										/>
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}
