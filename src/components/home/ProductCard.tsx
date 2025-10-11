import { BaseText as Text } from "@/components/BaseText";
import { useTranslation } from "@/hooks/useTranslation";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Product } from "@shared/types/supabase";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Image,
	LayoutChangeEvent,
	Modal,
	ScrollView,
	TouchableOpacity,
	View
} from "react-native";

export const ProductCard = ({
	product,
	listView = false
}: {
	product: Product;
	listView?: boolean;
	isBookmarked?: boolean;
	onToggleBookmark?: (productId: string, newStatus: boolean) => void;
}) => {
	const [expanded, setExpanded] = useState(false);
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

	const getLocalizedDescription = (prod: Product): string => {
		return language === "fil" && prod.description_fil
			? prod.description_fil
			: language === "akl" && prod.description_akl
				? prod.description_akl
				: prod.description;
	};

	return (
		<View className="mb-2">
			<TouchableOpacity
				key={product.id}
				className="overflow-hidden rounded-xl border border-[#333333] bg-white"
				onPress={toggleExpand}>
				{listView ? (
					<View className="flex-row">
						<View className="h-24 w-1/3">
							{product.image_url ? (
								<Image
									source={{ uri: product.image_url }}
									className="h-full w-full"
									resizeMode="cover"
								/>
							) : (
								<View className="h-full w-full items-center justify-center bg-gray-100">
									<Feather
										name="package"
										size={40}
										color="#999"
									/>
								</View>
							)}
						</View>
						<ScrollView className="flex-1 p-3">
							<View className="flex-row items-center">
								<Text
									className="font-lexend-extrabold tracking-tighter-lexend text-sm text-black"
									numberOfLines={1}
									fontStyle="extrabold">
									{product.name}
								</Text>
								<View
									className={`rounded px-2 py-1 ${product.is_available ? "bg-green-100" : "bg-red-100"} ml-2`}>
									<Text
										className={`font-lexend-medium tracking-tighter-lexend text-xs ${product.is_available ? "text-green-800" : "text-red-800"}`}
										fontStyle="medium">
										{product.is_available
											? "Available"
											: "Unavailable"}
									</Text>
								</View>
							</View>
							<View className="mb-1 flex-row items-center px-1">
								<AntDesign
									name="enviromento"
									size={10}
									color="#555"
								/>
								<Text
									className="tracking-tighter-lexend ml-1 text-xs text-[#555]"
									numberOfLines={1}>
									{product.barangay}
								</Text>
							</View>
							<Text
								className="tracking-tighter-lexend mt-1 text-xs text-[#666666]"
								numberOfLines={1}>
								{getLocalizedDescription(product)}
							</Text>
						</ScrollView>
					</View>
				) : (
					<View>
						<View className="h-32 w-full">
							{product.image_url ? (
								<Image
									source={{ uri: product.image_url }}
									className="h-full w-full"
									resizeMode="cover"
								/>
							) : (
								<View className="h-full w-full items-center justify-center bg-gray-100">
									<Feather
										name="package"
										size={40}
										color="#999"
									/>
								</View>
							)}
						</View>
						<ScrollView className="p-3">
							<View className="mb-1 flex-row items-start">
								<View
									className={`rounded px-2 py-1 ${product.is_available ? "bg-green-100" : "bg-red-100"}`}>
									<Text
										className={`font-lexend-medium tracking-tighter-lexend text-xs ${product.is_available ? "text-green-800" : "text-red-800"}`}
										fontStyle="medium">
										{product.is_available
											? "Available"
											: "Unavailable"}
									</Text>
								</View>
							</View>
							<Text
								className="font-lexend-extrabold tracking-tighter-lexend text-sm text-black"
								numberOfLines={2}
								fontStyle="extrabold">
								{product.name}
							</Text>
							<Text
								className="tracking-tighter-lexend mt-1 text-xs text-[#666666]"
								numberOfLines={2}>
								{getLocalizedDescription(product)}
							</Text>
						</ScrollView>
					</View>
				)}
			</TouchableOpacity>
			<Modal
				visible={expanded}
				transparent={true}
				animationType="none">
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
					}}>
					<View className="flex-1">
						<View className="border-b border-[#333333] p-4">
							<View className="mb-2 flex-row items-center justify-between">
								<Text
									className="font-lexend-bold tracking-tighter-lexend text-xl text-black"
									fontStyle="bold">
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
								<Text className="tracking-tighter-lexend ml-1 text-sm text-[#555]">
									{product.barangay}
								</Text>
							</View>
						</View>
						<ScrollView ref={scrollViewRef} className="flex-1">
							<View className="h-64 w-full">
								{product.images &&
								product.images.length > 0 ? (
									<ScrollView
										horizontal
										pagingEnabled
										showsHorizontalScrollIndicator={
											false
										}
										className="h-full w-full">
										{product.images.map(
											(
												img: string,
												index: number
											) => (
												<View
													key={index}
													className="h-full w-full"
													style={{
														width: "100%"
													}}>
													<Image
														source={{
															uri: img
														}}
														className="h-full w-full"
														resizeMode="cover"
													/>
												</View>
											)
										)}
									</ScrollView>
								) : product.image_url ? (
									<Image
										source={{ uri: product.image_url }}
										className="h-full w-full"
										resizeMode="cover"
									/>
								) : (
									<View className="h-full w-full items-center justify-center bg-gray-100">
										<Feather
											name="package"
											size={40}
											color="#999"
										/>
									</View>
								)}
							</View>
							<View className="p-4">
								<Text
									className="font-lexend-medium tracking-tighter-lexend mb-2 text-base text-[#333]"
									fontStyle="medium">
									Description
								</Text>
								<View
									className="border-l-4 border-[#FFBB38] pl-2"
									style={{
										maxHeight: isDescriptionExpanded
											? undefined
											: 300
									}}>
									<View onLayout={onDescriptionLayout}>
										<Text className="tracking-tighter-lexend text-base text-[#333]">
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
										className="mt-2 px-4 py-2">
										<Text
											className="font-lexend-medium tracking-tighter-lexend text-sm text-black underline"
											fontStyle="medium">
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
