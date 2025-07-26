import { useAuth } from "@/context/AuthContext";
import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserSidebarProps {
	visible: boolean;
	onClose: () => void;
	onSignOut?: () => void;
	email?: string;
	username?: string;
	profileImage?: string;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ visible, onClose, email, username, profileImage }) => {
	const { signOut, user } = useAuth();
	const slideAnim = useRef(new Animated.Value(Dimensions.get("window").width)).current;
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
			// Reset animation values
			slideAnim.setValue(Dimensions.get("window").width);
			fadeAnim.setValue(0);
			contentFadeAnim.setValue(0);

			const animationTimeout = setTimeout(() => {
				Animated.parallel([
					Animated.timing(slideAnim, {
						toValue: 0,
						duration: 300,
						useNativeDriver: true
					}),
					Animated.timing(fadeAnim, {
						toValue: 0.3,
						duration: 300,
						useNativeDriver: true
					})
				]).start();

				const contentTimeout = setTimeout(() => {
					Animated.timing(contentFadeAnim, {
						toValue: 1,
						duration: 250,
						useNativeDriver: true
					}).start();
				}, 100);

				return () => clearTimeout(contentTimeout);
			}, 10);

			return () => clearTimeout(animationTimeout);
		} else if (!visible && modalVisible) {
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: Dimensions.get("window").width,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(contentFadeAnim, {
					toValue: 0,
					duration: 200,
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
			hardwareAccelerated={true}
		>
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
					}}
				>
					<TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1" />
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
							backgroundColor: "#faf4f0",
							borderLeftWidth: 1,
							borderLeftColor: "#333333",
							transform: [{ translateX: slideAnim }]
						}
					]}
				>
					<Animated.View style={{ opacity: contentFadeAnim, flex: 1 }}>
						<SafeAreaView className="flex-1">
							<View className="flex-row justify-between items-center p-4">
								<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
									Profile
								</Text>
								<TouchableOpacity onPress={onClose}>
									<AntDesign name="close" size={24} color="black" />
								</TouchableOpacity>
							</View>
							<View className="items-center py-6 border-b border-gray-200">
								{userProfileImage ? (
									<Image
										source={{ uri: userProfileImage }}
										className="w-20 h-20 rounded-full border border-[#333333]"
									/>
								) : (
									<View className="w-20 h-20 rounded-full bg-[#8ED1DC] items-center justify-center border border-[#333333]">
										<Text className="text-xl font-extrabold text-black font-lexend tracking-tighter-lexend">
											{getInitials(userName)}
										</Text>
									</View>
								)}
								<Text className="mt-3 text-lg font-lexend-bold tracking-tighter-lexend text-black">
									{userName}
								</Text>
								<Text className="text-sm text-[#666] font-lexend tracking-tighter-lexend">
									{userEmail}
								</Text>
							</View>
							<View className="flex-1 p-4 space-y-1">
								<TouchableOpacity
									className="flex-row items-center py-4"
									onPress={() => {
										onClose();
										router.push("/+not-found");
									}}
								>
									<Feather name="user" size={20} color="#333" />
									<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
										My Profile
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className="flex-row items-center py-4"
									onPress={() => {
										onClose();
										router.push("/+not-found");
									}}
								>
									<Feather name="message-square" size={20} color="#333" />
									<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
										My Reviews
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className="flex-row items-center py-4"
									onPress={() => {
										onClose();
										router.push("/+not-found");
									}}
								>
									<Feather name="calendar" size={20} color="#333" />
									<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
										My Events
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className="flex-row items-center py-4"
									onPress={() => {
										onClose();
										router.push("/+not-found");
									}}
								>
									<Feather name="settings" size={20} color="#333" />
									<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
										Settings
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className="flex-row items-center py-4"
									onPress={() => {
										onClose();
										router.push("/+not-found");
									}}
								>
									<Feather name="shield" size={20} color="#333" />
									<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
										Admin Panel
									</Text>
								</TouchableOpacity>
							</View>
							<View className="p-4">
								<TouchableOpacity
									className="flex-row items-center justify-center py-3 bg-[#fed787] border border-[#333333] rounded-none"
									style={shadowStyles.standard}
									onPress={handleSignOut}
								>
									<Feather name="log-out" size={18} color="#333" />
									<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
										Sign Out
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
