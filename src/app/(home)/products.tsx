import { BottomTabBar } from "@/components/common";
import ProductCard from "@/components/home/ProductCard";
import { Product } from "@/lib/types/product";
import { shadowStyles } from "@/lib/utils/styles";
import { ProductService } from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("All");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fetchProducts = useCallback(async () => {
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription
    const unsubscribe = ProductService.subscribeToProducts((payload: any) => {
      console.log('Product change detected:', payload);
      fetchProducts();
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // Normalize barangay names for consistent comparison
  const normalizeBarangay = (name: string) => name.trim().toLowerCase();

  // Get unique barangays from all products (case-insensitive, trimmed)
  const barangays = ["All", ...Array.from(new Set(products
    .map(p => p.barangay?.trim() || '') // Trim whitespace and handle undefined
    .filter(barangay => barangay) // Remove empty strings
    .map(normalizeBarangay) // Normalize for comparison
  ))].sort((a, b) => a.localeCompare(b)); // Sort alphabetically

  // Apply filters to products
  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase().trim();
    const name = product.name.toLowerCase();
    const description = product.description.toLowerCase();
    const productBarangay = normalizeBarangay(product.barangay || '');
    const selectedBarangayNormalized = normalizeBarangay(selectedBarangay);
    
    const matchesSearch = searchLower === '' || 
                         name.includes(searchLower) || 
                         description.includes(searchLower);
    const matchesBarangay = selectedBarangay === "All" || 
                           productBarangay === selectedBarangayNormalized;
    
    return matchesSearch && matchesBarangay;
  });

  const toggleView = () => setViewMode(prev => prev === "grid" ? "list" : "grid");



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
					{/* Grid/List Toggle Section Header */}
					<View className="flex-row justify-between items-center mb-4 mt-4">
						<Text className="text-lg font-lexend-extrabold tracking-tighter-lexend text-black">
							Featured Products
						</Text>
						<TouchableOpacity className="flex-row items-center" onPress={toggleView}>
							<Text className="mr-1 font-lexend tracking-tighter-lexend text-black">
								{viewMode === "grid" ? "List View" : "Grid View"}
							</Text>
							<Feather name={viewMode === "grid" ? "list" : "grid"} size={18} color="black" />
						</TouchableOpacity>
					</View>
				</View>
				<View className="flex-1 p-2">
					{filteredProducts.length > 0 ? (
						viewMode === "grid" ? (
							<View className="flex-row justify-between">
								<View className="w-[48%] space-y-4">
									{filteredProducts
										.slice(0, Math.ceil(filteredProducts.length / 2))
										.map((product) => (
											<ProductCard key={product.id} product={product} listView={false} />
										))}
								</View>
								<View className="w-[48%] space-y-4">
									{filteredProducts
										.slice(Math.ceil(filteredProducts.length / 2))
										.map((product) => (
											<ProductCard key={product.id} product={product} listView={false} />
										))}
								</View>
							</View>
						) : (
							<View className="space-y-4">
								{filteredProducts.map((product) => (
									<ProductCard key={product.id} product={product} listView={true} />
								))}
							</View>
						)
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