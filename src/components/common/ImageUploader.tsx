import { Feather } from "@expo/vector-icons";
import { StorageService } from "@shared/services";
import { UploadResult } from "@shared/types/storage";
import { compressImage } from "@shared/utils/imageCompression";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Text,
	TouchableOpacity,
	View
} from "react-native";

interface ImageUploaderProps {
	entityType: string;
	entityId: string;
	fileType: string;
	currentImageUrl?: string;
	onImageUploaded: (result: UploadResult) => void;
	onImageDeleted: () => void;
	aspect?: [number, number];
	placeholder: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
	entityType,
	entityId,
	fileType,
	currentImageUrl,
	onImageUploaded,
	onImageDeleted,
	aspect,
	placeholder
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [imageUri, setImageUri] = useState<string | null>(null);

	// Check if camera should be shown for this file type
	const showCamera = fileType !== "360";

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
				allowsEditing: true,
				...(aspect && { aspect }),
				quality: 0.8
			});

			if (!result.canceled && result.assets[0]) {
				const selectedImage = result.assets[0];
				setImageUri(selectedImage.uri);
				await uploadImage(selectedImage);
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to select image");
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
				allowsEditing: true,
				...(aspect && { aspect }),
				quality: 0.8
			});

			if (!result.canceled && result.assets[0]) {
				const capturedImage = result.assets[0];
				setImageUri(capturedImage.uri);
				await uploadImage(capturedImage);
			}
		} catch (error) {
			console.error("Error taking photo:", error);
			Alert.alert("Error", "Failed to take photo");
		}
	};

	const uploadImage = async (
		imageAsset: ImagePicker.ImagePickerAsset
	) => {
		try {
			setIsUploading(true);

			// Compress the image before uploading
			const compressedUri = await compressImage(imageAsset.uri);

			// Create a blob from the compressed image URI
			const response = await fetch(compressedUri);
			const blob = await response.blob();

			// Convert blob to the format expected by StorageService
			const file = {
				uri: compressedUri,
				type: blob.type || "image/jpeg",
				name: `${fileType}-${Date.now()}.jpg`,
				size: blob.size
			} as any;

			// Upload to storage
			const uploadResult = await StorageService.uploadFile(
				file,
				entityType,
				entityId,
				fileType
			);

			if (uploadResult.success) {
				onImageUploaded(uploadResult);
				setImageUri(null); // Clear temporary URI
			} else {
				Alert.alert(
					"Upload Failed",
					uploadResult.error || "Unknown error"
				);
				setImageUri(null);
			}
		} catch (error) {
			console.error("Error uploading image:", error);
			Alert.alert("Error", "Failed to upload image");
			setImageUri(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteImage = () => {
		Alert.alert(
			"Delete Image",
			"Are you sure you want to delete this image?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						onImageDeleted();
						setImageUri(null);
					}
				}
			]
		);
	};

	const displayImageUrl = imageUri || currentImageUrl;

	return (
		<View className="mb-4">
			<Text
				className="mb-2 text-sm text-text-inactive"
				style={{ fontWeight: "500" }}>
				{placeholder.toUpperCase()}
			</Text>
			{displayImageUrl ? (
				<View className="relative">
					<Image
						source={{ uri: displayImageUrl }}
						className="h-48 w-full rounded-lg"
						resizeMode="cover"
					/>
					<TouchableOpacity
						className="absolute right-2 top-2 rounded-full bg-red-500 p-2"
						onPress={handleDeleteImage}
						disabled={isUploading}>
						<Feather name="trash-2" size={16} color="white" />
					</TouchableOpacity>
				</View>
			) : (
				<View className="h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-line bg-lighterBackground">
					{isUploading ? (
						<View className="items-center">
							<ActivityIndicator
								size="large"
								color="#0ff6be"
							/>
							<Text className="mt-2 text-text-inactive">
								Uploading...
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
						</View>
					)}
				</View>
			)}
			{!isUploading && (
				<View
					className={`mt-3 flex-row ${showCamera ? "space-x-3" : ""}`}>
					<TouchableOpacity
						className={`mr-2 flex-1 flex-row items-center justify-center rounded-lg border border-line p-3 ${showCamera ? "bg-primary" : "bg-primary"}`}
						onPress={pickImage}>
						<Feather name="image" size={16} color="black" />
						<Text
							className="ml-2 text-black"
							style={{ fontWeight: "500" }}>
							Gallery
						</Text>
					</TouchableOpacity>
					{showCamera && (
						<TouchableOpacity
							className="ml-2 flex-1 flex-row items-center justify-center rounded-lg border border-line bg-surface p-3"
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
					)}
				</View>
			)}
		</View>
	);
};
