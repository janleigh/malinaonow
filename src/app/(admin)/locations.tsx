import { supabase } from "@/api/supabase";
import { Location } from "@/lib/types/supabase";
import { shadowStyles } from "@/lib/utils/styles";
import { LocationService } from "@/services";
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

export default function ManageLocationsScreen() {
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingLocation, setEditingLocation] = useState<Location | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
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
			console.error("Failed to fetch locations:", err);
			setError("Failed to load locations. Please try again.");
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
			street: "",
			barangay: "",
			town: "",
			bannerImage: "",
			image360: "",
			latitude: "",
			longitude: ""
		});
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
				const { error } = await supabase.from("locations").update(locationData).eq("id", editingLocation.id);

				if (error) throw error;
			} else {
				const { error } = await supabase.from("locations").insert([locationData]);

				if (error) throw error;
			}

			await fetchLocations();
			setModalVisible(false);
			resetForm();
		} catch (err) {
			console.error("Error saving location:", err);
			Alert.alert("Error", "Failed to save location. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (locationId: string) => {
		Alert.alert("Confirm Delete", "Are you sure you want to delete this location? This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						setLoading(true);
						const { error } = await supabase.from("locations").delete().eq("id", locationId);

						if (error) throw error;

						await fetchLocations();
					} catch (err) {
						console.error("Error deleting location:", err);
						Alert.alert("Error", "Failed to delete location. Please try again.");
					} finally {
						setLoading(false);
					}
				}
			}
		]);
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 pb-6 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Manage Locations
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="bg-[#fed787] p-4 mb-4 flex-row items-center justify-center border border-[#333333]"
						style={shadowStyles.standard}
						onPress={openAddModal}
					>
						<AntDesign name="plus" size={20} color="black" />
						<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
							Add New Location
						</Text>
					</TouchableOpacity>
					{loading && locations.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator size="large" color="#fed787" />
							<Text className="mt-4 font-lexend text-[#666666]">Loading locations...</Text>
						</View>
					) : error ? (
						<View className="items-center justify-center py-8">
							<AntDesign name="exclamationcircle" size={40} color="#fed787" />
							<Text className="mt-4 font-lexend text-[#666666]">{error}</Text>
							<TouchableOpacity
								className="mt-4 bg-[#fed787] px-4 py-2 border border-[#333333]"
								onPress={fetchLocations}
							>
								<Text className="font-lexend-medium text-black">Retry</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
							{locations.map((location) => (
								<View
									key={location.id}
									className="bg-white mb-4 border border-[#333333]"
									style={shadowStyles.standard}
								>
									<View className="flex-row">
										<Image
											source={{ uri: location.image.banner }}
											className="w-24 h-24"
											resizeMode="cover"
										/>
										<View className="flex-1 p-3">
											<Text className="text-base font-lexend-bold tracking-tighter-lexend text-black">
												{location.name}
											</Text>
											<Text
												numberOfLines={2}
												className="text-sm font-lexend tracking-tighter-lexend text-[#666666] mt-1"
											>
												{location.description}
											</Text>
										</View>
									</View>
									<View className="flex-row border-t border-[#eee] p-2">
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() => openEditModal(location)}
										>
											<Text className="font-lexend-medium text-[#333333]">
												<Feather name="edit" size={16} /> Edit
											</Text>
										</TouchableOpacity>
										<View className="border-r border-[#eee] mx-2" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() => handleDelete(location.id)}
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
				<SafeAreaView className="flex-1 bg-[#faf4f0]">
					<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
						<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
							{editingLocation ? "Edit Location" : "Add Location"}
						</Text>
						<TouchableOpacity onPress={() => setModalVisible(false)}>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<ScrollView className="p-4">
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">NAME</Text>
							<TextInput
								value={formData.name}
								onChangeText={(text) => setFormData({ ...formData, name: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Location name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">DESCRIPTION</Text>
							<TextInput
								value={formData.description}
								onChangeText={(text) => setFormData({ ...formData, description: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Location description"
								placeholderTextColor="#666666"
								multiline
								numberOfLines={4}
								textAlignVertical="top"
								style={{ height: 100 }}
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">ADDRESS</Text>
							<TextInput
								value={formData.street}
								onChangeText={(text) => setFormData({ ...formData, street: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend mb-2"
								placeholder="Street (can be blank)"
								placeholderTextColor="#666666"
							/>
							<TextInput
								value={formData.barangay}
								onChangeText={(text) => setFormData({ ...formData, barangay: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend mb-2"
								placeholder="Barangay"
								placeholderTextColor="#666666"
							/>
							<TextInput
								value={formData.town}
								onChangeText={(text) => setFormData({ ...formData, town: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Town"
								placeholderTextColor="#666666"
							/>
						</View>

						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">IMAGES</Text>
							<TextInput
								value={formData.bannerImage}
								onChangeText={(text) => setFormData({ ...formData, bannerImage: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend mb-2"
								placeholder="Banner image URL"
								placeholderTextColor="#666666"
							/>
							<TextInput
								value={formData.image360}
								onChangeText={(text) => setFormData({ ...formData, image360: text })}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="360° image URL"
								placeholderTextColor="#666666"
							/>
						</View>

						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">COORDINATES</Text>
							<View className="flex-row space-x-2">
								<TextInput
									value={formData.latitude}
									onChangeText={(text) => setFormData({ ...formData, latitude: text })}
									className="bg-white text-black p-3 border border-[#333333] font-lexend flex-1"
									placeholder="Latitude"
									placeholderTextColor="#666666"
									keyboardType="numeric"
								/>
								<TextInput
									value={formData.longitude}
									onChangeText={(text) => setFormData({ ...formData, longitude: text })}
									className="bg-white text-black p-3 border border-[#333333] font-lexend flex-1"
									placeholder="Longitude"
									placeholderTextColor="#666666"
									keyboardType="numeric"
								/>
							</View>
						</View>
						<TouchableOpacity
							className="bg-[#fed787] p-4 mb-4 items-center justify-center border border-[#333333]"
							style={shadowStyles.standard}
							onPress={handleSave}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator size="small" color="#333333" />
							) : (
								<Text className="font-lexend-medium tracking-tighter-lexend text-black">
									Save Location
								</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</View>
	);
}
