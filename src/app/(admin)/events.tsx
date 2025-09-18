import { supabase } from "@/api/supabase";
import { Event } from "@/lib/types/supabase";
import { formatDate, formatTime } from "@/lib/utils/date";
import { EventService } from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageEventsScreen() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingEvent, setEditingEvent] = useState<Event | null>(null);
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
	const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		date: "",
		time: "",
		location: "",
		bannerImage: ""
	});

	const fetchEvents = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await EventService.getEvents();
			setEvents(data);
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

	const resetForm = () => {
		setFormData({
			name: "",
			date: "",
			time: "",
			location: "",
			bannerImage: ""
		});
	};

	const openAddModal = () => {
		resetForm();
		setEditingEvent(null);
		setModalVisible(true);
	};

	const openEditModal = (event: Event) => {
		setEditingEvent(event);
		setFormData({
			name: event.name,
			date: event.date,
			time: event.time,
			location: event.location,
			bannerImage: event.banner_image
		});
		setModalVisible(true);
	};

	const showDatePicker = () => {
		setDatePickerVisibility(true);
	};

	const hideDatePicker = () => {
		setDatePickerVisibility(false);
	};

	const handleDateConfirm = (date: Date) => {
		const formattedDate = date.toISOString().split("T")[0];
		setFormData({ ...formData, date: formattedDate });
		hideDatePicker();
	};

	const showTimePicker = () => {
		setTimePickerVisibility(true);
	};

	const hideTimePicker = () => {
		setTimePickerVisibility(false);
	};

	const handleTimeConfirm = (date: Date) => {
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		setFormData({
			...formData,
			time: `${hours}:${minutes}`
		});
		hideTimePicker();
	};

	const handleSave = async () => {
		try {
			setLoading(true);

			const eventData = {
				name: formData.name,
				date: formData.date,
				time: formData.time,
				location: formData.location,
				banner_image: formData.bannerImage
			};

			if (editingEvent) {
				const { error } = await supabase
					.from("events")
					.update(eventData)
					.eq("id", editingEvent.id);

				if (error) throw error;
			} else {
				const { error } = await supabase
					.from("events")
					.insert([eventData]);

				if (error) throw error;
			}

			await fetchEvents();
			setModalVisible(false);
			resetForm();
		} catch (err) {
			console.error("Error saving event:", err);
			Alert.alert(
				"Error",
				"Failed to save event. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (eventId: string) => {
		Alert.alert(
			"Confirm Delete",
			"Are you sure you want to delete this event? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true);
							const { error } = await supabase
								.from("events")
								.delete()
								.eq("id", eventId);

							if (error) throw error;

							await fetchEvents();
						} catch (err) {
							console.error("Error deleting event:", err);
							Alert.alert(
								"Error",
								"Failed to delete event. Please try again."
							);
						} finally {
							setLoading(false);
						}
					}
				}
			]
		);
	};

	return (
		<View className="flex-1 bg-[#C6E3D3]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Manage Events
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="bg-[#FFBB38] p-4 mb-4 flex-row items-center justify-center border border-[#333333] rounded-xl"
						onPress={openAddModal}
					>
						<AntDesign name="plus" size={20} color="black" />
						<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
							Add New Event
						</Text>
					</TouchableOpacity>
					{loading && events.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator
								size="large"
								color="#fed787"
							/>
							<Text className="mt-4 font-lexend text-[#666666]">
								Loading events...
							</Text>
						</View>
					) : error ? (
						<View className="items-center justify-center py-8">
							<AntDesign
								name="exclamationcircle"
								size={40}
								color="#fed787"
							/>
							<Text className="mt-4 font-lexend text-[#666666]">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-4 bg-[#fed787] px-4 py-2 border border-[#333333]"
								onPress={fetchEvents}
							>
								<Text className="font-lexend-medium text-black">
									Retry
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView>
							{events.map((event) => (
								<View
									key={event.id}
									className="bg-white mb-4 border border-[#333333] rounded-xl"
								>
									<View className="flex-row">
										<Image
											source={{
												uri: event.banner_image
											}}
											className="w-24 h-24"
											resizeMode="cover"
										/>
										<View className="flex-1 p-3">
											<Text className="text-base font-lexend-bold tracking-tighter-lexend text-black">
												{event.name} in{" "}
												{event.location}
											</Text>
											<View className="flex-row items-center mt-1">
												<AntDesign
													name="calendar"
													size={12}
													color="#555"
												/>
												<Text className="ml-1 text-sm font-lexend text-[#555555]">
													{formatDate(
														event.date
													)}
												</Text>
											</View>
											<View className="flex-row items-center mt-1">
												<AntDesign
													name="clockcircleo"
													size={12}
													color="#555"
												/>
												<Text className="ml-1 text-sm font-lexend text-[#555555]">
													{formatTime(
														event.time
													)}
												</Text>
											</View>
										</View>
									</View>
									<View className="flex-row border-t border-[#eee] p-2">
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												openEditModal(event)
											}
										>
											<Text className="font-lexend-medium text-[#333333]">
												<Feather
													name="edit"
													size={16}
												/>{" "}
												Edit
											</Text>
										</TouchableOpacity>
										<View className="border-r border-[#eee] mx-2" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												handleDelete(event.id)
											}
										>
											<Text className="font-lexend-medium text-[#fe5b62]">
												<Feather
													name="trash-2"
													size={16}
												/>{" "}
												Delete
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</ScrollView>
					)}
				</View>
			</SafeAreaView>
			<Modal visible={modalVisible} animationType="slide">
				<SafeAreaView className="flex-1 bg-[#E1F2E9]">
					<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
						<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
							{editingEvent ? "Edit Event" : "Add Event"}
						</Text>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}
						>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<ScrollView className="p-4">
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								EVENT NAME
							</Text>
							<TextInput
								value={formData.name}
								onChangeText={(text) =>
									setFormData({
										...formData,
										name: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Event name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								DATE
							</Text>
							<TouchableOpacity
								onPress={showDatePicker}
								className="bg-white text-black p-3 border border-[#333333] font-lexend flex-row justify-between items-center"
							>
								<Text
									className={
										formData.date
											? "text-black font-lexend"
											: "text-[#999999] font-lexend"
									}
								>
									{formData.date
										? formData.date
										: "Select date"}
								</Text>
								<Feather
									name="calendar"
									size={20}
									color="#333"
								/>
							</TouchableOpacity>
							<DateTimePickerModal
								isVisible={isDatePickerVisible}
								mode="date"
								onConfirm={handleDateConfirm}
								onCancel={hideDatePicker}
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								TIME
							</Text>
							<TouchableOpacity
								onPress={showTimePicker}
								className="bg-white text-black p-3 border border-[#333333] font-lexend flex-row justify-between items-center"
							>
								<Text
									className={
										formData.time
											? "text-black font-lexend"
											: "text-[#999999] font-lexend"
									}
								>
									{formData.time
										? formData.time
										: "Select time"}
								</Text>
								<Feather
									name="clock"
									size={20}
									color="#333"
								/>
							</TouchableOpacity>
							<DateTimePickerModal
								isVisible={isTimePickerVisible}
								mode="time"
								onConfirm={handleTimeConfirm}
								onCancel={hideTimePicker}
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								LOCATION
							</Text>
							<TextInput
								value={formData.location}
								onChangeText={(text) =>
									setFormData({
										...formData,
										location: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Event location"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text className="mb-1 text-sm font-lexend-medium text-[#666666]">
								BANNER IMAGE
							</Text>
							<TextInput
								value={formData.bannerImage}
								onChangeText={(text) =>
									setFormData({
										...formData,
										bannerImage: text
									})
								}
								className="bg-white text-black p-3 border border-[#333333] font-lexend"
								placeholder="Banner image URL"
								placeholderTextColor="#666666"
							/>
						</View>
						<TouchableOpacity
							className="bg-[#FFBB38] p-4 mb-4 items-center justify-center border border-[#333333] rounded-3xl"
							onPress={handleSave}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator
									size="small"
									color="#333333"
								/>
							) : (
								<Text className="font-lexend-medium tracking-tighter-lexend text-black">
									Save Event
								</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</View>
	);
}
