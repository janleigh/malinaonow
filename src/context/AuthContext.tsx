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

	// Only update isLoaded when clerkLoaded changes
	useLayoutEffect(() => {
		if (clerkLoaded) {
			setIsLoaded(true);
		}
	}, [clerkLoaded]);

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
