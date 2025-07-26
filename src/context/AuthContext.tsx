import { useClerkAuth } from "@/api/clerk";
import { useUser } from "@clerk/clerk-expo";
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
	const { signUp, signIn, verifyOtp, signOut } = useClerkAuth();

	const [isLoaded, setIsLoaded] = useState(false);
	const [currentEmail, setCurrentEmail] = useState<string | null>(null);

	useEffect(() => {
		if (clerkLoaded) {
			setIsLoaded(true);
		}
	}, [clerkLoaded]);

	const handleSignUp = async (email: string, firstName?: string, lastName?: string) => {
		setCurrentEmail(email);
		return signUp(email, firstName, lastName);
	};

	const handleSignIn = async (email: string) => {
		setCurrentEmail(email);
		return signIn(email);
	};

	return (
		<AuthContext.Provider
			value={{
				isLoaded,
				isSignedIn: isSignedIn || false,
				signUp: handleSignUp,
				signIn: handleSignIn,
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
