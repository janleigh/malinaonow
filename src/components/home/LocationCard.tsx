import { API_KEYS } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { Location, Review } from "@/lib/types/supabase";
import { shadowStyles } from "@/lib/utils/styles";
import { ReviewService } from "@/services/ReviewService";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Image, LayoutChangeEvent, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { ReviewForm, ReviewList } from "./reviews";

export const LocationCard = ({ location, listView = false, isBookmarked = false, onToggleBookmark }: { 
	location: Location; 
	listView?: boolean; 
	isBookmarked?: boolean;
	onToggleBookmark?: (locationId: string, newStatus: boolean) => void;
}) => {
	const [expanded, setExpanded] = useState(false);
	const [view360Open, setView360Open] = useState(false);
	const [viewMapOpen, setViewMapOpen] = useState(false);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [isLoadingReviews, setIsLoadingReviews] = useState(false);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const [descriptionHeight, setDescriptionHeight] = useState(0);
	const [bookmarked, setBookmarked] = useState(isBookmarked);
	const { isSignedIn, user } = useAuth();
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	const shouldShowToggle = true;

	const onDescriptionLayout = (event: LayoutChangeEvent) => {
		const { height } = event.nativeEvent.layout;
		setDescriptionHeight(height);
	};

	const toggleDescription = () => {
		setIsDescriptionExpanded(!isDescriptionExpanded);
	};

	const rating = location.rating || ReviewService.calculateAverageRating(reviews);
	const reviewCount = location.review_count || reviews.length;

	const toggleExpand = () => {
		if (!expanded) {
			setExpanded(true);
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				})
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(opacityAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				})
			]).start(() => {
				setExpanded(false);
			});
		}
	};

	const handleView360 = () => {
		setView360Open(true);
	};

	const close360View = () => {
		setView360Open(false);
	};

	const handleViewMap = () => {
		setViewMapOpen(true);
	};

	const closeMapView = () => {
		setViewMapOpen(false);
	};

	const getFormattedAddress = (addr: Location) => {
		if (!addr.address) return "";
		const { street, barangay, town } = addr.address;
		return [street, barangay, town].filter(Boolean).join(", ");
	};

	const loadReviews = React.useCallback(async () => {
		setIsLoadingReviews(true);
		try {
			const fetchedReviews = await ReviewService.getReviews(location.id);
			setReviews(fetchedReviews);
		} catch (error) {
			console.error("Failed to load reviews:", error);
		} finally {
			setIsLoadingReviews(false);
		}
	}, [location.id]);

	useEffect(() => {
		if (expanded) {
			loadReviews();
		}
	}, [expanded, loadReviews]);

	useEffect(() => {
		setBookmarked(isBookmarked);
	}, [isBookmarked]);

	const handleToggleBookmark = async (e: any) => {
		e.stopPropagation();
		
		const newStatus = !bookmarked;
		setBookmarked(newStatus);
		
		if (onToggleBookmark) {
			onToggleBookmark(location.id, newStatus);
		}
	};

	const handleSubmitReview = async (rating: number, comment: string) => {
		if (!isSignedIn || !user) return;

		const reviewData = {
			location_id: location.id,
			user_id: user.id,
			user_name: user.fullName || user.firstName || "Anonymous",
			rating,
			comment
		};

		const newReview = await ReviewService.addReview(reviewData);
		if (newReview) {
			setReviews((prev) => [newReview, ...prev]);
			setShowReviewForm(false);
		}
	};

	// HTML for the 360° photo viewer
	const get360ViewerHTML = (photoUrl: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
            <style>
                body { margin: 0; padding: 0; overflow: hidden; }
                #panorama { width: 100%; height: 100vh; }
            </style>
        </head>
        <body>
            <div id="panorama"></div>
            <script>
                pannellum.viewer('panorama', {
                    type: "equirectangular",
                    panorama: "${photoUrl}",
                    autoLoad: true,
                    compass: true,
                    autoRotate: -3,
                    mouseZoom: false
                });
            </script>
        </body>
        </html>
    `;

	// HTML for the map viewer
	const getMapViewerHTML = (name: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
            <link href="https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.css" rel="stylesheet">
            <script src="https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { position: absolute; top: 0; bottom: 0; width: 100%; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                mapboxgl.accessToken = '${API_KEYS.mapbox}';
                
                const map = new mapboxgl.Map({
                    container: 'map',
                    center: [${location.coordinates.longitude}, ${location.coordinates.latitude}],
                    zoom: 15
                });
                
                map.addControl(new mapboxgl.NavigationControl());
                map.on('load', function() {
                    new mapboxgl.Popup()
                        .setLngLat([${location.coordinates.longitude}, ${location.coordinates.latitude}])
                        .setHTML('<h3>${name == null ? name : "You are here"}</h3>')
                        .setMaxWidth("300px")
                        .addTo(map);
                    new mapboxgl.Marker({color: '#fed787'})
                        .setLngLat([${location.coordinates.longitude}, ${location.coordinates.latitude}])
                        .addTo(map);
                });
            </script>
        </body>
        </html>
    `;

	return (
		<>
			<TouchableOpacity
				key={location.id}
				className={`bg-white border border-[#333333] my-2 overflow-hidden ${listView ? "" : ""}`}
				style={shadowStyles.standard}
				onPress={toggleExpand}
			>
				{listView ? (
				// List view layout
					<View className="flex-row">
						<View className="w-1/3 h-24">
							<Image
								source={{ uri: location.image.banner }}
								className="w-full h-full"
								resizeMode="cover"
							/>
						</View>
						<View className="p-3 flex-1">
							<Text
								className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
								numberOfLines={1}
							>
								{location.name}
							</Text>
							<View className="flex-row items-center mt-1">
								<Text className="text-[#fed787] mr-1">★</Text>
								<Text className="font-lexend-bold tracking-tighter-lexend text-black">
									{rating.toFixed(1)}
								</Text>
								<Text className="text-xs font-lexend tracking-tighter-lexend text-[#666]">
									{" "}
                                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
								</Text>
							</View>
							<View className="flex-row items-start mt-1">
								<AntDesign name="enviromento" size={10} color="#555" style={{ marginTop: 2 }} />
								<Text
									className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555] flex-1"
									numberOfLines={2}
								>
									{getFormattedAddress(location)}
								</Text>
							</View>
						</View>
					</View>
				) : (
				// Grid view layout (original)
					<View>
						<View className="w-full h-32">
							<Image
								source={{ uri: location.image.banner }}
								className="w-full h-full"
								resizeMode="cover"
							/>
						</View>
						<View className="p-3">
							<Text
								className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
								numberOfLines={2}
							>
								{location.name}
							</Text>
							<View className="flex-row items-center mt-1">
								<Text className="text-[#fed787] mr-1">★</Text>
								<Text className="font-lexend-bold tracking-tighter-lexend text-black">
									{rating.toFixed(1)}
								</Text>
								<Text className="text-xs font-lexend tracking-tighter-lexend text-[#666]">
									{" "}
                                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
								</Text>
							</View>
							<View className="flex-row items-start mt-1">
								<AntDesign name="enviromento" size={10} color="#555" style={{ marginTop: 2 }} />
								<Text
									className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555] flex-1"
									numberOfLines={2}
								>
									{getFormattedAddress(location)}
								</Text>
							</View>
						</View>
					</View>
				)}
			</TouchableOpacity>
			<Modal visible={expanded} transparent={true} animationType="none">
				<Animated.View
					style={{
						flex: 1,
						backgroundColor: "#faf4f0",
						opacity: opacityAnim,
						transform: [
							{
								scale: scaleAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0.8, 1]
								})
							}
						]
					}}
				>
					<SafeAreaView className="flex-1">
						<View className="flex-row justify-between items-center p-4 border-b border-[#333333]">
							<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
								{location.name}
							</Text>
							<TouchableOpacity onPress={toggleExpand}>
								<Feather name="x" size={24} color="black" />
							</TouchableOpacity>
						</View>
						<ScrollView className="flex-1">
							<Image source={{ uri: location.image.banner }} className="w-full h-52" resizeMode="cover" />
							<View className="p-4">
								<View className="flex-row items-center mb-2">
									<Text className="text-[#fed787] text-2xl mr-1">★</Text>
									<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
										{rating.toFixed(1)}
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666]">
										{" "}
                                        ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
									</Text>
								</View>
								<View className="flex-row items-start mb-4">
									<AntDesign name="enviromento" size={16} color="#333" style={{ marginTop: 2 }} />
									<Text className="ml-2 text-base font-lexend tracking-tighter-lexend text-[#333] flex-1">
										{getFormattedAddress(location)}
									</Text>
								</View>
								<TouchableOpacity
									className="absolute top-6 right-8 p-2 z-10 bg-[#fed787] px-4 py-2 self-start border border-[#333333]"
									style={shadowStyles.standard}
									onPress={(e) => {
										e.stopPropagation();
										handleToggleBookmark(e);
									}}
								>
									<AntDesign 
										name={bookmarked ? "heart" : "hearto"} 
										size={24} 
										color={bookmarked ? "#FE5B62" : "#333"} 
									/>
								</TouchableOpacity>
								<Text className="text-base font-lexend-medium tracking-tighter-lexend text-[#333] mb-2">
                                    Description
								</Text>
								<View className="border-l-2 border-[#fed787] pl-2" style={{ maxHeight: isDescriptionExpanded ? undefined : 80 }}>
									<View onLayout={onDescriptionLayout}>
										<Text className="text-base font-lexend tracking-tighter-lexend text-[#333]">
											{location.description}
										</Text>
									</View>
								</View>
								{shouldShowToggle && (
									<TouchableOpacity 
										onPress={toggleDescription} 
										className="mt-2 bg-[#fed787] px-4 py-2 self-start border border-[#333333]"
										style={shadowStyles.small}
									>
										<Text className="text-sm font-lexend-medium tracking-tighter-lexend text-black">
											{isDescriptionExpanded ? "Show less ↑" : "Show more ↓"}
										</Text>
									</TouchableOpacity>
								)}
								<View className="mt-6 flex-row space-x-2">
									<TouchableOpacity
										className="flex-1 bg-[#fed787] h-12 mr-1 items-center justify-center border border-[#333333]"
										style={shadowStyles.standard}
										onPress={handleViewMap}
									>
										<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
                                            View on Map
										</Text>
									</TouchableOpacity>
									{location.image[360] ? (
										<TouchableOpacity
											className="flex-1 bg-white h-12 ml-1 items-center justify-center border border-[#333333]"
											style={shadowStyles.standard}
											onPress={handleView360}
										>
											<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
                                                View 360°
											</Text>
										</TouchableOpacity>
									) : null}
								</View>
								<View className="mt-8">
									<View className="flex-row justify-between items-center">
										<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
                                            Reviews
										</Text>
										{isSignedIn && !showReviewForm && (
											<TouchableOpacity
												onPress={() => setShowReviewForm(true)}
												className="bg-[#fed787] px-4 py-2 border border-[#333333]"
												style={shadowStyles.small}
											>
												<Text className="font-lexend-medium tracking-tighter-lexend text-black">
                                                    Write a review
												</Text>
											</TouchableOpacity>
										)}
									</View>
									{showReviewForm && (
										<View className="mt-4">
											<ReviewForm locationId={location.id} onSubmit={handleSubmitReview} />
											<TouchableOpacity className="mt-4" onPress={() => setShowReviewForm(false)}>
												<Text className="text-sm font-lexend text-[#666] text-center">
                                                    Cancel
												</Text>
											</TouchableOpacity>
										</View>
									)}
									{isLoadingReviews ? (
										<View className="py-8 items-center">
											<ActivityIndicator size="small" color="#fed787" />
											<Text className="mt-2 font-lexend text-[#666]">Loading reviews...</Text>
										</View>
									) : (
										<View className="mt-4">
											<ReviewList reviews={reviews} />
										</View>
									)}
								</View>
							</View>
						</ScrollView>
					</SafeAreaView>
				</Animated.View>
			</Modal>
			<Modal visible={viewMapOpen} transparent={false} animationType="slide">
				<SafeAreaView className="flex-1 bg-[#faf4f0]">
					<View className="flex-row justify-between items-center p-4 bg-[#faf4f0] border-b border-[#333333]">
						<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">Map View</Text>
						<TouchableOpacity onPress={closeMapView}>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<View className="flex-1">
						<WebView
							source={{ html: getMapViewerHTML(location.name) }}
							style={{ flex: 1, backgroundColor: "transparent" }}
							javaScriptEnabled={true}
							domStorageEnabled={true}
							startInLoadingState={true}
							renderLoading={() => (
								<View className="absolute inset-0 flex-1 items-center justify-center bg-[#faf4f0]">
									<ActivityIndicator size="large" color="#fed787" />
									<Text className="mt-2 font-lexend text-[#666666]">Loading map...</Text>
								</View>
							)}
							onError={(e) => console.error("WebView error:", e.nativeEvent)}
							scrollEnabled={false}
							bounces={false}
							scalesPageToFit={true}
						/>
					</View>
				</SafeAreaView>
			</Modal>
			<Modal visible={view360Open} transparent={false} animationType="slide">
				<SafeAreaView className="flex-1 bg-black">
					<View className="flex-row justify-between items-center p-4 bg-[#faf4f0] border-b border-[#333333]">
						<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">360° View</Text>
						<TouchableOpacity onPress={close360View}>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<View className="flex-1">
						{location.image[360] && (
							<WebView
								source={{ html: get360ViewerHTML(location.image[360]) }}
								style={{ flex: 1 }}
								javaScriptEnabled={true}
								domStorageEnabled={true}
								scrollEnabled={false}
								bounces={false}
							/>
						)}
					</View>
				</SafeAreaView>
			</Modal>
		</>
	);
};

export default LocationCard;
