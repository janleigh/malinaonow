import { BaseText as Text } from "@/components/BaseText";
import { BottomTabBar } from "@/components/common";
import { ProductCard } from "@/components/home";
import { useTranslation } from "@/lib/context/TranslationContext";
import { Product } from "@/lib/types/supabase";
import { ProductService } from "@/services/ProductService";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";
import {
	ActivityIndicator,
	FlatList,
	ListRenderItem,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
	ViewToken
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ViewMode = "grid" | "list";

const filterProducts = (
	products: Product[],
	searchQuery: string,
	selectedBarangay: string
) => {
	const searchLower = searchQuery.toLowerCase().trim();
	const selectedBarangayLower = selectedBarangay.toLowerCase();

	if (!searchLower && selectedBarangay === "All") {
		return products;
	}

	return products.filter((product) => {
		const matchesSearch =
			!searchLower ||
			product.name.toLowerCase().includes(searchLower) ||
			product.description.toLowerCase().includes(searchLower);

		const productBarangay =
			product.barangay?.trim().toLowerCase() || "";
		const matchesBarangay =
			selectedBarangay === "All" ||
			productBarangay === selectedBarangayLower;

		return matchesSearch && matchesBarangay;
	});
};

const ITEM_HEIGHT = 300; // Approximate height of a single item in the list

const ProductsScreen = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [selectedBarangay, setSelectedBarangay] = useState("All");
	const [error, setError] = useState<string | null>(null);
	const flatListRef = useRef<FlatList>(null);
	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 50,
		minimumViewTime: 300
	}).current;
	const { t } = useTranslation();

	const fetchProducts = useCallback(async () => {
		if (!refreshing) setLoading(true);
		setError(null);

		try {
			const data = await ProductService.getAllProducts();
			setProducts(data);
		} catch (err) {
			console.error("Failed to fetch products:", err);
			setError("Failed to load products. Please try again.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [refreshing]);

	useEffect(() => {
		fetchProducts();

		const unsubscribe = ProductService.subscribeToProducts(
			(payload: any) => {
				console.log("Product change detected:", payload);
				fetchProducts();
			}
		);

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [fetchProducts]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchProducts();
	}, [fetchProducts]);

	const barangays = useMemo(() => {
		const uniqueBarangays = new Set<string>();
		products.forEach((product) => {
			if (product.barangay?.trim()) {
				uniqueBarangays.add(product.barangay.trim());
			}
		});
		return [
			"All",
			...Array.from(uniqueBarangays).sort((a, b) =>
				a.localeCompare(b)
			)
		];
	}, [products]);

	const filteredProducts = useMemo(
		() => filterProducts(products, searchQuery, selectedBarangay),
		[products, searchQuery, selectedBarangay]
	);

	const toggleView = useCallback(
		() => setViewMode((prev) => (prev === "grid" ? "list" : "grid")),
		[]
	);

	const getItemLayout = useCallback(
		(data: any, index: number) => ({
			length: ITEM_HEIGHT,
			offset: ITEM_HEIGHT * index,
			index
		}),
		[]
	);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {}
	).current;

	const viewabilityConfigCallbackPairs = useRef([
		{
			viewabilityConfig,
			onViewableItemsChanged
		}
	]);

	const renderProductItem = useCallback<ListRenderItem<Product>>(
		({ item }) => (
			<ProductCard
				key={item.id}
				product={item}
				listView={viewMode === "list"}
			/>
		),
		[viewMode]
	);

	const renderGridColumns = useCallback(() => {
		const halfLength = Math.ceil(filteredProducts.length / 2);
		const firstColumn = filteredProducts.slice(0, halfLength);
		const secondColumn = filteredProducts.slice(halfLength);

		return (
			<View className="flex-row justify-between">
				<View className="w-[48%] space-y-4">
					{firstColumn.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							listView={false}
						/>
					))}
				</View>
				<View className="w-[48%] space-y-4">
					{secondColumn.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							listView={false}
						/>
					))}
				</View>
			</View>
		);
	}, [filteredProducts]);

	return (
		<View className="flex-1 bg-[#C6E3D3]">
			<SafeAreaView className="flex-1">
				<View className="border-b border-[#eee] p-4">
					<View className="mb-4">
						<Text className="android:font-normal text-2xl font-extrabold tracking-tighter-lexend text-black">
							{t("products.title")}
						</Text>
					</View>
					<View className="mb-3 flex-row items-center rounded-xl border border-[#333333] bg-white px-3 py-2">
						<Feather name="search" size={18} color="#666" />
						<TextInput
							className="ml-2 flex-1 font-lexend-medium text-base tracking-tighter-lexend text-black"
							placeholder={t("products.searchPlaceholder")}
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholderTextColor="#666666"
						/>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
					>
						{barangays.map((barangay) => (
							<TouchableOpacity
								key={barangay}
								className={`mr-2 rounded-2xl border border-[#333333] px-3 py-1 ${selectedBarangay === barangay ? "bg-[#FFFD87]" : "bg-white"}`}
								onPress={() =>
									setSelectedBarangay(barangay)
								}
							>
								<Text className="tracking-tighter-lexend text-black">
									{barangay}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
					<View className="mt-4 flex-row items-center justify-between">
						<Text className="text-lg tracking-tighter-lexend text-black">
							{t("products.featuredProducts")}
						</Text>
						<TouchableOpacity
							className="flex-row items-center"
							onPress={toggleView}
						>
							<Text className="mr-1 tracking-tighter-lexend text-black">
								{viewMode === "grid"
									? "List View"
									: "Grid View"}
							</Text>
							<Feather
								name={
									viewMode === "grid" ? "list" : "grid"
								}
								size={18}
								color="black"
							/>
						</TouchableOpacity>
					</View>
				</View>
				<View className="flex-1 px-2">
					{loading ? (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator
								size="large"
								color="#fed787"
							/>
						</View>
					) : error ? (
						<View className="flex-1 items-center justify-center p-4">
							<Text className="mb-2 text-center text-red-500">
								{error}
							</Text>
							<TouchableOpacity
								onPress={fetchProducts}
								className="rounded-md bg-[#fed787] px-4 py-2"
							>
								<Text className="font-lexend">Retry</Text>
							</TouchableOpacity>
						</View>
					) : filteredProducts.length > 0 ? (
						viewMode === "grid" ? (
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{
									paddingBottom: 80
								}}
							>
								{renderGridColumns()}
							</ScrollView>
						) : (
							<FlatList
								ref={flatListRef}
								data={filteredProducts}
								renderItem={renderProductItem}
								keyExtractor={(item) => item.id}
								initialNumToRender={4}
								maxToRenderPerBatch={6}
								updateCellsBatchingPeriod={50}
								windowSize={5}
								getItemLayout={getItemLayout}
								viewabilityConfig={viewabilityConfig}
								viewabilityConfigCallbackPairs={
									viewabilityConfigCallbackPairs.current
								}
								contentContainerStyle={[
									styles.listContent,
									{ paddingBottom: 80 }
								]}
								showsVerticalScrollIndicator={false}
							/>
						)
					) : (
						<View className="flex-1 items-center justify-center">
							<AntDesign
								name="inbox"
								size={60}
								color="#fed787"
							/>
							<Text className="mb-2 mt-4 text-center text-xl tracking-tighter-lexend text-black">
								{products.length === 0
									? t("products.noProducts")
									: t("products.noMatchingProducts")}
							</Text>
						</View>
					)}
				</View>
				<BottomTabBar activeTab="products" />
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	listContent: {
		paddingBottom: 20
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20
	},
	retryButton: {
		backgroundColor: "#fed787",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 4,
		marginTop: 10
	}
});

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error in ProductsScreen:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.errorContainer}>
					<AntDesign
						name="exclamationcircle"
						size={48}
						color="#ff4d4f"
					/>
					<Text className="mt-4 text-center text-lg text-red-500">
						Something went wrong. Please try again.
					</Text>
				</View>
			);
		}

		return this.props.children;
	}
}

export default function ProductsScreenWithErrorBoundary() {
	return (
		<ErrorBoundary>
			<ProductsScreen />
		</ErrorBoundary>
	);
}
