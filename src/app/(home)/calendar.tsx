import { BaseText as Text } from "@/components/BaseText";
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
				<View className="flex-row items-center justify-between border-b border-[#eee] p-4">
					<Text className="android:font-normal text-2xl font-extrabold tracking-tighter-lexend text-black">
						Calendar
					</Text>
				</View>
				<ScrollView className="flex-1">
					<View className="p-4">
						<Text className="mb-4 text-xl tracking-tighter-lexend text-black">
							{t("home.upcomingEvents")}
						</Text>
						{loading ? (
							<View className="items-center justify-center p-4">
								<ActivityIndicator
									size="large"
									color="#fed787"
								/>
								<Text className="mt-2 text-[#666666]">
									{t("home.loadingEvents")}
								</Text>
							</View>
						) : error ? (
							<View
								className="my-4 border border-[#333333] bg-white p-4"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<Feather
											name="alert-triangle"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl tracking-tighter-lexend text-black">
										Error Loading Events
									</Text>
									<Text className="mb-4 text-center text-base tracking-tighter-lexend text-[#666666]">
										{error}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center border border-[#333333] bg-[#fed787] px-4 py-2"
										style={shadowStyles.small}
										onPress={fetchEvents}
									>
										<Text className="tracking-tighter-lexend text-black">
											Retry
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : groupedEvents.length === 0 ? (
							<View
								className="my-4 border border-[#333333] bg-white p-4"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<Feather
											name="calendar"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl tracking-tighter-lexend text-black">
										{t("home.noEvents")}
									</Text>
									<Text className="mb-4 text-center text-base tracking-tighter-lexend text-[#666666]">
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
										<View className="mb-2 flex-row items-center">
											<View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#FFBB38]">
												<AntDesign
													name="calendar"
													size={20}
													color="#333"
												/>
											</View>
											<View>
												<Text className="font-lexend-bold text-lg tracking-tighter-lexend text-black">
													{formatDate(
														group.date
													)}
												</Text>
												{isToday(group.date) && (
													<View className="rounded-sm bg-[#fed787] px-2 py-0.5">
														<Text className="text-xs tracking-tighter-lexend text-black">
															TODAY
														</Text>
													</View>
												)}
											</View>
										</View>
										<View className="ml-4 border-l-4 border-[#FFBB38] pl-4">
											{group.events.map((event) => (
												<TouchableOpacity
													key={event.id}
													className="my-2 rounded-xl border border-[#333333] bg-white p-4"
													onPress={() =>
														setSelectedEvent(
															event
														)
													}
												>
													<View className="flex-row justify-between">
														<View className="flex-1">
															<Text className="mb-1 text-base tracking-tighter-lexend text-black">
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
																<Text className="ml-1 text-sm tracking-tighter-lexend text-[#555]">
																	{
																		event.time
																	}
																</Text>
															</View>
															<View className="mt-1 flex-row items-start">
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
																<Text className="ml-1 flex-1 text-sm tracking-tighter-lexend text-[#555]">
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
