import { BottomTabBar } from "@/components/common";
import { ProductCard, Product } from "@/components/home";
import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PLACEHOLDER_PRODUCTS: Product[] = [
	{
		id: "1",
		name: "Handwoven Basket",
		price: 500,
		image: "https://via.placeholder.com/600x400.png?text=Basket",
		description: "Beautifully hand-woven basket made by local artisans."
	},
	{
		id: "2",
		name: "Organic Coconut Oil",
		price: 250,
		image: "https://via.placeholder.com/600x400.png?text=Coconut+Oil",
		description: "Pure organic coconut oil perfect for cooking and skincare."
	},
	{
		id: "3",
		name: "Malinao T-Shirt",
		price: 350,
		image: "https://via.placeholder.com/600x400.png?text=T-Shirt",
		description: "Comfy cotton shirt featuring Malinao landmarks."
	},
	{
		id: "4",
		name: "Local Coffee Beans",
		price: 400,
		image: "https://via.placeholder.com/600x400.png?text=Coffee",
		description: "Freshly roasted beans sourced from nearby farms."
	},
	{
		id: "5",
		name: "Handcrafted Keychain",
		price: 80,
		image: "https://via.placeholder.com/600x400.png?text=Keychain",
		description: "A small souvenir made with love."
	},
	{
		id: "6",
		name: "Bamboo Straw Set",
		price: 120,
		image: "https://via.placeholder.com/600x400.png?text=Bamboo+Straws",
		description: "Eco-friendly bamboo straws with cleaning brush."
	}
];

export default function ProductsScreen() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isGridView, setIsGridView] = useState(true);

	const filteredProducts = useMemo(() => {
		if (!searchQuery) return PLACEHOLDER_PRODUCTS;
		return PLACEHOLDER_PRODUCTS.filter((p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [searchQuery]);

	const numColumns = isGridView ? 2 : 1;

	const renderItem = ({ item }: { item: Product }) => (
		<View
			style={
				isGridView
					? { flex: 1, margin: 4 }
					: { width: "100%", marginVertical: 4 }
			}
		>
			<ProductCard product={item} />
		</View>
	);

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				{/* Header */}
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Products
					</Text>
				</View>

				{/* Search + Toggle Row */}
				<View className="flex-row items-center px-4 py-3 bg-[#faf4f0] border-b border-[#eee]">
					{/* Search Bar */}
					<View className="flex-1 flex-row items-center bg-white border border-[#333333] px-3 py-2 mr-3">
						<Feather name="search" size={18} color="#666" />
						<TextInput
							className="flex-1 ml-2 text-base font-lexend text-black"
							placeholder="Search products..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholderTextColor="#666666"
						/>
					</View>

					{/* Toggle */}
					<TouchableOpacity
						className="border border-[#333333] p-2 bg-white"
						style={shadowStyles.small}
						onPress={() => setIsGridView((prev) => !prev)}
					>
						<AntDesign
							name={isGridView ? "list" : "grid"}
							size={18}
							color="#333"
						/>
					</TouchableOpacity>
				</View>

				{/* Product List */}
				<View className="flex-1 px-2">
					<FlatList
						data={filteredProducts}
						renderItem={renderItem}
						keyExtractor={(item) => item.id}
						numColumns={numColumns}
						showsVerticalScrollIndicator={false}
						key={isGridView ? "GRID" : "LIST"}
						// key prop forces re-render when layout changes
					/>
				</View>

				{/* Bottom Tab Bar */}
				<BottomTabBar activeTab="products" />
			</SafeAreaView>
		</View>
	);
}