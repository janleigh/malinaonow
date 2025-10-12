import { BaseText as Text } from "@/components/BaseText";
import { ReviewForm, ReviewList } from "@/components/home/reviews";
import { API_KEYS } from "@/config";
import { useTranslation } from "@/hooks/useTranslation";
import { AntDesign, Feather } from "@expo/vector-icons";
import { supabase } from "@shared/api/supabase";
import { useAuth } from "@shared/context/AuthContext";
import { ReviewService } from "@shared/services/ReviewService";
import { Location, Review } from "@shared/types/supabase";
import * as ELocation from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
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
	const { isSignedIn, user } = useAuth();
	const { language, t } = useTranslation();
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

	const loadReviews = React.useCallback(
		async (loadFullReviews = false) => {
			try {
				const { data: reviewStats } = await supabase
					.from("reviews")
					.select("*")
					.eq("location_id", location.id);

				// TODO! Cache reviews.

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

	// HTML for the map viewer with directions
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
            <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.css" type="text/css">
            <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { position: absolute; top: 0; bottom: 0; width: 100%; }
                .destination-info {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    background: white;
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
                    margin: 0 0 5px 0;
                    font-size: 16px;
                }
                .button-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 10px;
                }
                .map-btn {
                    background-color: #fed787;
                    border: 1px solid #333333;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
					font-family: 'Lexend Mega', sans-serif;
					letter-spacing: -0.15em;
                }
                .map-btn.active {
                    background-color: #e5c067;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <div class="destination-info">
                <h3>${name}</h3>
                <div class="button-container">
                    <button id="useMyLocation" class="map-btn">Use My Location</button>
                    <button id="toggleSteps" class="map-btn active">Hide Step Instructions</button>
                </div>
            </div>
            <script>
                mapboxgl.accessToken = '${API_KEYS.mapbox}';
                
                const destinationCoords = [${location.coordinates.longitude}, ${location.coordinates.latitude}];
                let directions;
                let showSteps = true;
                
                const map = new mapboxgl.Map({
                    container: 'map',
                    center: destinationCoords,
                    zoom: 15
                });
                
                map.addControl(new mapboxgl.NavigationControl());
                
                directions = new MapboxDirections({
                    accessToken: mapboxgl.accessToken,
                    unit: 'metric',
                    profile: 'mapbox/driving',
                    controls: {
                        inputs: true,
                        instructions: true
                    },
                    placeholderOrigin: 'Enter your starting point',
                    placeholderDestination: 'Destination',
                    geocoder: {
                        language: 'en'
                    }
                });
                
                map.addControl(directions, 'top-left');
                
                map.on('load', function() {
                    directions.setDestination(destinationCoords);
                    
                    new mapboxgl.Marker({color: '#fed787'})
                        .setLngLat(destinationCoords)
                        .addTo(map);
                        
                    window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'mapLoaded'}));
                });
                
                function toggleStepInstructions() {
                    showSteps = !showSteps;
                    const instructionsElement = document.querySelector('.mapbox-directions-instructions');
                    const toggleBtn = document.getElementById('toggleSteps');
                    
                    if (instructionsElement) {
                        if (showSteps) {
                            instructionsElement.style.display = 'block';
                            toggleBtn.textContent = 'Hide Step Instructions';
                            toggleBtn.classList.add('active');
                        } else {
                            instructionsElement.style.display = 'none';
                            toggleBtn.textContent = 'Show Step Instructions';
                            toggleBtn.classList.remove('active');
                        }
                    }
                }
                
                document.getElementById('toggleSteps').addEventListener('click', toggleStepInstructions);
                document.getElementById('useMyLocation').addEventListener('click', function() {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'getLocation'}));
                    
                    if (!window.ReactNativeWebView) {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(position => {
                                const userLocation = [position.coords.longitude, position.coords.latitude];
                                directions.setOrigin(userLocation);
                            }, error => {
                                console.error('Error getting location:', error);
                                alert('Unable to get your location. Please enter it manually.');
                            }, {
                                enableHighAccuracy: true,
                                timeout: 5000,
                                maximumAge: 0
                            });
                        } else {
                            alert('Geolocation is not supported by this browser.');
                        }
                    }
                });
            </script>
        </body>
    </html>
`;

	const getLocalizedDescription = (loc: Location): string => {
		return language === "fil" && loc.description_fil
			? loc.description_fil
			: language === "akl" && loc.description_akl
				? loc.description_akl
				: loc.description || "";
	};

	const getUserLocation = async () => {
		try {
			const { status } =
				await ELocation.requestForegroundPermissionsAsync();

			if (status !== "granted") {
				alert("Permission to access location was denied");
				return;
			}

			const location = await ELocation.getCurrentPositionAsync({});
			setUserLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude
			});

			if (webViewRef.current) {
				const jsCode = `
					const userLocation = [${location.coords.longitude}, ${location.coords.latitude}];
					if (typeof directions !== 'undefined') {
						directions.setOrigin(userLocation);
					}
				`;
				webViewRef.current.injectJavaScript(jsCode);
			}
		} catch (error) {
			console.error("Error getting location:", error);
			alert("Unable to get your location. Please try again.");
		}
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
						<View className="flex-row items-center justify-between border-b border-[#cac6c6] p-4">
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
									className="absolute right-8 top-6 z-10 border-2 border-lighterBackground bg-surface p-2 px-4 py-2"
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
										{isSignedIn && !showReviewForm && (
											<TouchableOpacity
												onPress={() =>
													setShowReviewForm(true)
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
				<SafeAreaView className="flex-1 bg-[#faf4f0]">
					<View className="flex-row items-center justify-between border-b border-[#333333] bg-[#faf4f0] p-4">
						<Text
							className="font-lexend-bold text-xl text-black"
							fontStyle="bold">
							Map View
						</Text>
						<TouchableOpacity onPress={closeMapView}>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<View className="flex-1">
						<WebView
							ref={webViewRef}
							source={{
								html: getMapViewerHTML(location.name)
							}}
							style={{
								flex: 1,
								backgroundColor: "transparent"
							}}
							javaScriptEnabled={true}
							domStorageEnabled={true}
							geolocationEnabled={true}
							startInLoadingState={true}
							onMessage={(event) => {
								try {
									const data = JSON.parse(
										event.nativeEvent.data
									);
									if (data.type === "getLocation") {
										getUserLocation();
									}
								} catch (e) {
									console.error(
										"Error parsing WebView message:",
										e
									);
								}
							}}
							renderLoading={() => (
								<View className="absolute inset-0 flex-1 items-center justify-center bg-[#faf4f0]">
									<ActivityIndicator
										size="large"
										color="#fed787"
									/>
									<Text className="mt-2 text-[#666666]">
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
				<SafeAreaView className="flex-1 bg-black">
					<View className="flex-row items-center justify-between border-b border-[#333333] bg-[#faf4f0] p-4">
						<Text
							className="font-lexend-bold text-xl text-black"
							fontStyle="bold">
							360° View
						</Text>
						<TouchableOpacity onPress={close360View}>
							<Feather name="x" size={24} color="black" />
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
