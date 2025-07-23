import { shadowStyles } from "@/utils/styles";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPScreen() {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isResending, setIsResending] = useState(false);
	const [cursorVisible, setCursorVisible] = useState(true);
	const inputRef = useRef<TextInput>(null);

	// Get the email and flow type (login or signup) from route params
	const { email, type } = useLocalSearchParams<{ email: string; type: "login" | "signup" }>();

	// Format and handle OTP input
	const handleOtpChange = (text: string) => {
		// Remove any non-digit characters
		const digitsOnly = text.replace(/\D/g, "");

		// Only keep first 6 digits
		const truncated = digitsOnly.slice(0, 6);

		// Format as xxx-xxx if needed
		if (truncated.length <= 3) {
			setOtp(truncated);
		} else {
			setOtp(`${truncated.substring(0, 3)}-${truncated.substring(3, 6)}`);
		}

		if (error) {
			setError("");
		}
	};

	// Focus the input when component mounts
	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 100);
	}, []);

	// Create blinking cursor effect
	useEffect(() => {
		const interval = setInterval(() => {
			setCursorVisible((prev) => !prev);
		}, 500);

		return () => clearInterval(interval);
	}, []);

	// When user taps on the digit boxes, focus the hidden input
	const focusInput = () => {
		inputRef.current?.focus();
	};

	// Re-focus input if it loses focus
	const handleBlur = () => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 10);
	};

	const handleVerify = async () => {
		// Get only the digits for validation
		const digits = otp.replace(/\D/g, "");

		if (digits.length !== 6) {
			setError("Please enter a valid 6-digit code");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// TODO: Move email validation here.
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Navigate based on the flow type
			if (type === "signup") {
				// TODO: Do an create profile page.
				router.replace("/(home)");
			} else {
				router.replace("/(home)");
			}
		} catch (err) {
			console.error("Verification error:", err);
			setError("Invalid verification code. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		setIsResending(true);
		setError("");

		try {
			// TODO: Resend OTP function here
			await new Promise((resolve) => setTimeout(resolve, 1500));
		} catch (err) {
			console.error("Resend code error:", err);
			setError("Failed to resend code. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	// Calculate the current position where the cursor should appear
	const cursorPosition = otp.replace(/-/g, "").length;
	// Check if we've reached the maximum number of digits
	const isComplete = cursorPosition >= 6;

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<StatusBar style="dark" />
			<SafeAreaView className="flex-1">
				<View className="p-6">
					<Text className="mb-2 text-3xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Verification Code
					</Text>
					<Text className="mb-8 font-lexend tracking-tighter-lexend text-[#333333]">
						{`We've sent a 6-digit code to ${email || "your email"}`}
					</Text>
					<View className="items-center">
						<TextInput
							ref={inputRef}
							value={otp}
							onChangeText={handleOtpChange}
							keyboardType="number-pad"
							maxLength={7} // 6 digits + 1 hyphen
							autoComplete="one-time-code"
							style={{
								position: "absolute",
								opacity: 0,
								height: 0
							}}
							caretHidden
							onBlur={handleBlur}
						/>
						<TouchableOpacity
							onPress={focusInput}
							activeOpacity={0.9}
							className="flex-row justify-center w-full mt-4 mb-2"
						>
							{[0, 1, 2].map((index) => {
								const digit = otp.replace(/-/g, "")[index];
								const showCursor = cursorPosition === index && cursorVisible && !isComplete;
								return (
									<View
										key={`digit-${index}`}
										className={`mx-1.5 h-12 w-12 items-center justify-center
                                            border ${digit ? "border-[#fed787]" : "border-[#333333]"} bg-white`}
										style={shadowStyles.standard}
									>
										{showCursor ? (
											<View className="h-5 w-0.5 bg-black animate-pulse" />
										) : (
											<Text className="text-xl font-bold font-lexend text-black">
												{digit || ""}
											</Text>
										)}
									</View>
								);
							})}
							<View className="items-center justify-center mx-1">
								<Text className="text-xl font-bold font-lexend text-black">-</Text>
							</View>
							{[3, 4, 5].map((index) => {
								const digit = otp.replace(/-/g, "")[index];
								const showCursor = cursorPosition === index && cursorVisible && !isComplete;
								return (
									<View
										key={`digit-${index}`}
										className={`mx-1.5 h-12 w-12 items-center justify-center
                                            border ${digit ? "border-[#fed787]" : "border-[#333333]"} bg-white`}
										style={shadowStyles.standard}
									>
										{showCursor ? (
											<View className="h-5 w-0.5 bg-black animate-pulse" />
										) : (
											<Text className="text-xl font-bold font-lexend text-black">
												{digit || ""}
											</Text>
										)}
									</View>
								);
							})}
						</TouchableOpacity>
						{error ? (
							<Text className="mt-4 text-red-500 font-lexend tracking-tighter-lexend">{error}</Text>
						) : null}
						<TouchableOpacity
							className="mt-8 h-12 w-full items-center justify-center bg-[#fed787] border border-[#333333]"
							style={shadowStyles.standard}
							onPress={handleVerify}
							disabled={isLoading || otp.replace(/\D/g, "").length !== 6}
						>
							{isLoading ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text className="text-base font-extrabold android:font-normal text-black font-lexend-medium tracking-tighter-lexend">
									Verify
								</Text>
							)}
						</TouchableOpacity>
						<View className="mt-6 items-center">
							<Text className="text-center font-lexend tracking-tighter-lexend text-[#333333]">
								Didn&apos;t receive code?{" "}
								<Text
									className="font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend"
									onPress={handleResendCode}
								>
									{isResending ? "Sending..." : "Resend"}
								</Text>
							</Text>
						</View>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
