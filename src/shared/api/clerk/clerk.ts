import { useClerk, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";

export const useClerkAuth = () => {
	const { signUp: clerkSignUp, setActive: setActiveSignUp } =
		useSignUp();
	const { signIn: clerkSignIn, setActive: setActiveSignIn } =
		useSignIn();
	const clerk = useClerk();

	const signUp = async (
		email: string,
		firstName?: string,
		lastName?: string
	) => {
		try {
			// Build the payload dynamically, only including firstName and lastName if they have values
			const payload: {
				emailAddress: string;
				firstName?: string;
				lastName?: string;
			} = {
				emailAddress: email
			};

			if (firstName && firstName.trim()) {
				payload.firstName = firstName.trim();
			}

			if (lastName && lastName.trim()) {
				payload.lastName = lastName.trim();
			}

			const result = await clerkSignUp?.create(payload);

			if (!result) {
				throw new Error("Failed to create user account");
			}

			console.log(
				"User creation response:",
				JSON.stringify(result, null, 2)
			);

			await clerkSignUp?.prepareEmailAddressVerification({
				strategy: "email_code"
			});

			router.push({
				pathname: "/otp",
				params: { email, type: "signup" }
			});
		} catch (error) {
			console.error("Error during sign up:", error);
			throw error;
		}
	};

	const signIn = async (email: string) => {
		try {
			const result = await clerkSignIn?.create({
				identifier: email
			});

			if (!result) {
				throw new Error("Failed to create sign-in attempt");
			}

			if (!result.supportedFirstFactors) {
				throw new Error("No authentication factors available");
			}

			const emailAddressId = result.supportedFirstFactors.find(
				(factor) => factor.strategy === "email_code"
			)?.emailAddressId;

			if (!emailAddressId) {
				throw new Error("Email code authentication not available");
			}

			await clerkSignIn?.prepareFirstFactor({
				strategy: "email_code",
				emailAddressId
			});

			router.push({
				pathname: "/otp",
				params: { email, type: "login" }
			});
		} catch (error) {
			console.error("Error during sign in:", error);
			throw error;
		}
	};

	const verifyOtp = async (code: string, type: "login" | "signup") => {
		try {
			if (type === "signup") {
				const verification =
					await clerkSignUp?.attemptEmailAddressVerification({
						code
					});

				console.log(
					"Signup verification response:",
					JSON.stringify(verification, null, 2)
				);
				if (
					verification?.status === "complete" ||
					verification?.verifications?.emailAddress?.status ===
						"verified"
				) {
					if (verification.createdSessionId) {
						await setActiveSignUp?.({
							session: verification.createdSessionId
						});

						await new Promise((resolve) =>
							setTimeout(resolve, 300)
						);

						router.replace("/(home)");
					} else {
						console.error(
							"No session ID returned after verification"
						);
						throw new Error(
							"Account created but no session available"
						);
					}
				} else {
					console.error(
						"Verification failed with status:",
						verification?.status
					);
					throw new Error(
						"Verification failed or returned unexpected status"
					);
				}
			} else {
				const verification = await clerkSignIn?.attemptFirstFactor(
					{
						strategy: "email_code",
						code
					}
				);

				console.log(
					"Login verification response:",
					JSON.stringify(verification, null, 2)
				);
				if (verification?.status === "complete") {
					await setActiveSignIn?.({
						session: verification.createdSessionId
					});
					router.replace("/(home)");
				} else {
					console.error(
						"Verification failed with status:",
						verification?.status
					);
					throw new Error(
						"Verification failed or returned unexpected status"
					);
				}
			}
		} catch (error) {
			console.error("Error during OTP verification:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await clerk.signOut();
			router.replace("/(auth)/login");
		} catch (error) {
			console.error("Error during sign out:", error);
			throw error;
		}
	};

	return {
		signUp,
		signIn,
		verifyOtp,
		signOut
	};
};
