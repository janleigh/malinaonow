import { useTranslation } from "@/lib/context/TranslationContext";
import { Product } from "@/lib/types/supabase";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Image,
	LayoutChangeEvent,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from "react-native";

export const ProductCard = ({
	product,
	listView = false,
	isBookmarked = false,
	onToggleBookmark,
	onAddToCart
}: {
	product: Product;
	listView?: boolean;
	isBookmarked?: boolean;
	onToggleBookmark?: (productId: string, newStatus: boolean) => void;
	onAddToCart?: (productId: string) => void;
}) => {
	const [expanded, setExpanded] = useState(false);
	const [bookmarked, setBookmarked] = useState(isBookmarked);
	const [isDescriptionExpanded, setIsDescriptionExpanded] =
		useState(false);
	const [descriptionHeight, setDescriptionHeight] = useState(0);
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const scrollViewRef = useRef<ScrollView>(null);
	const { language, t } = useTranslation();

	const shouldShowToggle = true;

	const onDescriptionLayout = (event: LayoutChangeEvent) => {
		const { height } = event.nativeEvent.layout;
		setDescriptionHeight(height);
	};

	const toggleDescription = () => {
		setIsDescriptionExpanded(!isDescriptionExpanded);
	};

	useEffect(() => {
		if (expanded && scrollViewRef.current) {
			scrollViewRef.current.scrollTo({
				x: 0,
				y: 0,
				animated: false
			});
		}

		if (!expanded) {
			setIsDescriptionExpanded(false);
		}
	}, [expanded]);

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
			]).start(() => {
				setExpanded(false);
			});
		}
	};

	const handleToggleBookmark = (e: any) => {
		e.stopPropagation && e.stopPropagation();
		const newStatus = !bookmarked;
		setBookmarked(newStatus);
		if (onToggleBookmark) onToggleBookmark(product.id, newStatus);
	};

	const getLocalizedDescription = (prod: Product): string => {
		if (language === "fil" && prod.description_fil) {
			return prod.description_fil;
		} else if (language === "akl" && prod.description_akl) {
			return prod.description_akl;
		}

		return prod.description;
	};

	return (
		<View className="mb-2">
			<TouchableOpacity
				key={product.id}
				className="bg-white border border-[#333333] rounded-xl overflow-hidden"
				onPress={toggleExpand}
			>
				{listView ? (
					<View className="flex-row">
						<View className="w-1/3 h-24">
							{product.image_url ? (
								<Image
									source={{ uri: product.image_url }}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : (
								<View className="w-full h-full bg-gray-100 items-center justify-center">
									<Feather
										name="package"
										size={40}
										color="#999"
									/>
								</View>
							)}
						</View>
						<ScrollView className="p-3 flex-1">
							<View className="flex-row items-center">
								<Text
									className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
									numberOfLines={1}
								>
									{product.name}
								</Text>
								<View
									className={`px-2 py-1 rounded ${product.is_available ? "bg-green-100" : "bg-red-100"} ml-2`}
								>
									<Text
										className={`text-xs font-lexend-medium tracking-tighter-lexend ${product.is_available ? "text-green-800" : "text-red-800"}`}
									>
										{product.is_available
											? "Available"
											: "Unavailable"}
									</Text>
								</View>
							</View>
							<View className="flex-row items-center mb-1 px-1">
								<AntDesign
									name="enviromento"
									size={10}
									color="#555"
								/>
								<Text
									className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]"
									numberOfLines={1}
								>
									{product.barangay}
								</Text>
							</View>
							<Text
								className="text-xs font-lexend tracking-tighter-lexend text-[#666666] mt-1"
								numberOfLines={1}
							>
								{getLocalizedDescription(product)}
							</Text>
						</ScrollView>
					</View>
				) : (
					<View>
						<View className="w-full h-32">
							{product.image_url ? (
								<Image
									source={{ uri: product.image_url }}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : (
								<View className="w-full h-full bg-gray-100 items-center justify-center">
									<Feather
										name="package"
										size={40}
										color="#999"
									/>
								</View>
							)}
						</View>
						<ScrollView className="p-3">
							<View className="flex-row items-start mb-1">
								<View
									className={`px-2 py-1 rounded ${product.is_available ? "bg-green-100" : "bg-red-100"}`}
								>
									<Text
										className={`text-xs font-lexend-medium tracking-tighter-lexend ${product.is_available ? "text-green-800" : "text-red-800"}`}
									>
										{product.is_available
											? "Available"
											: "Unavailable"}
									</Text>
								</View>
							</View>
							<Text
								className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
								numberOfLines={2}
							>
								{product.name}
							</Text>
							<Text
								className="text-xs font-lexend tracking-tighter-lexend text-[#666666] mt-1"
								numberOfLines={2}
							>
								{getLocalizedDescription(product)}
							</Text>
						</ScrollView>
					</View>
				)}
			</TouchableOpacity>
			<Modal
				visible={expanded}
				transparent={true}
				animationType="none"
			>
				<Animated.View
					style={{
						flex: 1,
						backgroundColor: "#C6E3D3",
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
					<View className="flex-1">
						<View className="border-b border-[#333333] p-4">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
									{product.name}
								</Text>
								<TouchableOpacity onPress={toggleExpand}>
									<Feather
										name="x"
										size={24}
										color="black"
									/>
								</TouchableOpacity>
							</View>
							<View className="flex-row items-center">
								<AntDesign
									name="enviromento"
									size={12}
									color="#555"
								/>
								<Text className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555]">
									{product.barangay}
								</Text>
							</View>
						</View>
						<ScrollView ref={scrollViewRef} className="flex-1">
							<View className="w-full h-64">
								{product.images &&
								product.images.length > 0 ? (
										<ScrollView
											horizontal
											pagingEnabled
											showsHorizontalScrollIndicator={
												false
											}
											className="w-full h-full"
										>
											{product.images.map(
												(
													img: string,
													index: number
												) => (
													<View
														key={index}
														className="w-full h-full"
														style={{
															width: "100%"
														}}
													>
														<Image
															source={{
																uri: img
															}}
															className="w-full h-full"
															resizeMode="cover"
														/>
													</View>
												)
											)}
										</ScrollView>
									) : product.image_url ? (
										<Image
											source={{ uri: product.image_url }}
											className="w-full h-full"
											resizeMode="cover"
										/>
									) : (
										<View className="w-full h-full bg-gray-100 items-center justify-center">
											<Feather
												name="package"
												size={40}
												color="#999"
											/>
										</View>
									)}
							</View>
							<View className="p-4">
								<Text className="text-base font-lexend-medium tracking-tighter-lexend text-[#333] mb-2">
									Description
								</Text>
								<View
									className="border-l-4 border-[#FFBB38] pl-2"
									style={{
										maxHeight: isDescriptionExpanded
											? undefined
											: 300
									}}
								>
									<View onLayout={onDescriptionLayout}>
										<Text className="text-base font-lexend tracking-tighter-lexend text-[#333]">
											{getLocalizedDescription(
												product
											) ||
												"No description available"}
										</Text>
									</View>
								</View>
								{shouldShowToggle && (
									<TouchableOpacity
										onPress={toggleDescription}
										className="mt-2 px-4 py-2"
									>
										<Text className="text-sm font-lexend-medium tracking-tighter-lexend text-black underline">
											{isDescriptionExpanded
												? t("location.showLess")
												: t("location.showMore")}
										</Text>
									</TouchableOpacity>
								)}
							</View>
						</ScrollView>
					</View>
				</Animated.View>
			</Modal>
		</View>
	);
};

export default ProductCard;
