import { Feather } from "@expo/vector-icons";
import { StorageService } from "@shared/services";
import { UploadResult } from "@shared/types/storage";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	Text,
	TouchableOpacity,
	View
} from "react-native";

interface MultiImageUploaderProps {
	entityType: string;
	entityId: string;
	images?: string[];
	onImagesChange: (images: string[]) => void;
	placeholder?: string;
	maxImages?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
	entityType,
	entityId,
	images = [],
	onImagesChange,
	placeholder = "Upload images",
	maxImages = 10
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadingIndex, setUploadingIndex] = useState<number | null>(
		null
	);

	// Reset uploading state when entityId changes (new location being edited)
	useEffect(() => {
		setIsUploading(false);
		setUploadingIndex(null);
	}, [entityId]);

	const pickImage = async () => {
		try {
			// Request permissions
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission needed",
					"Please grant permission to access your photos"
				);
				return;
			}

			// Launch image picker
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: false,
				quality: 0.8,
				allowsMultipleSelection: true,
				selectionLimit: maxImages - images.length
			});

			if (!result.canceled && result.assets.length > 0) {
				await uploadImages(result.assets);
			}
		} catch (error) {
			console.error("Error picking images:", error);
			Alert.alert("Error", "Failed to select images");
			setIsUploading(false);
			setUploadingIndex(null);
		}
	};

	const takePhoto = async () => {
		try {
			// Request permissions
			const { status } =
				await ImagePicker.requestCameraPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission needed",
					"Please grant permission to access your camera"
				);
				return;
			}

			// Launch camera
			const result = await ImagePicker.launchCameraAsync({
				allowsEditing: false,
				quality: 0.8
			});

			if (!result.canceled && result.assets[0]) {
				await uploadImages([result.assets[0]]);
			}
		} catch (error) {
			console.error("Error taking photo:", error);
			Alert.alert("Error", "Failed to take photo");
			setIsUploading(false);
			setUploadingIndex(null);
		}
	};

	const uploadImages = async (
		assets: ImagePicker.ImagePickerAsset[]
	) => {
		try {
			setIsUploading(true);
			const newImages: string[] = [];

			for (let i = 0; i < assets.length; i++) {
				const asset = assets[i];
				setUploadingIndex(i);

				// Create a blob from the image URI
				const response = await fetch(asset.uri);
				const blob = await response.blob();

				// Convert blob to the format expected by StorageService
				const file = {
					uri: asset.uri,
					type: blob.type || "image/jpeg",
					name: `image-${Date.now()}-${i}.jpg`,
					size: blob.size
				} as any;

				// Upload to storage
				const uploadResult = await StorageService.uploadFile(
					file,
					entityType,
					entityId,
					"gallery"
				);

				if (uploadResult.success) {
					newImages.push(uploadResult.url!);
				} else {
					Alert.alert(
						"Upload Failed",
						`Failed to upload image ${i + 1}: ${uploadResult.error || "Unknown error"}`
					);
				}
			}

			if (newImages.length > 0) {
				const updatedImages = [...images, ...newImages];
				onImagesChange(updatedImages);
			}
		} catch (error) {
			console.error("Error uploading images:", error);
			Alert.alert("Error", "Failed to upload images");
		} finally {
			setIsUploading(false);
			setUploadingIndex(null);
		}
	};

	const handleDeleteImage = (indexToDelete: number) => {
		Alert.alert(
			"Delete Image",
			"Are you sure you want to delete this image?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						const updatedImages = images.filter(
							(_, index) => index !== indexToDelete
						);
						onImagesChange(updatedImages);
					}
				}
			]
		);
	};

	const renderImagePreview = ({
		item,
		index
	}: {
		item: string;
		index: number;
	}) => (
		<View className="relative m-1">
			<Image
				source={{ uri: item }}
				className="h-20 w-20 rounded-lg"
				resizeMode="cover"
			/>
			<TouchableOpacity
				className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1"
				onPress={() => handleDeleteImage(index)}
				disabled={isUploading}>
				<Feather name="x" size={10} color="white" />
			</TouchableOpacity>
		</View>
	);

	return (
		<View className="mb-4">
			<Text
				className="mb-2 text-sm text-text-inactive"
				style={{ fontWeight: "500" }}>
				{placeholder.toUpperCase()} ({images.length}/{maxImages})
			</Text>

			{/* Main upload area */}
			<View className="min-h-48 rounded-lg border-2 border-dashed border-line bg-lighterBackground">
				{images.length > 0 ? (
					/* Show uploaded images in grid inside the upload area */
					<View className="flex-1 p-2">
						{(() => {
							const numColumns = Math.min(
								4,
								Math.ceil(Math.sqrt(images.length))
							);
							return (
								<FlatList
									key={`images-grid-${numColumns}`}
									data={images}
									renderItem={renderImagePreview}
									keyExtractor={(item, index) =>
										`${item}-${index}`
									}
									numColumns={numColumns}
									scrollEnabled={false}
									contentContainerStyle={{
										justifyContent: "center",
										alignItems: "center"
									}}
								/>
							);
						})()}
					</View>
				) : (
					/* Show upload prompt when no images */
					<View className="flex-1 items-center justify-center p-4">
						{isUploading ? (
							<View className="items-center">
								<ActivityIndicator
									size="large"
									color="#0ff6be"
								/>
								<Text className="mt-2 text-text-inactive">
									Uploading...{" "}
									{uploadingIndex !== null
										? `Image ${uploadingIndex + 1}`
										: ""}
								</Text>
							</View>
						) : (
							<View className="items-center">
								<Feather
									name="image"
									size={40}
									color="#cacbca"
								/>
								<Text className="mt-2 text-center text-text-inactive">
									{placeholder}
								</Text>
								<Text className="mt-1 text-center text-xs text-text-inactive">
									Tap to select images
								</Text>
							</View>
						)}
					</View>
				)}

				{/* Upload buttons - only show if not uploading and under max limit */}
				{!isUploading && images.length < maxImages && (
					<View className="border-t border-line p-3">
						<View className="flex-row space-x-2">
							<TouchableOpacity
								className="flex-1 flex-row items-center justify-center rounded-lg bg-primary p-3"
								onPress={pickImage}>
								<Feather
									name="image"
									size={16}
									color="black"
								/>
								<Text
									className="ml-2 text-black"
									style={{ fontWeight: "500" }}>
									Gallery
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="flex-1 flex-row items-center justify-center rounded-lg bg-surface p-3"
								onPress={takePhoto}>
								<Feather
									name="camera"
									size={16}
									color="#f7f7f7"
								/>
								<Text
									className="ml-2 text-text"
									style={{ fontWeight: "500" }}>
									Camera
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</View>
		</View>
	);
};
