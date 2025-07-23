import { shadowStyles } from "@/utils/styles";
import { AntDesign } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserSidebarProps {
    visible: boolean;
    onClose: () => void;
    onSignOut?: () => void;
    email?: string;
    username?: string;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ 
	visible, 
	onClose, 
	onSignOut,
	email = "user@example.com",
	username = "User Name" 
}) => {
	const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
    
	useEffect(() => {
		if (visible) {
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(slideAnim, {
				toValue: Dimensions.get('window').width,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	}, [visible, slideAnim]);
    
	const handleSignOut = () => {
		if (onSignOut) {
			onSignOut();
		} else {
			onClose();
			router.replace("/");
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(part => part.charAt(0))
			.join('')
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="none"
			onRequestClose={onClose}
		>
			<View className="flex-1 flex-row">
				<TouchableOpacity 
					activeOpacity={1} 
					onPress={onClose} 
					className="flex-1 bg-black/30"
				/>
				<Animated.View 
					className="w-72 bg-white h-full border-l border-[#333333]"
					style={[
						shadowStyles.standard,
						{ transform: [{ translateX: slideAnim }] }
					]}
				>
					<SafeAreaView className="flex-1">
						<View className="p-6 border-b border-[#333333]">
							<View className="w-16 h-16 bg-[#fed787] rounded-full items-center justify-center mb-4 border border-[#333333]" style={shadowStyles.small}>
								<Text className="text-xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
									{getInitials(username)}
								</Text>
							</View>
							<Text className="text-xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
								{username}
							</Text>
							<Text className="text-sm text-[#555] font-lexend tracking-tighter-lexend">
								{email}
							</Text>
						</View>
						<View className="flex-1 p-4">
							<TouchableOpacity className="flex-row items-center py-4">
								<AntDesign name="user" size={20} color="#333" />
								<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
                                    My Profile
								</Text>
							</TouchableOpacity>
                            
							<TouchableOpacity className="flex-row items-center py-4">
								<AntDesign name="star" size={20} color="#333" />
								<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
                                    My Reviews
								</Text>
							</TouchableOpacity>
                            
							<TouchableOpacity className="flex-row items-center py-4">
								<AntDesign name="setting" size={20} color="#333" />
								<Text className="ml-4 font-lexend tracking-tighter-lexend text-black">
                                    Admin Panel
								</Text>
							</TouchableOpacity>
						</View>
						<View className="p-4 border-t border-[#333333]">
							<TouchableOpacity 
								className="flex-row items-center justify-center py-4 bg-[#fed787] border border-[#333333]"
								style={shadowStyles.standard}
								onPress={handleSignOut}
							>
								<AntDesign name="logout" size={18} color="#333" />
								<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
                                    Sign Out
								</Text>
							</TouchableOpacity>
						</View>
					</SafeAreaView>
				</Animated.View>
			</View>
		</Modal>
	);
};

export default UserSidebar;
