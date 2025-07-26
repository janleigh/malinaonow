import { UserSidebar } from "@/components/home/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { API_KEYS } from "@/utils/config";
import { shadowStyles } from "@/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const mapboxHtml = `
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
                    style: 'mapbox://styles/janleigh/cmdg17r3z002o01se8uw28phr',
                    center: [122.330000, 11.670000],
                    zoom: 10
                });
                
                map.addControl(new mapboxgl.NavigationControl());
                map.on('load', function() {
                    new mapboxgl.Marker({color: '#fed787'})
                        .setLngLat([122.330000, 11.670000])
                        .addTo(map);
                });
            </script>
        </body>
    </html>
    `;

export default function HomePage() {
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const [mapFullscreen, setMapFullscreen] = useState(false);
	const [isGridView, setIsGridView] = useState(true); // Add state for view mode
	const mapScaleAnim = useRef(new Animated.Value(0)).current;
	const mapOpacityAnim = useRef(new Animated.Value(0)).current;

	const openSidebar = () => {
		setSidebarVisible(true);
	};

	const closeSidebar = () => {
		setSidebarVisible(false);
	};

	const { signOut } = useAuth();

	const handleSignOut = async () => {
		try {
			closeSidebar();

			setTimeout(async () => {
				await signOut();
			}, 300);
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const toggleMapFullscreen = useCallback(() => {
		if (!mapFullscreen) {
			setMapFullscreen(true);
			Animated.parallel([
				Animated.timing(mapScaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(mapOpacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				})
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(mapScaleAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(mapOpacityAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				})
			]).start(() => {
				setMapFullscreen(false);
			});
		}
	}, [mapFullscreen, mapScaleAnim, mapOpacityAnim]);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			if (mapFullscreen) {
				toggleMapFullscreen();
				return true;
			}
			return false;
		});

		return () => backHandler.remove();
	}, [mapFullscreen, toggleMapFullscreen]);

	// Add toggle view function
	const toggleView = () => {
		setIsGridView(!isGridView);
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						MalinaoNow
					</Text>
					<TouchableOpacity className="p-2" onPress={openSidebar}>
						<Feather name="user" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<ScrollView className="flex-1">
					<View className="px-4">
						<View className="h-48 overflow-hidden border border-[#333333]" style={shadowStyles.standard}>
							<WebView
								source={{ html: mapboxHtml }}
								style={{ flex: 1 }}
								javaScriptEnabled={true}
								domStorageEnabled={true}
								startInLoadingState={true}
								scalesPageToFit={true}
								bounces={false}
							/>
							<View className="absolute bottom-2 right-2 flex-row">
								<TouchableOpacity
									className="bg-white h-8 w-8 items-center justify-center border border-[#333333] mr-2"
									style={shadowStyles.small}
									onPress={toggleMapFullscreen}
								>
									<Feather name="maximize-2" size={16} color="black" />
								</TouchableOpacity>
								<TouchableOpacity
									className="bg-white h-8 w-8 items-center justify-center border border-[#333333]"
									style={shadowStyles.small}
									onPress={() => router.push("/+not-found")}
								>
									<Feather name="plus" size={18} color="black" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
					<View className="mt-2 px-4 py-2">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black">
								Featured Locations
							</Text>
							<TouchableOpacity className="flex-row items-center" onPress={toggleView}>
								<Text className="mr-1 font-lexend tracking-tighter-lexend text-black">
									{isGridView ? "List View" : "Grid View"}
								</Text>
								<Feather name={isGridView ? "list" : "grid"} size={18} color="black" />
							</TouchableOpacity>
						</View>
						{/* Add under construction tab */}
						<View className="p-4 my-4 border border-[#333333] bg-white" style={shadowStyles.standard}>
							<View className="items-center">
								<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
									<Feather name="tool" size={24} color="#333" />
								</View>
								<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
									Under Construction
								</Text>
								<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
									We&apos;re currently working on bringing you the best locations in Malinao. Check back soon!
								</Text>
							</View>
						</View>
						{/* {isGridView ? (
							// Grid View (current implementation)
							<View className="flex-row justify-between">
								<View className="w-[48%] space-y-4">
									{locations.slice(0, Math.ceil(locations.length / 2)).map((location) => (
										<LocationCard key={location.id} location={location} />
									))}
								</View>
								<View className="w-[48%] space-y-4">
									{locations.slice(Math.ceil(locations.length / 2)).map((location) => (
										<LocationCard key={location.id} location={location} />
									))}
								</View>
							</View>
						) : (
							// List View
							<View className="space-y-4">
								{locations.map((location) => (
									<LocationCard key={location.id} location={location} listView={true} />
								))}
							</View>
						)} */}
					</View>
					<View className="p-4">
						<TouchableOpacity
							className="flex-row items-center justify-center py-3 bg-[#fed787] border border-[#333333] rounded-none"
							style={shadowStyles.standard}
							onPress={() => router.push("/")}
						>
							<Feather name="log-out" size={18} color="#333" />
							<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
								Return to login
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
				<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
					<TouchableOpacity className="items-center">
						<AntDesign name="home" size={24} color="#333" />
					</TouchableOpacity>
					{ /* I don't think we need this anymore */ }
					{/* <TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="search1" size={24} color="#999" />
					</TouchableOpacity> */}
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="calendar" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="book" size={24} color="#999" />
					</TouchableOpacity>
				</View>
				<Modal visible={mapFullscreen} transparent={true} animationType="none">
					<Animated.View
						style={{
							flex: 1,
							backgroundColor: "#faf4f0",
							opacity: mapOpacityAnim,
							transform: [
								{
									scale: mapScaleAnim.interpolate({
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
									Map View
								</Text>
								<TouchableOpacity onPress={toggleMapFullscreen}>
									<Feather name="x" size={24} color="black" />
								</TouchableOpacity>
							</View>
							<View className="flex-1">
								<WebView
									source={{ html: mapboxHtml }}
									style={{ flex: 1 }}
									javaScriptEnabled={true}
									domStorageEnabled={true}
									startInLoadingState={true}
									scalesPageToFit={true}
									bounces={false}
								/>
								<View className="absolute bottom-6 right-6">
									<TouchableOpacity
										className="bg-white h-12 w-12 items-center justify-center rounded-full border border-[#333333]"
										style={shadowStyles.small}
										onPress={() => router.push("/+not-found")}
									>
										<Feather name="plus" size={24} color="black" />
									</TouchableOpacity>
								</View>
							</View>
						</SafeAreaView>
					</Animated.View>
				</Modal>

				<UserSidebar visible={sidebarVisible} onClose={closeSidebar} onSignOut={handleSignOut} />
			</SafeAreaView>
		</View>
	);
}
