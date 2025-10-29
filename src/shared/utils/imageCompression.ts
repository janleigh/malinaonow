import * as ImageManipulator from "expo-image-manipulator";

// Image compression configuration
export const IMAGE_COMPRESSION_CONFIG = {
	maxWidth: 1920,
	quality: 0.7,
	format: ImageManipulator.SaveFormat.JPEG
};

/**
 * Compress and resize an image
 * @param uri - The URI of the image to compress
 * @returns The URI of the compressed image
 */
export const compressImage = async (uri: string): Promise<string> => {
	try {
		// Compress and resize the image
		const manipulatedImage = await ImageManipulator.manipulateAsync(
			uri,
			[{ resize: { width: IMAGE_COMPRESSION_CONFIG.maxWidth } }],
			{
				compress: IMAGE_COMPRESSION_CONFIG.quality,
				format: IMAGE_COMPRESSION_CONFIG.format
			}
		);
		return manipulatedImage.uri;
	} catch (error) {
		console.error("Error compressing image:", error);
		// Return original URI if compression fails
		return uri;
	}
};
