import { useClerkAuth } from "@/api/clerk";
import { useUser } from "@clerk/clerk-expo";
import React, {
	createContext,
	useContext,
	useLayoutEffect,
	useState
} from "react";

interface AuthContextProps {
	isLoaded: boolean;
	isSignedIn: boolean;
	signUp: (
		email: string,
		firstName?: string,
		lastName?: string
	) => Promise<void>;
	signIn: (email: string) => Promise<void>;
	verifyOtp: (code: string, type: "login" | "signup") => Promise<void>;
	signOut: () => Promise<void>;
	user: any | null;
}

const AuthContext = createContext<AuthContextProps | null>(null);

// Memoize the auth context value to prevent unnecessary re-renders
const useAuthValue = () => {
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	const { signUp, signIn, verifyOtp, signOut } = useClerkAuth();
	const [isLoaded, setIsLoaded] = useState(false);
	const [authStateStable, setAuthStateStable] = useState(false);

	// Ensure auth state is stable before marking as loaded
	useLayoutEffect(() => {
		if (clerkLoaded) {
			// Add a small delay to ensure auth state is fully synchronized
			// This prevents the race condition on Android after OAuth
			const timer = setTimeout(() => {
				setAuthStateStable(true);
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [clerkLoaded]);

	// Only mark as loaded when both Clerk is loaded and auth state is stable
	useLayoutEffect(() => {
		if (clerkLoaded && authStateStable) {
			setIsLoaded(true);
		}
	}, [clerkLoaded, authStateStable]);

	// Memoize the context value to prevent unnecessary re-renders
	const contextValue = React.useMemo(
		() => ({
			isLoaded,
			isSignedIn: isSignedIn || false,
			signUp: async (
				email: string,
				firstName?: string,
				lastName?: string
			) => {
				return signUp(email, firstName, lastName);
			},
			signIn: async (email: string) => {
				return signIn(email);
			},
			verifyOtp,
			signOut,
			user
		}),
		[isLoaded, isSignedIn, user, signUp, signIn, verifyOtp, signOut]
	);

	return contextValue;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const contextValue = useAuthValue();

	return (
		<AuthContext.Provider value={contextValue}>
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
