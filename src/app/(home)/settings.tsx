import { BaseText as Text } from "@/components/BaseText";
import { useTranslation } from "@/hooks/useTranslation";
import { LANGUAGES } from "@/shared/context/TranslationContext";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@shared/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
	const { language, setLanguage, t } = useTranslation();
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	const changeLanguage = async (languageId: string) => {
		try {
			setIsLoading(true);
			await setLanguage(languageId);

			Alert.alert(
				t("settings.languageChanged"),
				t("settings.languageChangedDesc"),
				[{ text: "OK" }]
			);
		} catch (error) {
			console.error("Failed to save language preference:", error);
			Alert.alert(
				t("common.error"),
				"Failed to save language preference. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<SafeAreaView className="flex-1">
				<View className="flex-row items-center justify-between border-b border-surface p-4">
					<Text
						className="android:font-normal text-2xl text-text"
						fontName="Montserrat_700Bold">
						{t("settings.title")}
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(home)")}>
						<Feather name="x" size={24} color="#f7f7f7" />
					</TouchableOpacity>
				</View>
				<ScrollView className="flex-1 p-4">
					<View className="mb-6">
						<Text
							className="text-lg text-text"
							fontName="Montserrat_700Bold">
							{t("settings.language")}
						</Text>
						<Text
							className="mb-2 text-sm text-lineAlt"
							fontName="Poppins_500Medium">
							{t("settings.selectLanguage")}
						</Text>
						<View className="space-y-3">
							{LANGUAGES.map((lang) => (
								<TouchableOpacity
									key={lang.id}
									className={`my-1 flex-row items-center justify-between rounded-3xl border p-4 ${
										language === lang.id
											? "border-black bg-[#0ff6be]"
											: "border-gray-300 bg-white"
									}`}
									onPress={() => changeLanguage(lang.id)}
									disabled={isLoading}>
									<Text
										className="text-black"
										fontName="Montserrat_700Bold">
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
