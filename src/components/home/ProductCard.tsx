import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
	Animated,
	Image,
	Modal,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Product = {
	id: string;
	name: string;
	price: number;
	image: string;
	description?: string;
};

interface ProductCardProps {
	product: Product;
	listView?: boolean; // future proof – not used yet
}

// ProductCard replicates the visual + animated behaviour of EventCard & LocationCard
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
	const [expanded, setExpanded] = useState(false);
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	const toggleExpand = () => {
		if (!expanded) {
			setExpanded(true);
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				})
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(opacityAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				})
			]).start(() => setExpanded(false));
		}
	};

	return (
		<>
			<TouchableOpacity
				className="bg-white border border-[#333333] my-2 overflow-hidden"
				style={shadowStyles.standard}
				onPress={toggleExpand}
			>
				{/* Banner */}
				<View className="w-full h-32">
					<Image
						source={{ uri: product.image }}
						className="w-full h-full"
						resizeMode="cover"
					/>
				</View>
				{/* Content */}
				<View className="p-3">
					<Text
						className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
						numberOfLines={2}
					>
						{product.name}
					</Text>
					<View className="flex-row items-center mt-1">
						<AntDesign name="tag" size={10} color="#555" />
						<Text className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555]">
							₱{product.price.toLocaleString()}
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			{/* Modal for details */}
			<Modal visible={expanded} transparent animationType="none">
				<Animated.View
					style={{
						flex: 1,
						backgroundColor: "#faf4f0",
						opacity: opacityAnim,
						transform: [
							{
								scale: scaleAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0.8, 1]
								})
							}
						]
					}}
				>
					<SafeAreaView className="flex-1">
						<View className="flex-row justify-between items-center p-4 border-b border-[#333333]">
							<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
								Product Details
							</Text>
							<TouchableOpacity onPress={toggleExpand}>
								<Feather name="x" size={24} color="black" />
							</TouchableOpacity>
						</View>
						<View className="flex-1">
							<Image
								source={{ uri: product.image }}
								className="w-full h-52"
								resizeMode="cover"
							/>
							<View className="p-4">
								<Text className="text-2xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2">
									{product.name}
								</Text>
								<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-[#333] mb-4">
									₱{product.price.toLocaleString()}
								</Text>
								<Text className="text-base font-lexend tracking-tighter-lexend text-[#666]">
									{product.description || "No description provided."}
								</Text>
							</View>
						</View>
					</SafeAreaView>
				</Animated.View>
			</Modal>
		</>
	);
};

export default ProductCard;