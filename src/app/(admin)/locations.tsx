import { BaseText as Text } from "@/components/BaseText";
import { ImageUploader } from "@/components/common/ImageUploader";
import { AntDesign, Feather } from "@expo/vector-icons";
import { LocationService } from "@shared/services";
import { Location } from "@shared/types/supabase";
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

export default function ManageLocationsScreen() {
	const [bannerImageFile, setBannerImageFile] = useState<any>(null);
	const [image360File, setImage360File] = useState<any>(null);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingLocation, setEditingLocation] =
		useState<Location | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		description_fil: "",
		description_akl: "",
		street: "",
		barangay: "",
		town: "",
		bannerImage: "",
		image360: "",
		latitude: "",
		longitude: ""
	});

	const fetchLocations = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await LocationService.getLocations();
			setLocations(data);
		} catch (err) {
			console.error("Failed to fetch Tourist spots:", err);
			setError("Failed to load tourist spots. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLocations();
	}, []);

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			description_fil: "",
			description_akl: "",
			street: "",
			barangay: "",
			town: "",
			bannerImage: "",
			image360: "",
			latitude: "",
			longitude: ""
		});
		setBannerImageFile(null);
		setImage360File(null);
	};

	const openAddModal = () => {
		resetForm();
		setEditingLocation(null);
		setModalVisible(true);
	};

	const openEditModal = (location: Location) => {
		setEditingLocation(location);
		setFormData({
			name: location.name,
			description: location.description,
			description_fil: location.description_fil || "",
			description_akl: location.description_akl || "",
			street: location.address.street || "",
			barangay: location.address.barangay || "",
			town: location.address.town || "",
			bannerImage: location.image.banner,
			image360: location.image[360] || "",
			latitude: String(location.coordinates.latitude),
			longitude: String(location.coordinates.longitude)
		});
		setModalVisible(true);
	};

	const handleSave = async () => {
		try {
			setLoading(true);

			const locationData = {
				name: formData.name,
				description: formData.description,
				description_fil: formData.description_fil,
				description_akl: formData.description_akl,
				address: {
					street: formData.street,
					barangay: formData.barangay,
					town: formData.town
				},
				image: {
					banner: formData.bannerImage,
					360: formData.image360
				},
				coordinates: {
					latitude: parseFloat(formData.latitude),
					longitude: parseFloat(formData.longitude)
				}
			};

			if (editingLocation) {
				// Update existing location with image uploads
				await LocationService.updateLocation(
					editingLocation.id,
					locationData,
					bannerImageFile,
					image360File
				);
			} else {
				// Create new location with image uploads
				await LocationService.createLocation(
					locationData,
					bannerImageFile,
					image360File
				);
			}

			await fetchLocations();
			setModalVisible(false);
			resetForm();
		} catch (err) {
			console.error("Error saving location:", err);
			Alert.alert(
				"Error",
				"Failed to save location. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (locationId: string) => {
		Alert.alert(
			"Confirm Delete",
			"Are you sure you want to delete this tourist spot? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true);
							await LocationService.deleteLocation(
								locationId
							);
							await fetchLocations();
						} catch (err) {
							console.error(
								"Error deleting tourist spot:",
								err
							);
							Alert.alert(
								"Error",
								"Failed to delete tourist spot. Please try again."
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
				<View className="flex-row items-center justify-between border-b border-[#eee] p-4 pb-6">
					<Text
						className="android:font-normal racking-tighter-lexend text-2xl text-black"
						fontStyle="extrabold"
					>
						Manage Tourist Spots
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="mb-4 flex-row items-center justify-center rounded-xl border border-[#333333] bg-[#FFBB38] p-4"
						onPress={openAddModal}
					>
						<AntDesign name="plus" size={20} color="black" />
						<Text
							className="ml-2 tracking-tighter-lexend text-black"
							fontStyle="medium"
						>
							Add New Tourist Spot
						</Text>
					</TouchableOpacity>
					{loading && locations.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator
								size="large"
								color="#fed787"
							/>
							<Text className="mt-4 text-[#666666]">
								Loading Tourist Spot...
							</Text>
						</View>
					) : error ? (
						<View className="items-center justify-center py-8">
							<AntDesign
								name="exclamationcircle"
								size={40}
								color="#fed787"
							/>
							<Text className="mt-4 text-[#666666]">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-4 border border-[#333333] bg-[#fed787] px-4 py-2"
								onPress={fetchLocations}
							>
								<Text
									className="text-black"
									fontStyle="medium"
								>
									Retry
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView
							contentContainerStyle={{
								paddingBottom: 80
							}}
						>
							{locations.map((location) => (
								<View
									key={location.id}
									className="mb-4 rounded-xl border border-[#333333] bg-white"
								>
									<View className="flex-row">
										<Image
											source={{
												uri: location.image.banner
											}}
											className="h-24 w-24"
											resizeMode="cover"
										/>
										<View className="flex-1 p-3">
											<Text
												className="text-base tracking-tighter-lexend text-black"
												fontStyle="bold"
											>
												{location.name}
											</Text>
											<Text
												numberOfLines={2}
												className="mt-1 text-sm tracking-tighter-lexend text-[#666666]"
											>
												{location.description}
											</Text>
										</View>
									</View>
									<View className="flex-row border-t border-[#eee] p-2">
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												openEditModal(location)
											}
										>
											<Text
												className="text-[#333333]"
												fontStyle="medium"
											>
												<Feather
													name="edit"
													size={16}
												/>{" "}
												Edit
											</Text>
										</TouchableOpacity>
										<View className="mx-2 border-r border-[#eee]" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												handleDelete(location.id)
											}
										>
											<Text
												className="text-[#fe5b62]"
												fontStyle="medium"
											>
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
				<SafeAreaView className="flex-1 bg-[#E1F2E9]">
					<View className="flex-row items-center justify-between border-b border-[#eee] p-4">
						<Text
							className="android:font-normal text-2xl tracking-tighter-lexend text-black"
							fontStyle="extrabold"
						>
							{editingLocation
								? "Edit tourist spot"
								: "Add new tourist spot"}
						</Text>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}
						>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<ScrollView className="p-4">
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
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
								className="border border-[#333333] bg-white p-3 text-black"
								placeholder="Tourist spot name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
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
								className="border border-[#333333] bg-white p-3 text-black"
								placeholder="Tourist spot description"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
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
								className="border border-[#333333] bg-white p-3 text-black"
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
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
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
								className="border border-[#333333] bg-white p-3 text-black"
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
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
								ADDRESS
							</Text>
							<TextInput
								value={formData.street}
								onChangeText={(text) =>
									setFormData({
										...formData,
										street: text
									})
								}
								className="mb-2 border border-[#333333] bg-white p-3 text-black"
								placeholder="Street (can be blank)"
								placeholderTextColor="#666666"
							/>
							<TextInput
								value={formData.barangay}
								onChangeText={(text) =>
									setFormData({
										...formData,
										barangay: text
									})
								}
								className="mb-2 border border-[#333333] bg-white p-3 text-black"
								placeholder="Barangay"
								placeholderTextColor="#666666"
							/>
							<TextInput
								value={formData.town}
								onChangeText={(text) =>
									setFormData({
										...formData,
										town: text
									})
								}
								className="border border-[#333333] bg-white p-3 text-black"
								placeholder="Town"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
								IMAGES
							</Text>
							{/* Banner Image Uploader */}
							<ImageUploader
								entityType="locations"
								entityId={editingLocation?.id || "new"}
								fileType="banner"
								currentImageUrl={formData.bannerImage}
								onImageUploaded={(result) => {
									setFormData({
										...formData,
										bannerImage: result.url!
									});
								}}
								onImageDeleted={() => {
									setFormData({
										...formData,
										bannerImage: ""
									});
								}}
								aspect={[4, 3]}
								placeholder="Upload banner image (4:3 ratio)"
							/>

							{/* 360° Image Uploader */}
							<ImageUploader
								entityType="locations"
								entityId={editingLocation?.id || "new"}
								fileType="360"
								currentImageUrl={formData.image360}
								onImageUploaded={(result) => {
									setFormData({
										...formData,
										image360: result.url!
									});
								}}
								onImageDeleted={() => {
									setFormData({
										...formData,
										image360: ""
									});
								}}
								aspect={[16, 9]}
								placeholder="Upload 360° image (16:9 ratio)"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
								COORDINATES
							</Text>
							<View className="flex-row space-x-2">
								<TextInput
									value={formData.latitude}
									onChangeText={(text) =>
										setFormData({
											...formData,
											latitude: text
										})
									}
									className="flex-1 border border-[#333333] bg-white p-3 text-black"
									placeholder="Latitude"
									placeholderTextColor="#666666"
									keyboardType="numeric"
								/>
								<TextInput
									value={formData.longitude}
									onChangeText={(text) =>
										setFormData({
											...formData,
											longitude: text
										})
									}
									className="flex-1 border border-[#333333] bg-white p-3 text-black"
									placeholder="Longitude"
									placeholderTextColor="#666666"
									keyboardType="numeric"
								/>
							</View>
						</View>
						<TouchableOpacity
							className="mb-4 items-center justify-center rounded-3xl border border-[#333333] bg-[#FFBB38] p-4"
							onPress={handleSave}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator
									size="small"
									color="#333333"
								/>
							) : (
								<Text
									className="tracking-tighter-lexend text-black"
									fontStyle="medium"
								>
									Save Tourist Spot
								</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</View>
	);
}
