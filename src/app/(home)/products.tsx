import { BottomTabBar } from "@/components/common";
import { Product } from "@/lib/types/product";
import { shadowStyles } from "@/lib/utils/styles";
import { ProductService } from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductsScreen() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedBarangay, setSelectedBarangay] = useState<string>("All");

	const fetchProducts = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await ProductService.getAllProducts();
			setProducts(data);
		} catch (err) {
			console.error("Failed to fetch products:", err);
			setError("Failed to load products. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	// Get unique barangays for filters
	const barangays = ["All", ...Array.from(new Set(products.map(p => p.barangay)))];

	// Filter products based on search and filters
	const filteredProducts = products.filter(product => {
		const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesBarangay = selectedBarangay === "All" || product.barangay === selectedBarangay;
		
		return matchesSearch && matchesBarangay;
	});

	const renderProductCard = ({ item }: { item: Product }) => (
		<TouchableOpacity 
			className="bg-white mb-4 mx-2 border border-[#333333] flex-1" 
			style={shadowStyles.standard}
		>
			{item.image ? (
				<Image 
					source={{ uri: item.image }} 
					className="w-full h-32" 
					resizeMode="cover" 
				/>
			) : (
				<View className="w-full h-32 bg-gray-100 items-center justify-center">
					<Feather name="package" size={40} color="#999" />
				</View>
			)}
			<View className="p-3">
				<Text className="text-sm font-lexend-bold tracking-tighter-lexend text-black mb-1" numberOfLines={1}>
					{item.name}
				</Text>
				{item.description ? (
					<Text className="text-xs font-lexend tracking-tighter-lexend text-[#666666] mb-2" numberOfLines={2}>
						{item.description}
					</Text>
				) : null}
				<View className="flex-row justify-between items-center">
					<Text className="text-sm font-lexend-bold tracking-tighter-lexend text-[#fed787]">
						{item.price > 0 ? `₱${item.price.toFixed(2)}` : "No Price"}
					</Text>
					<View className={`px-2 py-1 rounded ${item.is_available ? "bg-green-100" : "bg-red-100"}`}>
						<Text className={`text-xs font-lexend-medium ${item.is_available ? "text-green-800" : "text-red-800"}`}>
							{item.is_available ? "Available" : "Unavailable"}
						</Text>
					</View>
				</View>
				<View className="flex-row items-center mt-1">
					{item.barangay && (
						<Text className="text-xs font-lexend tracking-tighter-lexend text-[#999999] mt-1">
							{item.barangay}
						</Text>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View className="flex-1 bg-[#faf4f0] justify-center items-center">
				<ActivityIndicator size="large" color="#fed787" />
				<Text className="mt-4 font-lexend text-[#666666]">Loading products...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 bg-[#faf4f0] justify-center items-center p-4">
				<Text className="text-[#333333] mb-4 text-center font-lexend tracking-tighter-lexend">
					{error}
				</Text>
				<TouchableOpacity
					className="bg-[#fed787] px-6 py-2 border border-[#333333]"
					style={shadowStyles.standard}
					onPress={fetchProducts}
				>
					<Text className="font-lexend-medium tracking-tighter-lexend text-black">Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="p-4 border-b border-[#eee]">
					<View className="mb-4">
						<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
							Products
						</Text>
					</View>
					
					{/* Search Bar */}
					<View className="flex-row items-center bg-white border border-[#333333] px-3 py-2 mb-3">
						<Feather name="search" size={18} color="#666" />
						<TextInput
							className="flex-1 ml-2 text-base font-lexend text-black"
							placeholder="Search products..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholderTextColor="#666666"
						/>
					</View>

					{/* Barangay Filter */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{barangays.map((barangay) => (
							<TouchableOpacity
								key={barangay}
								className={`px-3 py-1 mr-2 border border-[#333333] ${selectedBarangay === barangay ? "bg-[#fed787]" : "bg-white"}`}
								style={shadowStyles.small}
								onPress={() => setSelectedBarangay(barangay)}
							>
								<Text className="font-lexend-medium tracking-tighter-lexend text-black">
									{barangay}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				<View className="flex-1 p-2">
					{filteredProducts.length > 0 ? (
						<FlatList
							data={filteredProducts}
							renderItem={renderProductCard}
							keyExtractor={(item) => item.id}
							numColumns={2}
							contentContainerStyle={{ paddingBottom: 20 }}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<View className="flex-1 justify-center items-center">
							<AntDesign name="inbox" size={60} color="#fed787" />
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center mt-4">
								{products.length === 0 ? "No Products Found" : "No Matching Products"}
							</Text>
							{products.length > 0 && (
								<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center">
									Try adjusting your search or filter criteria
								</Text>
							)}
						</View>
					)}
				</View>
				<BottomTabBar activeTab="products" />
			</SafeAreaView>
		</View>
	);
} 