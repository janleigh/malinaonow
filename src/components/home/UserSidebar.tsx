import { BaseText as Text } from "@/components/BaseText";
import { useTranslation } from "@/hooks/useTranslation";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useAuth } from "@shared/context/AuthContext";
import { shadowStyles } from "@shared/utils/styles";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Image,
	Modal,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserSidebarProps {
	visible: boolean;
	onClose: () => void;
	onSignOut?: () => void;
	email?: string;
	username?: string;
	profileImage?: string;
	onShowBookmarks?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
	visible,
	onClose,
	email,
	username,
	profileImage
}) => {
	const { signOut, user, isAdmin } = useAuth();
	const { t } = useTranslation();
	const slideAnim = useRef(
		new Animated.Value(Dimensions.get("window").width)
	).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const contentFadeAnim = useRef(new Animated.Value(0)).current;
	const [modalVisible, setModalVisible] = useState(false);

	const userEmail = user?.primaryEmailAddress?.emailAddress || email;
	const userName = user?.fullName || username || "Guest";
	const userProfileImage = user?.imageUrl || profileImage;

	useEffect(() => {
		if (visible) {
			setModalVisible(true);
		}
	}, [visible]);

	useEffect(() => {
		if (visible && modalVisible) {
			slideAnim.setValue(Dimensions.get("window").width);
			fadeAnim.setValue(0);
			contentFadeAnim.setValue(0);

			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 200,
					useNativeDriver: true
				}),
				Animated.timing(fadeAnim, {
					toValue: 0.3,
					duration: 200,
					useNativeDriver: true
				}),
				Animated.timing(contentFadeAnim, {
					toValue: 1,
					duration: 200,
					delay: 50,
					useNativeDriver: true
				})
			]).start();
		} else if (!visible && modalVisible) {
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: Dimensions.get("window").width,
					duration: 150,
					useNativeDriver: true
				}),
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true
				}),
				Animated.timing(contentFadeAnim, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true
				})
			]).start(() => {
				setModalVisible(false);
			});
		}
	}, [visible, modalVisible, slideAnim, fadeAnim, contentFadeAnim]);

	const handleSignOut = async () => {
		try {
			onClose();
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part.charAt(0))
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<Modal
			visible={modalVisible}
			transparent={true}
			animationType="none"
			onRequestClose={onClose}
			hardwareAccelerated={true}>
			<View className="flex-1">
				<Animated.View
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "black",
						opacity: fadeAnim
					}}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={onClose}
						className="flex-1"
					/>
				</Animated.View>
				<Animated.View
					style={[
						shadowStyles.small,
						{
							position: "absolute",
							top: 0,
							bottom: 0,
							right: 0,
							width: 288,
							backgroundColor: "#161719",
							borderLeftWidth: 1,
							borderLeftColor: "#333333",
							transform: [{ translateX: slideAnim }]
						}
					]}>
					<Animated.View
						style={{
							opacity: contentFadeAnim,
							flex: 1
						}}>
						<SafeAreaView className="flex-1">
							<View className="flex-row items-center justify-between p-4">
								<Text
									className="text-xl text-text"
									fontName="Montserrat_700Bold">
									{t("userSidebar.profile")}
								</Text>
								<TouchableOpacity onPress={onClose}>
									<AntDesign
										name="close"
										size={24}
										color="#f7f7f7"
									/>
								</TouchableOpacity>
							</View>
							<View className="items-center border-b border-surface py-6">
								{userProfileImage ? (
									<Image
										source={{
											uri: userProfileImage
										}}
										className="h-20 w-20 rounded-full border border-[#333333]"
									/>
								) : (
									<View className="h-20 w-32 items-center justify-center rounded-full border border-[#333333] bg-[#8ED1DC]">
										<Text
											className="text-xl text-text"
											fontName="Montserrat_700Bold">
											{getInitials(userName)}
										</Text>
									</View>
								)}
								<Text
									className="mt-3 text-lg text-text"
									fontName="Montserrat_700Bold">
									{userName}
								</Text>
								<Text
									className="w-32 text-xs text-lineAlt"
									numberOfLines={1}
									fontName="Poppins_500Medium">
									{userEmail}
								</Text>
							</View>
							<View className="flex-1 space-y-1 p-4">
								{isAdmin && (
									<TouchableOpacity
										className="flex-row items-center py-4"
										onPress={() => {
											onClose();
											router.push("/(admin)");
										}}>
										<Feather
											name="shield"
											size={20}
											color="#cacbca"
										/>
										<Text
											className="ml-4 text-text"
											fontName="Poppins_500Medium">
											{t("userSidebar.adminPanel")}
										</Text>
									</TouchableOpacity>
								)}
								<TouchableOpacity
									className="flex-row items-center py-4"
									onPress={() => {
										onClose();
										router.push("/(home)/settings");
									}}>
									<Feather
										name="settings"
										size={20}
										color="#cacbca"
									/>
									<Text
										className="ml-4 text-text"
										fontName="Poppins_500Medium">
										{t("userSidebar.settings")}
									</Text>
								</TouchableOpacity>
							</View>
							<View className="p-4">
								<TouchableOpacity
									className="flex-row items-center justify-center rounded-3xl border border-[#333333] bg-primary py-3"
									onPress={handleSignOut}>
									<Feather
										name="log-out"
										size={18}
										color="#161719"
									/>
									<Text
										className="ml-2 text-black"
										fontName="Montserrat_700Bold">
										{t("userSidebar.signOut")}
									</Text>
								</TouchableOpacity>
							</View>
						</SafeAreaView>
					</Animated.View>
				</Animated.View>
			</View>
		</Modal>
	);
};

export default UserSidebar;
