import { Event, EventCard } from "@/components/home/EventCard";
import { UserSidebar } from "@/components/home/UserSidebar";
import { MAPBOX_API_KEY } from "@/utils/config";
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
				mapboxgl.accessToken = '${MAPBOX_API_KEY}';
				
				const map = new mapboxgl.Map({
					container: 'map',
					style: 'mapbox://styles/janleigh/cmdg17r3z002o01se8uw28phr',
					center: [122.330000, 11.670000], // Malinao, Aklan approximate coordinates
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

const dummyEvents: Event[] = [
	{
		id: "1",
		title: "Shabuhan Kanday Cel",
		date: "July 22, 2025",
		time: "7:00 AM - 7:00 PM",
		location: "Polo, New Washington",
		image: "https://i.redd.it/t20nfsv8guwe1.jpeg",
		distance: "0.5 km away"
	},
	{
		id: "2",
		title: "Event 2",
		date: "August 15, 2025",
		time: "10:00 AM - 6:00 PM",
		location: "Malinao Town Hall",
		image: "https://i.redd.it/3k7x1q9z4vwe1.jpg",
		distance: "1.2 km away"
	},
	{
		id: "3",
		title: "Event 3",
		date: "September 5, 2025",
		time: "9:00 AM - 5:00 PM",
		location: "Malinao Plaza",
		image: "https://i.redd.it/4k7x1q9z4vwe1.jpg",
		distance: "2.0 km away"
	},
	{
		id: "4",
		title: "Event 4",
		date: "October 10, 2025",
		time: "8:00 AM - 4:00 PM",
		location: "Malinao Sports Complex",
		image: "https://i.redd.it/5k7x1q9z4vwe1.jpg",
		distance: "3.5 km away"
	},
	{
		id: "5",
		title: "Event 5",
		date: "November 20, 2025",
		time: "11:00 AM - 3:00 PM",
		location: "Malinao",
		image: "https://i.redd.it/6k7x1q9z4vwe1.jpg",
		distance: "4.0 km away"
	},
	{
		id: "6",
		title: "Event 6",
		date: "December 25, 2025",
		time: "12:00 PM - 6:00 PM",
		location: "Malinao",
		image: "https://i.redd.it/7k7x1q9z4vwe1.jpg",
		distance: "5.0 km away"
	}
];

export default function HomePage() {
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const [mapFullscreen, setMapFullscreen] = useState(false);
	const mapScaleAnim = useRef(new Animated.Value(0)).current;
	const mapOpacityAnim = useRef(new Animated.Value(0)).current;

	const openSidebar = () => {
		setSidebarVisible(true);
	};

	const closeSidebar = () => {
		setSidebarVisible(false);
	};

	const handleSignOut = () => {
		// TODO: Add sign out logic
		closeSidebar();
		router.replace("/");
	};
    
	const toggleMapFullscreen = useCallback(() => {
		if (!mapFullscreen) {
			setMapFullscreen(true);
			Animated.parallel([
				Animated.timing(mapScaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(mapOpacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				})
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(mapScaleAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(mapOpacityAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				})
			]).start(() => {
				setMapFullscreen(false);
			});
		}
	}, [mapFullscreen, mapScaleAnim, mapOpacityAnim]);
    
	// Handle back button press when map is in fullscreen
	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			if (mapFullscreen) {
				toggleMapFullscreen();
				return true;
			}
			return false;
		});
        
		return () => backHandler.remove();
	}, [mapFullscreen, toggleMapFullscreen]);

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
						<View
							className="h-48 overflow-hidden border border-[#333333]"
							style={shadowStyles.standard}
						>
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

					<View className="px-4 py-2">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black">
                                Local Events
							</Text>
							<TouchableOpacity className="flex-row items-center">
								<Text className="mr-1 font-lexend tracking-tighter-lexend text-black">Filter</Text>
								<AntDesign name="filter" size={18} color="black" />
							</TouchableOpacity>
						</View>
						<View className="flex-row justify-between">
							<View className="w-[48%] space-y-4">
								{dummyEvents.slice(0, Math.ceil(dummyEvents.length / 2)).map((event) => (
									<EventCard key={event.id} event={event} />
								))}
							</View>
							<View className="w-[48%] space-y-4">
								{dummyEvents.slice(Math.ceil(dummyEvents.length / 2)).map((event) => (
									<EventCard key={event.id} event={event} />
								))}
							</View>
						</View>
					</View>
				</ScrollView>
                
				<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
					<TouchableOpacity className="items-center">
						<AntDesign name="home" size={24} color="#333" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="search1" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="calendar" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="hearto" size={24} color="#999" />
					</TouchableOpacity>
				</View>
                
				<Modal visible={mapFullscreen} transparent={true} animationType="none">
					<Animated.View 
						style={{
							flex: 1,
							backgroundColor: '#faf4f0',
							opacity: mapOpacityAnim,
							transform: [
								{ 
									scale: mapScaleAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [0.8, 1],
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
