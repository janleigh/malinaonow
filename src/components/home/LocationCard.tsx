import { BaseText as Text } from "@/components/BaseText";
import { ReviewForm, ReviewList } from "@/components/home/reviews";
import { API_KEYS } from "@/config";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { AntDesign, Feather } from "@expo/vector-icons";
import { supabase } from "@shared/api/supabase";
import { useAuth } from "@shared/context/AuthContext";
import { MapRouteService } from "@shared/services";
import { ReviewService } from "@shared/services/ReviewService";
import { Location, Review } from "@shared/types/supabase";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
	FlatList,
	GestureResponderEvent,
	Image,
	LayoutChangeEvent,
	Modal,
	ScrollView,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export const LocationCard = ({
	location,
	isBookmarked = false,
	onToggleBookmark
}: {
	location: Location;
	isBookmarked?: boolean;
	onToggleBookmark?: (locationId: string, newStatus: boolean) => void;
}) => {
	const [expanded, setExpanded] = useState(false);
	const [view360Open, setView360Open] = useState(false);
	const [viewMapOpen, setViewMapOpen] = useState(false);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [isLoadingReviews, setIsLoadingReviews] = useState(false);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] =
		useState(false);
	const [descriptionHeight, setDescriptionHeight] = useState(0);
	const [bookmarked, setBookmarked] = useState(isBookmarked);
	const [avgRating, setAvgRating] = useState(location.rating || 0);
	const [totalReviews, setTotalReviews] = useState(
		location.review_count || 0
	);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [isOfflineMode, setIsOfflineMode] = useState(false);
	const [cachedRoute, setCachedRoute] = useState<any>(null);
	const { isSignedIn, user, isGuestMode } = useAuth();
	const { language, t } = useTranslation();
	const { isOnline } = useNetworkStatus();
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const webViewRef = useRef<WebView>(null);

	const shouldShowToggle = true;

	const onDescriptionLayout = (event: LayoutChangeEvent) => {
		const { height } = event.nativeEvent.layout;
		setDescriptionHeight(height);
	};

	const toggleDescription = () => {
		setIsDescriptionExpanded(!isDescriptionExpanded);
	};

	const rating = avgRating || 0;
	const reviewCount = totalReviews;

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

	const handleViewMap = async () => {
		// Check if offline and try to load cached route
		if (!isOnline) {
			const cached = await MapRouteService.getRoute(location.id);
			if (cached) {
				setCachedRoute(cached);
				setIsOfflineMode(true);
			} else {
				setIsOfflineMode(true);
				setCachedRoute(null);
			}
		} else {
			setIsOfflineMode(false);
		}
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

	const loadReviews = React.useCallback(
		async (loadFullReviews = false) => {
			try {
				const { data: reviewStats } = await supabase
					.from("reviews")
					.select("*")
					.eq("location_id", location.id);

				if (reviewStats && reviewStats.length > 0) {
					const reviews = reviewStats as Review[];
					const avg =
						ReviewService.calculateAverageRating(reviews);
					setAvgRating(avg);
					setTotalReviews(reviewStats.length);

					if (loadFullReviews) {
						setIsLoadingReviews(true);
						const fetchedReviews =
							await ReviewService.getReviews(location.id);
						setReviews(fetchedReviews);
					}
				} else {
					setAvgRating(0);
					setTotalReviews(0);
				}
			} catch (error) {
				console.error("Failed to load reviews:", error);
			} finally {
				setIsLoadingReviews(false);
			}
		},
		[location.id]
	);

	useEffect(() => {
		loadReviews(false);
	}, [loadReviews]);

	useEffect(() => {
		if (expanded) {
			loadReviews(true);
		}
	}, [expanded, loadReviews]);

	useEffect(() => {
		setBookmarked(isBookmarked);
	}, [isBookmarked]);

	const handleToggleBookmark = async (e: GestureResponderEvent) => {
		e.stopPropagation();

		const newStatus = !bookmarked;
		setBookmarked(newStatus);

		if (onToggleBookmark) {
			onToggleBookmark(location.id, newStatus);
		}
	};

	const handleSubmitReview = async (rating: number, comment: string) => {
		if (!isSignedIn || !user) return;

		try {
			const reviewData = {
				location_id: location.id,
				user_id: user.id,
				user_name: user.fullName || user.firstName || "Anonymous",
				rating,
				comment,
				created_at: new Date().toISOString()
			};

			const newReview = await ReviewService.addReview(reviewData);
			if (newReview) {
				setReviews((prev) => [newReview, ...prev]);
				setShowReviewForm(false);

				const updatedReviews = [newReview, ...reviews];
				const newAvgRating =
					ReviewService.calculateAverageRating(updatedReviews);
				setAvgRating(newAvgRating);
				setTotalReviews(updatedReviews.length);
			}
		} catch (error) {
			console.error("Error submitting review:", error);
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
                    minPitch: -50,             
                    maxPitch: 50,
                    mouseZoom: false,
                    pitch: 0,           // horizon level
                    yaw: 0,             // looking forward
                    hfov: 70,           // horizontal pov
                    vaov: 90            // vertical pov
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
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Lexend+Mega:wght@100..900&display=swap" rel="stylesheet">
            <link href="https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.css" rel="stylesheet">
            <script src="https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { position: absolute; top: 0; bottom: 0; width: 100%; }
                .destination-info {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    background: #161719;
                    padding: 10px;
                    border-radius: 4px;
                    z-index: 1;
                    max-width: 300px;
                    font-family: 'Lexend Mega', sans-serif;
					letter-spacing: -0.15em;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    border: 1px solid #333333;
					margin-bottom: 1.75em;
                }
                .destination-info h3 {
                    margin: 0;
                    font-size: 16px;
					color: #f7f7f7;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <div class="destination-info">
                <h3>${name}</h3>
            </div>
            <script>
                mapboxgl.accessToken = '${API_KEYS.mapbox}';
                
                const destinationCoords = [${location.coordinates.longitude}, ${location.coordinates.latitude}];
                
                const map = new mapboxgl.Map({
                    container: 'map',
                    center: destinationCoords,
                    zoom: 15
                });
                
                map.addControl(new mapboxgl.NavigationControl());
                
                map.on('load', function() {
                    new mapboxgl.Marker({color: '#0ff6be'})
                        .setLngLat(destinationCoords)
                        .addTo(map);
                        
                    window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'mapLoaded'}));
                });
            </script>
        </body>
    </html>
`;

	// HTML for offline map view with cached route data
	const getOfflineMapHTML = (name: string) => {
		const hasRoute = cachedRoute && cachedRoute.origin;
		return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
            <style>
                body { 
                    margin: 0; 
                    padding: 20px; 
                    background: #161719;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    color: #f7f7f7;
                }
                .offline-container {
                    max-width: 600px;
                    margin: 0 auto;
                }
                .offline-header {
                    background: #FFA500;
                    color: #161719;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .location-info {
                    background: #1f2023;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333333;
                    margin-bottom: 20px;
                }
                .location-info h2 {
                    margin: 0 0 15px 0;
                    color: #0ff6be;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #333333;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-label {
                    color: #cacbca;
                }
                .info-value {
                    color: #f7f7f7;
                    font-weight: bold;
                }
                .no-route {
                    background: #1f2023;
                    padding: 30px;
                    border-radius: 8px;
                    border: 1px solid #333333;
                    text-align: center;
                }
                .coordinates {
                    background: #1f2023;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #333333;
                    margin-top: 10px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-header">
                    <h3 style="margin: 0;">📵 Offline Mode</h3>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">You are currently offline. ${hasRoute ? "Showing cached route information." : "No cached route available."}</p>
                </div>
                
                <div class="location-info">
                    <h2>${name}</h2>
                    <div class="info-row">
                        <span class="info-label">Destination Latitude:</span>
                        <span class="info-value">${location.coordinates.latitude}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Destination Longitude:</span>
                        <span class="info-value">${location.coordinates.longitude}</span>
                    </div>
                </div>
                
                ${
					hasRoute
						? `
                    <div class="location-info">
                        <h3 style="margin: 0 0 15px 0; color: #0ff6be;">Cached Route Information</h3>
                        ${
							cachedRoute.distance
								? `<div class="info-row">
                            <span class="info-label">Distance:</span>
                            <span class="info-value">${cachedRoute.distance}</span>
                        </div>`
								: ""
						}
                        ${
							cachedRoute.duration
								? `<div class="info-row">
                            <span class="info-label">Estimated Duration:</span>
                            <span class="info-value">${cachedRoute.duration}</span>
                        </div>`
								: ""
						}
                        ${
							cachedRoute.origin
								? `
                        <div class="coordinates">
                            <strong>Origin:</strong><br/>
                            Lat: ${cachedRoute.origin.latitude}<br/>
                            Lng: ${cachedRoute.origin.longitude}
                        </div>
                        `
								: ""
						}
                        <div class="coordinates">
                            <strong>Destination:</strong><br/>
                            Lat: ${cachedRoute.destination.latitude}<br/>
                            Lng: ${cachedRoute.destination.longitude}
                        </div>
                        <p style="margin: 15px 0 0 0; font-size: 12px; color: #cacbca; text-align: center;">
                            Cached ${new Date(cachedRoute.timestamp).toLocaleString()}
                        </p>
                    </div>
                `
						: `
                    <div class="no-route">
                        <p style="margin: 0; color: #cacbca;">No route has been saved for this location yet. Please go online and view the map to cache route information for offline use.</p>
                    </div>
                `
				}
            </div>
        </body>
    </html>
        `;
	};

	const getLocalizedDescription = (loc: Location): string => {
		return language === "fil" && loc.description_fil
			? loc.description_fil
			: language === "akl" && loc.description_akl
				? loc.description_akl
				: loc.description || "";
	};

	return (
		<>
			<TouchableOpacity
				key={location.id}
				className={`my-2 overflow-hidden rounded-xl border border-[#333333] bg-lighterBackground`}
				onPress={toggleExpand}>
				<View>
					<View className="h-32 w-full">
						<Image
							source={{
								uri: location.image.banner
							}}
							className="h-full w-full"
							resizeMode="cover"
						/>
					</View>
					<View className="p-3">
						<Text
							className="text-sm text-text"
							numberOfLines={2}
							fontName="Montserrat_700Bold">
							{location.name}
						</Text>
						<View className="mt-1 flex-row items-center">
							<Text
								className="mr-1 text-[#fed787]"
								fontName="Poppins_500Medium">
								★
							</Text>
							<Text
								className="text-text"
								fontName="Montserrat_700Bold">
								{rating.toFixed(1)}
							</Text>
							<Text
								className="text-inactive text-xs"
								fontName="Poppins_500Medium">
								{" "}
								({reviewCount}{" "}
								{reviewCount === 1 ? "review" : "reviews"})
							</Text>
						</View>
						<View className="mt-1 flex-row items-start">
							<AntDesign
								name="enviromento"
								size={10}
								color="#cacbca"
								style={{ marginTop: 2 }}
							/>
							<Text
								className="text-inactive ml-1 flex-1 text-xs"
								numberOfLines={2}
								fontName="Poppins_500Medium">
								{getFormattedAddress(location)}
							</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
			<Modal
				visible={expanded}
				transparent={true}
				animationType="none">
				<Animated.View
					style={{
						flex: 1,
						backgroundColor: "#161719",
						opacity: opacityAnim,
						transform: [
							{
								scale: scaleAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0.8, 1]
								})
							}
						]
					}}>
					<SafeAreaView className="flex-1">
						<View className="flex-row items-center justify-between border-b border-line p-4">
							<Text
								className="text-xl text-text"
								fontName="Montserrat_700Bold">
								{location.name}
							</Text>
							<TouchableOpacity onPress={toggleExpand}>
								<Feather
									name="x"
									size={24}
									color="#f7f7f7"
								/>
							</TouchableOpacity>
						</View>
						<ScrollView className="flex-1">
							<Image
								source={{
									uri: location.image.banner
								}}
								className="h-52 w-full"
								resizeMode="cover"
							/>
							{/* Display additional images if available */}
							{location.images &&
								location.images.length > 0 && (
									<View className="mt-3 px-4">
										<Text
											className="mb-3 text-lg text-text"
											fontName="Montserrat_700Bold">
											Gallery
										</Text>
										<FlatList
											key={`location-images-horizontal`}
											data={location.images}
											renderItem={({ item }) => (
												<View className="mr-3">
													<Image
														source={{
															uri: item
														}}
														className="h-64 w-64 rounded-xl"
														resizeMode="cover"
													/>
												</View>
											)}
											keyExtractor={(item, index) =>
												`${item}-${index}`
											}
											horizontal={true}
											showsHorizontalScrollIndicator={
												false
											}
											scrollEnabled={true}
											contentContainerStyle={{
												paddingHorizontal: 0
											}}
										/>
									</View>
								)}
							<View className="p-4">
								<View className="mb-2 flex-row items-center">
									<Text className="mb-1 mr-1 text-2xl text-[#FFBB38]">
										★
									</Text>
									<Text
										className="text-xl text-text"
										fontName="Montserrat_700Bold">
										{rating.toFixed(1)}
									</Text>
									<Text
										className="text-base text-[#cacbca]"
										fontName="Poppins_500Medium">
										{" "}
										({reviewCount}{" "}
										{reviewCount === 1
											? "review"
											: "reviews"}
										)
									</Text>
								</View>
								<View className="mb-4 flex-row items-start">
									<AntDesign
										name="enviromento"
										size={16}
										color="#cacbca"
										style={{
											marginTop: 2
										}}
									/>
									<Text
										className="ml-2 flex-1 text-base text-[#cacbca]"
										fontName="Poppins_500Medium">
										{getFormattedAddress(location)}
									</Text>
								</View>
								<TouchableOpacity
									className="absolute right-8 top-6 z-10 p-2 px-4 py-2"
									onPress={(e) => {
										e.stopPropagation();
										handleToggleBookmark(e);
									}}>
									<AntDesign
										name={
											bookmarked ? "heart" : "hearto"
										}
										size={28}
										color={
											bookmarked
												? "#FE5B62"
												: "#cacbca"
										}
									/>
								</TouchableOpacity>
								<Text
									className="mb-2 text-base text-[#cacbca]"
									fontName="Poppins_500Medium">
									Description
								</Text>
								<View
									className="border-l-4 border-primary pl-3"
									style={{
										maxHeight: isDescriptionExpanded
											? undefined
											: 80
									}}>
									<View onLayout={onDescriptionLayout}>
										<Text
											className="text-base text-[#cacbca]"
											fontName="Poppins_500Medium">
											{getLocalizedDescription(
												location
											)}
										</Text>
									</View>
								</View>
								{shouldShowToggle && (
									<TouchableOpacity
										onPress={toggleDescription}
										className="mt-2 self-start px-4 py-2">
										<Text
											className="text-sm text-text underline"
											fontName="Poppins_500Medium">
											{isDescriptionExpanded
												? t("location.showLess")
												: t("location.showMore")}
										</Text>
									</TouchableOpacity>
								)}
								<View className="mt-6 flex-row space-x-2">
									<TouchableOpacity
										className="mr-1 h-12 flex-1 items-center justify-center rounded-xl border border-lineAlt bg-surface"
										onPress={handleViewMap}>
										<Text
											className="text-base text-text"
											fontName="Poppins_500Medium">
											{t("location.viewOnMap")}
										</Text>
									</TouchableOpacity>
									{location.image[360] ? (
										<TouchableOpacity
											className="ml-1 h-12 flex-1 items-center justify-center rounded-xl border border-lineAlt bg-surface"
											onPress={handleView360}>
											<Text
												className="text-base text-text"
												fontName="Poppins_500Medium">
												{t("location.view360")}
											</Text>
										</TouchableOpacity>
									) : null}
								</View>
								<View className="mt-8">
									<View className="flex-row items-center justify-between">
										<Text
											className="text-xl text-text"
											fontName="Montserrat_700Bold">
											Reviews
										</Text>
										{isSignedIn &&
											!isGuestMode &&
											!showReviewForm && (
												<TouchableOpacity
													onPress={() =>
														setShowReviewForm(
															true
														)
													}
													className="rounded-xl border border-lineAlt bg-surface px-4 py-2">
													<Text
														className="text-text"
														fontName="Poppins_500Medium">
														{t(
															"location.writeReview"
														)}
													</Text>
												</TouchableOpacity>
											)}
									</View>
									{showReviewForm && (
										<View className="mt-4">
											<ReviewForm
												locationId={location.id}
												onSubmit={
													handleSubmitReview
												}
											/>
											<TouchableOpacity
												className="mt-4"
												onPress={() =>
													setShowReviewForm(
														false
													)
												}>
												<Text
													className="text-center text-sm text-[#inactive] underline"
													fontName="Poppins_500Medium">
													Cancel
												</Text>
											</TouchableOpacity>
										</View>
									)}
									{isLoadingReviews ? (
										<View className="items-center py-8">
											<ActivityIndicator
												size="small"
												color="#0ff6be"
											/>
											<Text className="mt-2 text-[#cacbca]">
												{t("common.loading")}
											</Text>
										</View>
									) : (
										<View className="mt-4">
											<ReviewList
												reviews={reviews}
												onReviewDeleted={(
													reviewId
												) => {
													// Remove the deleted review from the list
													const updatedReviews =
														reviews.filter(
															(r) =>
																r.id !==
																reviewId
														);
													setReviews(
														updatedReviews
													);

													// Update the average rating and count
													const newAvgRating =
														ReviewService.calculateAverageRating(
															updatedReviews
														);
													setAvgRating(
														newAvgRating
													);
													setTotalReviews(
														updatedReviews.length
													);
												}}
											/>
										</View>
									)}
								</View>
							</View>
						</ScrollView>
					</SafeAreaView>
				</Animated.View>
			</Modal>
			{/* // Map Modal */}
			<Modal
				visible={viewMapOpen}
				transparent={false}
				animationType="slide">
				<SafeAreaView className="flex-1 bg-background">
					<View className="flex-row items-center justify-between border-b border-[#333333] bg-background p-4">
						<Text
							className="text-xl text-text"
							fontName="Montserrat_700Bold"
							fontStyle="bold">
							{isOfflineMode
								? "Offline Map View"
								: "Map View"}
						</Text>
						<TouchableOpacity onPress={closeMapView}>
							<Feather name="x" size={24} color="white" />
						</TouchableOpacity>
					</View>
					<View className="flex-1">
						<WebView
							ref={webViewRef}
							source={{
								html: isOfflineMode
									? getOfflineMapHTML(location.name)
									: getMapViewerHTML(location.name)
							}}
							style={{
								flex: 1,
								backgroundColor: "transparent"
							}}
							javaScriptEnabled={true}
							domStorageEnabled={true}
							geolocationEnabled={true}
							startInLoadingState={true}
							onMessage={async (event) => {
								try {
									const data = JSON.parse(
										event.nativeEvent.data
									);
									// Handle any future message types here if needed
								} catch (e) {
									console.error(
										"Error parsing WebView message:",
										e
									);
								}
							}}
							renderLoading={() => (
								<View className="absolute inset-0 flex-1 items-center justify-center bg-background">
									<ActivityIndicator
										size="large"
										color="#0ff6be"
									/>
									<Text className="mt-2 text-text">
										{t("common.loading")}
									</Text>
								</View>
							)}
							onError={(event) =>
								console.error(
									"WebView error:",
									event.nativeEvent
								)
							}
							scrollEnabled={false}
							bounces={false}
							scalesPageToFit={true}
						/>
					</View>
				</SafeAreaView>
			</Modal>
			{/* 360° View Modal */}
			<Modal
				visible={view360Open}
				transparent={false}
				animationType="slide">
				<SafeAreaView className="flex-1 bg-background">
					<View className="flex-row items-center justify-between border-b border-[#333333] bg-background p-4">
						<Text
							className="text-xl text-text"
							fontName="Montserrat_700Bold"
							fontStyle="bold">
							360° View
						</Text>
						<TouchableOpacity onPress={close360View}>
							<Feather name="x" size={24} color="white" />
						</TouchableOpacity>
					</View>
					<View className="flex-1">
						{location.image[360] && (
							<WebView
								source={{
									html: get360ViewerHTML(
										location.image[360]
									)
								}}
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
