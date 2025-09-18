import { BottomTabBar } from "@/components/common";
import { Event } from "@/components/home";
import { useTranslation } from "@/lib/context/TranslationContext";
import { formatDate, isToday } from "@/lib/utils/date";
import { shadowStyles } from "@/lib/utils/styles";
import { EventService } from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const groupEventsByDate = (events: Event[]) => {
	const grouped: Record<string, Event[]> = {};

	events.forEach((event) => {
		if (!grouped[event.date]) {
			grouped[event.date] = [];
		}
		grouped[event.date].push(event);
	});

	return Object.keys(grouped)
		.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
		.map((date) => ({
			date,
			events: grouped[date].sort((a, b) =>
				a.time.localeCompare(b.time)
			)
		}));
};

export default function CalendarPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [groupedEvents, setGroupedEvents] = useState<
		{ date: string; events: Event[] }[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const { t } = useTranslation();

	const fetchEvents = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await EventService.getEvents();
			setEvents(data);
			setGroupedEvents(groupEventsByDate(data));
		} catch (err) {
			console.error("Failed to fetch events:", err);
			setError("Failed to load events. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	return (
		<View className="flex-1 bg-[#C6E3D3]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Calendar
					</Text>
				</View>
				<ScrollView className="flex-1">
					<View className="p-4">
						<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-4">
							{t("home.upcomingEvents")}
						</Text>
						{loading ? (
							<View className="p-4 items-center justify-center">
								<ActivityIndicator
									size="large"
									color="#fed787"
								/>
								<Text className="mt-2 font-lexend text-[#666666]">
									{t("home.loadingEvents")}
								</Text>
							</View>
						) : error ? (
							<View
								className="p-4 my-4 border border-[#333333] bg-white"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather
											name="alert-triangle"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										Error Loading Events
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										{error}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center py-2 px-4 bg-[#fed787] border border-[#333333]"
										style={shadowStyles.small}
										onPress={fetchEvents}
									>
										<Text className="font-lexend-medium tracking-tighter-lexend text-black">
											Retry
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : groupedEvents.length === 0 ? (
							<View
								className="p-4 my-4 border border-[#333333] bg-white"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather
											name="calendar"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										{t("home.noEvents")}
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										{t("home.noEventsDesc")}
									</Text>
								</View>
							</View>
						) : (
							<View>
								{groupedEvents.map((group) => (
									<View
										key={group.date}
										className="mb-6"
									>
										<View className="flex-row items-center mb-2">
											<View className="w-10 h-10 rounded-full bg-[#FFBB38] items-center justify-center mr-3 border border-[#333333]">
												<AntDesign
													name="calendar"
													size={20}
													color="#333"
												/>
											</View>
											<View>
												<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black">
													{formatDate(
														group.date
													)}
												</Text>
												{isToday(group.date) && (
													<View className="bg-[#fed787] px-2 py-0.5 rounded-sm">
														<Text className="text-xs font-lexend-medium tracking-tighter-lexend text-black">
															TODAY
														</Text>
													</View>
												)}
											</View>
										</View>
										<View className="border-l-4 border-[#FFBB38] ml-5 pl-4">
											{group.events.map((event) => (
												<TouchableOpacity
													key={event.id}
													className="bg-white p-4 mb-3 border border-[#333333] rounded-xl"
													onPress={() =>
														setSelectedEvent(
															event
														)
													}
												>
													<View className="flex-row justify-between">
														<View className="flex-1">
															<Text className="text-base font-lexend-extrabold tracking-tighter-lexend text-black mb-1">
																{
																	event.name
																}
															</Text>
															<View className="flex-row items-center">
																<AntDesign
																	name="clockcircleo"
																	size={
																		12
																	}
																	color="#555"
																/>
																<Text className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555]">
																	{
																		event.time
																	}
																</Text>
															</View>
															<View className="flex-row items-start mt-1">
																<AntDesign
																	name="enviromento"
																	size={
																		12
																	}
																	color="#555"
																	style={{
																		marginTop: 2
																	}}
																/>
																<Text className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555] flex-1">
																	{
																		event.location
																	}
																</Text>
															</View>
														</View>
													</View>
												</TouchableOpacity>
											))}
										</View>
									</View>
								))}
							</View>
						)}
					</View>
				</ScrollView>
				<BottomTabBar activeTab="calendar" />
			</SafeAreaView>
		</View>
	);
}
