import { BaseText as Text } from "@/components/BaseText";
import { ImageUploader } from "@/components/common/ImageUploader";
import { AntDesign, Feather } from "@expo/vector-icons";
import { ProductService } from "@shared/services";
import { Product } from "@shared/types/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageProductsScreen() {
	const [mainImageFile, setMainImageFile] = useState<any>(null);
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
		setMainImageFile(null);
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
		setMainImageFile(null);
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
					productData,
					mainImageFile
				);
				Alert.alert("Success", "Product updated successfully.");
			} else {
				await ProductService.createProduct(
					productData,
					mainImageFile
				);
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
		<View className="flex-1 bg-background">
			<SafeAreaView className="flex-1">
				<View className="flex-row items-center justify-between p-4">
					<Text
						className="android:font-normal text-2xl text-text"
						fontName="Montserrat_700Bold">
						Manage Products
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="#f7f7f7" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="mb-4 flex-row items-center justify-center rounded-xl border border-line bg-primary p-3"
						onPress={openAddModal}>
						<AntDesign name="plus" size={20} color="black" />
						<Text
							className="ml-2 mt-0.5 text-black"
							fontName="Montserrat_700Bold">
							Add New Product
						</Text>
					</TouchableOpacity>
					{loading && products.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator
								size="large"
								color="#0ff6be"
							/>
							<Text
								className="mt-4 text-text-inactive"
								fontName="Poppins_500Medium">
								Loading products...
							</Text>
						</View>
					) : error ? (
						<View className="items-center justify-center py-8">
							<AntDesign
								name="exclamationcircle"
								size={40}
								color="#0ff6be"
							/>
							<Text
								className="mt-4 text-text-inactive"
								fontName="Poppins_500Medium">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-4 rounded-lg border border-line bg-primary px-4 py-2"
								onPress={fetchProducts}>
								<Text
									className="text-black"
									fontName="Montserrat_700Bold">
									Retry
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView>
							{products.map((product) => (
								<View
									key={product.id}
									className="mb-4 rounded-xl border border-line bg-surface">
									<View className="flex-row">
										{product.image_url ? (
											<Image
												source={{
													uri: product.image_url
												}}
												className="h-24 w-24"
												resizeMode="cover"
											/>
										) : (
											<View className="h-24 w-24 items-center justify-center bg-lighterBackground">
												<Feather
													name="package"
													size={32}
													color="#cacbca"
												/>
											</View>
										)}

										<View className="flex-1 p-3">
											<Text
												className="text-base text-text"
												numberOfLines={1}
												fontName="Montserrat_700Bold">
												{product.name}
											</Text>
											<Text
												className="mt-1 text-sm text-text-inactive"
												numberOfLines={1}
												fontName="Poppins_500Medium">
												{product.barangay}
											</Text>
											<View className="mt-1 flex-row items-center">
												<View
													className={`mr-1 h-3 w-3 rounded-full ${product.is_available ? "bg-green-500" : "bg-red-500"}`}
												/>
												<Text
													className="text-xs text-text-inactive"
													fontName="Poppins_500Medium">
													{product.is_available
														? "Available"
														: "Not Available"}
												</Text>
											</View>
										</View>
									</View>
									<View className="flex-row border-t border-line p-2">
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												openEditModal(product)
											}>
											<Text
												className="text-text-inactive"
												fontName="Poppins_500Medium">
												<Feather
													name="edit"
													size={16}
												/>{" "}
												Edit
											</Text>
										</TouchableOpacity>
										<View className="mx-2 border-r border-line" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												handleDelete(product.id)
											}>
											<Text
												className="text-[#fe5b62]"
												fontName="Poppins_500Medium">
												<Feather
													name="trash-2"
													size={16}
												/>{" "}
												Delete
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
				<SafeAreaView className="flex-1 bg-background">
					<View className="flex-row items-center justify-between p-4">
						<Text
							className="android:font-normal text-2xl text-text"
							fontName="Montserrat_700Bold">
							{editingProduct
								? "Edit Product"
								: "Add Product"}
						</Text>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}>
							<Feather name="x" size={24} color="#f7f7f7" />
						</TouchableOpacity>
					</View>
					<ScrollView className="p-4">
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className="rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Product name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className="rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Product description"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className="rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Filipino description (optional)"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className="rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Aklanon description (optional)"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
								PRODUCT IMAGES
							</Text>
							{/* Main Product Image Uploader */}
							<ImageUploader
								entityType="products"
								entityId={editingProduct?.id || "new"}
								fileType="main"
								currentImageUrl={formData.image_url}
								onImageUploaded={(result) => {
									setFormData({
										...formData,
										image_url: result.url!
									});
								}}
								onImageDeleted={() => {
									setFormData({
										...formData,
										image_url: ""
									});
								}}
								placeholder="Upload main product image"
							/>
							<TextInput
								value={formData.barangay}
								onChangeText={(text) =>
									setFormData({
										...formData,
										barangay: text
									})
								}
								className="mt-4 rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Barangay"
								placeholderTextColor="#666666"
							/>
						</View>

						<View className="mb-4 flex-row items-center">
							<Text
								className="mr-4 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className={`h-6 w-10 rounded-full border border-line ${formData.is_available ? "bg-primary" : "bg-surface"} items-center justify-center`}>
								<View
									className={`h-4 w-4 rounded-full ${formData.is_available ? "ml-4 bg-black" : "ml-0 bg-lighterBackground"}`}
								/>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							className="mb-4 items-center justify-center rounded-3xl border border-line bg-primary p-3"
							onPress={handleSave}
							disabled={loading}>
							{loading ? (
								<ActivityIndicator
									size="small"
									color="#161719"
								/>
							) : (
								<Text
									className="android:font-normal text-base text-black"
									fontName="Poppins_700Bold">
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
