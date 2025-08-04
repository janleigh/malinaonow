import { useAuth } from "@/context/AuthContext";
import { shadowStyles } from "@/lib/utils/styles";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Alert,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Language options
const LANGUAGES = [
	{ id: "en", name: "English" },
	{ id: "fil", name: "Filipino" },
	{ id: "akl", name: "Aklanon" }
];

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = "app_language_preference";

export default function SettingsScreen() {
	const [selectedLanguage, setSelectedLanguage] = useState("en");
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();

	// Load saved language preference
	useEffect(() => {
		const loadLanguagePreference = async () => {
			try {
				const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
				if (savedLanguage) {
					setSelectedLanguage(savedLanguage);
				}
				setIsLoading(false);
			} catch (error) {
				console.error("Failed to load language preference:", error);
				setIsLoading(false);
			}
		};

		loadLanguagePreference();
	}, []);

	// Handle language change
	const changeLanguage = async (languageId: string) => {
		try {
			setSelectedLanguage(languageId);
			await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageId);
            
			// Show confirmation
			Alert.alert(
				"Language Changed",
				"Your language preference has been updated.",
				[{ text: "OK" }]
			);
		} catch (error) {
			console.error("Failed to save language preference:", error);
			Alert.alert(
				"Error",
				"Failed to save language preference. Please try again."
			);
		}
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Settings
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
                            Language
						</Text>
						<Text className="text-sm text-gray-600 font-lexend tracking-tighter-lexend mb-4">
                            Select your preferred language
						</Text>
						<View className="space-y-3">
							{LANGUAGES.map((language) => (
								<TouchableOpacity
									key={language.id}
									className={`flex-row items-center justify-between p-4 border ${
										selectedLanguage === language.id
											? "border-black bg-[#fed787]"
											: "border-gray-300 bg-white"
									}`}
									style={shadowStyles.small}
									onPress={() => changeLanguage(language.id)}
								>
									<Text className="font-lexend tracking-tighter-lexend text-black">
										{language.name}
									</Text>
									{selectedLanguage === language.id && (
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
