import { Product } from "@/lib/types/supabase";
import { ProductService } from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageProductsScreen() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(
		null
	);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		description_fil: "",
		description_akl: "",
		image_url: "",
		barangay: "",
		is_available: true
	});

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

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			description_fil: "",
			description_akl: "",
			image_url: "",
			barangay: "",
			is_available: true
		});
	};

	const openAddModal = () => {
		resetForm();
		setEditingProduct(null);
		setModalVisible(true);
	};

	const openEditModal = (product: Product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			description: product.description,
			description_fil: product.description_fil || "",
			description_akl: product.description_akl || "",
			image_url: product.image_url,
			barangay: product.barangay,
			is_available: product.is_available
		});
		setModalVisible(true);
	};

	const handleSave = async () => {
		if (
			!formData.name.trim() ||
			!formData.description.trim() ||
			!formData.barangay.trim()
		) {
			Alert.alert(
				"Missing Information",
				"Please fill in all required fields (name, description, barangay)."
			);
			return;
		}
		try {
			setLoading(true);
			const productData = {
				name: formData.name,
				description: formData.description,
				description_fil: formData.description_fil,
				description_akl: formData.description_akl,
				image_url: formData.image_url,
				barangay: formData.barangay,
				is_available: formData.is_available
			};
			if (editingProduct) {
				await ProductService.updateProduct(
					editingProduct.id,
					productData
				);
				Alert.alert("Success", "Product updated successfully.");
			} else {
				await ProductService.createProduct(productData);
				Alert.alert("Success", "Product added successfully.");
			}
			await fetchProducts();
			setModalVisible(false);
			resetForm();
		} catch (err) {
			console.error("Error saving product:", err);
			Alert.alert(
				"Error",
				"Failed to save product. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (productId: string) => {
		Alert.alert(
			"Confirm Delete",
			"Are you sure you want to delete this product? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true);
							await ProductService.deleteProduct(productId);
							await fetchProducts();
							Alert.alert(
								"Success",
								"Product deleted successfully."
							);
						} catch (err) {
							console.error("Error deleting product:", err);
							Alert.alert(
								"Error",
								"Failed to delete product. Please try again."
							);
						} finally {
							setLoading(false);
						}
					}
				}
			]
		);
	};

	return (
		<View className="flex-1 bg-[#C6E3D3]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Manage Products
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="bg-[#FFBB38] p-4 mb-4 flex-row items-center justify-center border border-[#333333] rounded-xl"
						
						onPress={openAddModal}
					>
						<AntDesign name="plus" size={20} color="black" />
						<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
							Add New Product
						</Text>
					</TouchableOpacity>
					{loading && products.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator
								size="large"
								color="#fed787"
							/>
							<Text className="mt-4 font-lexend text-[#666666]">
								Loading products...
							</Text>
						</View>
					) : error ? (
						<View className="items-center justify-center py-8">
							<AntDesign
								name="exclamationcircle"
								size={40}
								color="#fed787"
							/>
							<Text className="mt-4 font-lexend text-[#666666]">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-4 bg-[#fed787] px-4 py-2 border border-[#333333]"
								onPress={fetchProducts}
							>
								<Text className="font-lexend-medium text-black">
									Retry
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView>
							{products.map((product) => (
								<View
									key={product.id}
									className="bg-white mb-4 border border-[#333333] rounded-xl"
									
								>
									<View className="flex-row">
										{product.image_url ? (
											<Image
												source={{ uri: product.image_url }}
												className="w-24 h-24"
												resizeMode="cover"
											/>
										) : (
											<View className="w-24 h-24 bg-gray-100 items-center justify-center">
												<Feather name="package" size={32} color="#999" />
											</View>
										)}

										<View className="flex-1 p-3">
											<Text
												className="text-base font-lexend-bold tracking-tighter-lexend text-black"
												numberOfLines={1}
											>
												{product.name}
											</Text>
											<Text
												className="text-sm font-lexend tracking-tighter-lexend text-[#555555] mt-1"
												numberOfLines={1}
											>
												{product.barangay}
											</Text>
											<View className="flex-row items-center mt-1">
												<View
													className={`w-3 h-3 rounded-full mr-1 ${product.is_available ? "bg-green-500" : "bg-red-500"}`}
												/>
												<Text className="text-xs font-lexend text-[#555555]">
													{product.is_available ? "Available" : "Not Available"}
												</Text>
											</View>
										</View>
									</View>
									<View className="flex-row border-t border-[#eee] p-2">
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() => openEditModal(product)}
										>
											<Text className="font-lexend-medium text-[#333333]">
												<Feather name="edit" size={16} /> Edit
											</Text>
										</TouchableOpacity>
										<View className="border-r border-[#eee] mx-2" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() => handleDelete(product.id)}
										>
											<Text className="font-lexend-medium text-[#fe5b62]">
												<Feather name="trash-2" size={16} /> Delete
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</ScrollView>
					)}
				</View>
			</SafeAreaView>
			<Modal visible={modalVisible} animationType="slide">
				<SafeAreaView className="flex-1 bg-[#E1F2E9]">
					<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
						<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
							{editingProduct
								? "Edit Product"
								: "Add Product"}
						</Text>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}
						>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<ScrollView className="p-4">
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								NAME
							</Text>
							<TextInput
								value={formData.name}
								onChangeText={(text) =>
									setFormData({
										...formData,
										name: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Product name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								DESCRIPTION
							</Text>
							<TextInput
								value={formData.description}
								onChangeText={(text) =>
									setFormData({
										...formData,
										description: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Product description"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								DESCRIPTION (FIL)
							</Text>
							<TextInput
								value={formData.description_fil}
								onChangeText={(text) =>
									setFormData({
										...formData,
										description_fil: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Filipino description (optional)"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								DESCRIPTION (AKL)
							</Text>
							<TextInput
								value={formData.description_akl}
								onChangeText={(text) =>
									setFormData({
										...formData,
										description_akl: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Aklanon description (optional)"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								IMAGE URL
							</Text>
							<TextInput
								value={formData.image_url}
								onChangeText={(text) =>
									setFormData({
										...formData,
										image_url: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Image URL"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								BARANGAY
							</Text>
							<TextInput
								value={formData.barangay}
								onChangeText={(text) =>
									setFormData({
										...formData,
										barangay: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Barangay"
								placeholderTextColor="#666666"
							/>
						</View>

						<View className="mb-4 flex-row items-center">
							<Text className="text-sm font-lexend-medium text-[#666666] mr-4">
								AVAILABLE
							</Text>
							<TouchableOpacity
								onPress={() =>
									setFormData({
										...formData,
										is_available:
											!formData.is_available
									})
								}
								className={`w-10 h-6 rounded-full border border-[#333333] ${formData.is_available ? "bg-[#FFBB38]" : "bg-white"} items-center justify-center`}
							>
								<View
									className={`w-4 h-4 rounded-full ${formData.is_available ? "bg-black ml-4" : "bg-[#eee] ml-0"}`}
								/>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							className="bg-[#FFBB38] p-4 mb-4 items-center justify-center border border-[#333333] rounded-3xl"
							
							onPress={handleSave}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator
									size="small"
									color="#333333"
								/>
							) : (
								<Text className="font-lexend-medium tracking-tighter-lexend text-black">
									Save Product
								</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</View>
	);
}
