import { useClerk, useSignIn, useSignUp, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
	isLoaded: boolean;
	isSignedIn: boolean;
	signUp: (email: string, firstName?: string, lastName?: string) => Promise<void>;
	signIn: (email: string) => Promise<void>;
	verifyOtp: (code: string, type: "login" | "signup") => Promise<void>;
	signOut: () => Promise<void>;
	user: any | null;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	const { signUp: clerkSignUp, setActive: setActiveSignUp } = useSignUp();
	const { signIn: clerkSignIn, setActive: setActiveSignIn } = useSignIn();
	const clerk = useClerk();

	const [isLoaded, setIsLoaded] = useState(false);
	const [currentEmail, setCurrentEmail] = useState<string | null>(null);

	useEffect(() => {
		if (clerkLoaded) {
			setIsLoaded(true);
		}
	}, [clerkLoaded]);

	const signUp = async (email: string, firstName?: string, lastName?: string) => {
		try {
			setCurrentEmail(email);

			const result = await clerkSignUp?.create({
				emailAddress: email,
				firstName,
				lastName
			});

			if (!result) {
				throw new Error("Failed to create user account");
			}

			console.log("User creation response:", JSON.stringify(result, null, 2));

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
			setCurrentEmail(email);
			const result = await clerkSignIn?.create({
				identifier: email,
			});

			if (!result) {
				throw new Error("Failed to create sign-in attempt");
			}

			if (!result.supportedFirstFactors) {
				throw new Error("No authentication factors available");
			}

			const emailAddressId = result.supportedFirstFactors.find(
				factor => factor.strategy === 'email_code'
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
				const verification = await clerkSignUp?.attemptEmailAddressVerification({
					code
				});

				console.log("Signup verification response:", JSON.stringify(verification, null, 2));
				if (verification?.status === "complete" || verification?.verifications?.emailAddress?.status === "verified") {
					if (verification.createdSessionId) {
						await setActiveSignUp?.({ session: verification.createdSessionId });

						await new Promise(resolve => setTimeout(resolve, 300));

						router.replace("/(home)");
					} else {
						console.error("No session ID returned after verification");
						throw new Error("Account created but no session available");
					}
				} else {
					console.error("Verification failed with status:", verification?.status);
					throw new Error("Verification failed or returned unexpected status");
				}
			} else {
				const verification = await clerkSignIn?.attemptFirstFactor({
					strategy: "email_code",
					code
				});

				console.log("Login verification response:", JSON.stringify(verification, null, 2));
				if (verification?.status === "complete") {
					await setActiveSignIn?.({ session: verification.createdSessionId });
					router.replace("/(home)");
				} else {
					console.error("Verification failed with status:", verification?.status);
					throw new Error("Verification failed or returned unexpected status");
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
			// router.replace("/");
			router.dismissAll();
		} catch (error) {
			console.error("Error during sign out:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isLoaded,
				isSignedIn: isSignedIn || false,
				signUp,
				signIn,
				verifyOtp,
				signOut,
				user
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
