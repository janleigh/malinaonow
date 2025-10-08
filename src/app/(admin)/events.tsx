import { BaseText as Text } from "@/components/BaseText";
import { ImageUploader } from "@/components/common/ImageUploader";
import { AntDesign, Feather } from "@expo/vector-icons";
import { EventService } from "@shared/services";
import { Event } from "@shared/types/supabase";
import { formatDate, formatTime } from "@shared/utils/date";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageEventsScreen() {
	const [bannerImageFile, setBannerImageFile] = useState<any>(null);
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
		setBannerImageFile(null);
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
		setBannerImageFile(null);
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
				// Update existing event with image upload
				await EventService.updateEvent(
					editingEvent.id,
					eventData,
					bannerImageFile
				);
			} else {
				// Create new event with image upload
				await EventService.createEvent(
					eventData,
					bannerImageFile
				);
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
							await EventService.deleteEvent(eventId);
							await fetchEvents();
							Alert.alert(
								"Success",
								"Event deleted successfully."
							);
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
				<View className="flex-row items-center justify-between border-b border-[#eee] p-4">
					<Text
						className="android:font-normal text-2xl tracking-tighter-lexend text-black"
						fontStyle="extrabold"
					>
						Manage Events
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="mb-4 flex-row items-center justify-center rounded-xl border border-[#333333] bg-[#FFBB38] p-4"
						onPress={openAddModal}
					>
						<AntDesign name="plus" size={20} color="black" />
						<Text
							className="ml-2 tracking-tighter-lexend text-black"
							fontStyle="medium"
						>
							Add New Event
						</Text>
					</TouchableOpacity>
					{loading && events.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator
								size="large"
								color="#fed787"
							/>
							<Text className="mt-4 text-[#666666]">
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
							<Text className="mt-4 text-[#666666]">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-4 border border-[#333333] bg-[#fed787] px-4 py-2"
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
									className="mb-4 rounded-xl border border-[#333333] bg-white"
								>
									<View className="flex-row">
										<Image
											source={{
												uri: event.banner_image
											}}
											className="h-24 w-24"
											resizeMode="cover"
										/>
										<View className="flex-1 p-3">
											<Text
												className="text-base tracking-tighter-lexend text-black"
												fontStyle="bold"
											>
												{event.name} in{" "}
												{event.location}
											</Text>
											<View className="mt-1 flex-row items-center">
												<AntDesign
													name="calendar"
													size={12}
													color="#555"
												/>
												<Text className="ml-1 text-sm text-[#555555]">
													{formatDate(
														event.date
													)}
												</Text>
											</View>
											<View className="mt-1 flex-row items-center">
												<AntDesign
													name="clockcircleo"
													size={12}
													color="#555"
												/>
												<Text className="ml-1 text-sm text-[#555555]">
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
											<Text
												className="text-[#333333]"
												fontStyle="medium"
											>
												<Feather
													name="edit"
													size={16}
												/>{" "}
												Edit
											</Text>
										</TouchableOpacity>
										<View className="mx-2 border-r border-[#eee]" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												handleDelete(event.id)
											}
										>
											<Text
												className="text-[#fe5b62]"
												fontStyle="medium"
											>
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
					<View className="flex-row items-center justify-between border-b border-[#eee] p-4">
						<Text
							className="android:font-normal text-2xl tracking-tighter-lexend text-black"
							fontStyle="extrabold"
						>
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
							<Text className="mb-1 font-lexend-medium text-sm text-[#666666]">
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
								className="border border-[#333333] bg-white p-3 text-black"
								placeholder="Event name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
								DATE
							</Text>
							<TouchableOpacity
								onPress={showDatePicker}
								className="flex-row items-center justify-between border border-[#333333] bg-white p-3 text-black"
							>
								<Text
									className={
										formData.date
											? "text-black"
											: "text-[#999999]"
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
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
								TIME
							</Text>
							<TouchableOpacity
								onPress={showTimePicker}
								className="flex-row items-center justify-between border border-[#333333] bg-white p-3 text-black"
							>
								<Text
									className={
										formData.time
											? "text-black"
											: "text-[#999999]"
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
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
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
								className="border border-[#333333] bg-white p-3 text-black"
								placeholder="Event location"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-[#666666]"
								fontStyle="medium"
							>
								BANNER IMAGE
							</Text>
							<ImageUploader
								entityType="events"
								entityId={editingEvent?.id || "new"}
								fileType="banner"
								currentImageUrl={formData.bannerImage}
								onImageUploaded={(result) => {
									setFormData({
										...formData,
										bannerImage: result.url!
									});
								}}
								onImageDeleted={() => {
									setFormData({
										...formData,
										bannerImage: ""
									});
								}}
								placeholder="Upload banner image"
							/>
						</View>
						<TouchableOpacity
							className="mb-4 items-center justify-center rounded-3xl border border-[#333333] bg-[#FFBB38] p-4"
							onPress={handleSave}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator
									size="small"
									color="#333333"
								/>
							) : (
								<Text
									className="tracking-tighter-lexend text-black"
									fontStyle="medium"
								>
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
