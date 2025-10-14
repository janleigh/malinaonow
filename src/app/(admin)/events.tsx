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
		if (date < new Date()) {
			Alert.alert(
				"Invalid Time",
				"You cannot select a time in the past."
			);
			return;
		}

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
				await EventService.createEvent(eventData, bannerImageFile);
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
		<View className="flex-1 bg-background">
			<SafeAreaView className="flex-1">
				<View className="flex-row items-center justify-between p-4">
					<Text
						className="android:font-normal text-2xl text-text"
						fontName="Montserrat_700Bold">
						Manage Events
					</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name="x" size={24} color="#f7f7f7" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<TouchableOpacity
						className="mb-4 flex-row items-center justify-center rounded-xl border border-line bg-primary p-3"
						onPress={openAddModal}>
						<AntDesign name="plus" size={20} color="black" />
						<Text
							className="ml-2 text-black"
							fontName="Poppins_700Bold">
							Add New Event
						</Text>
					</TouchableOpacity>
					{loading && events.length === 0 ? (
						<View className="items-center justify-center py-8">
							<ActivityIndicator
								size="large"
								color="#0ff6be"
							/>
							<Text
								className="mt-4 text-text-inactive"
								fontName="Poppins_500Medium">
								Loading events...
							</Text>
						</View>
					) : error ? (
						<View className="items-center justify-center py-8">
							<AntDesign
								name="exclamationcircle"
								size={40}
								color="#0ff6be"
							/>
							<Text
								className="mt-4 text-text-inactive"
								fontName="Poppins_500Medium">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-4 rounded-lg border border-line bg-primary px-4 py-2"
								onPress={fetchEvents}>
								<Text
									className="text-black"
									fontName="Montserrat_700Bold">
									Retry
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView>
							{events.map((event) => (
								<View
									key={event.id}
									className="mb-4 rounded-xl border border-line bg-surface">
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
												className="text-base text-text"
												fontName="Montserrat_700Bold">
												{event.name} in{" "}
												{event.location}
											</Text>
											<View className="mt-1 flex-row items-center">
												<AntDesign
													name="calendar"
													size={12}
													color="#cacbca"
												/>
												<Text
													className="ml-1 text-sm text-text-inactive"
													fontName="Poppins_500Medium">
													{formatDate(
														event.date
													)}
												</Text>
											</View>
											<View className="mt-1 flex-row items-center">
												<AntDesign
													name="clockcircleo"
													size={12}
													color="#cacbca"
												/>
												<Text
													className="ml-1 text-sm text-text-inactive"
													fontName="Poppins_500Medium">
													{formatTime(
														event.time
													)}
												</Text>
											</View>
										</View>
									</View>
									<View className="flex-row border-t border-line p-2">
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												openEditModal(event)
											}>
											<Text
												className="text-text-inactive"
												fontName="Poppins_500Medium">
												<Feather
													name="edit"
													size={16}
												/>{" "}
												Edit
											</Text>
										</TouchableOpacity>
										<View className="mx-2 border-r border-line" />
										<TouchableOpacity
											className="flex-1 items-center py-2"
											onPress={() =>
												handleDelete(event.id)
											}>
											<Text
												className="text-[#fe5b62]"
												fontName="Poppins_500Medium">
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
				<SafeAreaView className="flex-1 bg-background">
					<View className="flex-row items-center justify-between p-4">
						<Text
							className="android:font-normal text-2xl text-text"
							fontName="Montserrat_700Bold">
							{editingEvent ? "Edit Event" : "Add Event"}
						</Text>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}>
							<Feather name="x" size={24} color="#f7f7f7" />
						</TouchableOpacity>
					</View>
					<ScrollView className="p-4">
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className="rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Event name"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
								DATE
							</Text>
							<TouchableOpacity
								onPress={showDatePicker}
								className="flex-row items-center justify-between rounded-lg border border-line bg-surface p-3 text-text">
								<Text
									className={
										formData.date
											? "text-text"
											: "text-[#999999]"
									}
									fontName="Poppins_500Medium">
									{formData.date
										? formData.date
										: "Select date"}
								</Text>
								<Feather
									name="calendar"
									size={20}
									color="#cacbca"
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
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
								TIME
							</Text>
							<TouchableOpacity
								onPress={showTimePicker}
								className="flex-row items-center justify-between rounded-lg border border-line bg-surface p-3 text-text">
								<Text
									className={
										formData.time
											? "text-text"
											: "text-[#999999]"
									}
									fontName="Poppins_500Medium">
									{formData.time
										? formData.time
										: "Select time"}
								</Text>
								<Feather
									name="clock"
									size={20}
									color="#cacbca"
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
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
								className="rounded-lg border border-line bg-surface p-3 text-text"
								placeholder="Event location"
								placeholderTextColor="#666666"
							/>
						</View>
						<View className="mb-4">
							<Text
								className="mb-1 text-sm text-text-inactive"
								fontName="Montserrat_600SemiBold">
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
							className="mb-4 items-center justify-center rounded-3xl border border-line bg-primary p-4"
							onPress={handleSave}
							disabled={loading}>
							{loading ? (
								<ActivityIndicator
									size="small"
									color="#333333"
								/>
							) : (
								<Text
									className="text-black"
									fontName="Montserrat_700Bold">
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
