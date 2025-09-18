import { useClerkAuth } from "@/api/clerk";
import {
	getUserProfile,
	upsertUserFromClerk
} from "@/api/supabase/userSync";
import { useUser } from "@clerk/clerk-expo";
import React, {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useState
} from "react";

interface AuthContextProps {
	isLoaded: boolean;
	isSignedIn: boolean | undefined;
	userId?: string;
	user?: ReturnType<typeof useUser>["user"];
	isAdmin: boolean;
	signUp: ReturnType<typeof useClerkAuth>["signUp"];
	signIn: ReturnType<typeof useClerkAuth>["signIn"];
	verifyOtp: ReturnType<typeof useClerkAuth>["verifyOtp"];
	signOut: ReturnType<typeof useClerkAuth>["signOut"];
}

const AuthContext = createContext<AuthContextProps | null>(null);

const useAuthValue = () => {
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	const { signUp, signIn, verifyOtp, signOut } = useClerkAuth();
	const [isLoaded, setIsLoaded] = useState(false);
	const [authStateStable, setAuthStateStable] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	useLayoutEffect(() => {
		if (clerkLoaded) {
			const timer = setTimeout(() => {
				setAuthStateStable(true);
			}, 150);
			return () => clearTimeout(timer);
		}
	}, [clerkLoaded]);

	useEffect(() => {
		if (authStateStable) {
			setIsLoaded(true);
		}
	}, [authStateStable]);

	useEffect(() => {
		const run = async () => {
			if (!authStateStable || !isSignedIn || !user) {
				setIsAdmin(false);
				return;
			}

			try {
				await upsertUserFromClerk({
					id: user.id,
					email:
						user.primaryEmailAddress?.emailAddress ??
						undefined,
					firstName: user.firstName ?? undefined,
					lastName: user.lastName ?? undefined,
					imageUrl: user.imageUrl ?? undefined
				});

				const profile = await getUserProfile(user.id);
				setIsAdmin(Boolean(profile?.is_admin));
			} catch (e) {
				console.error("Failed syncing user/admin status:", e);
				setIsAdmin(false);
			}
		};
		run();
	}, [authStateStable, isSignedIn, user, user?.id]);

	return {
		isLoaded,
		isSignedIn,
		userId: user?.id,
		user,
		isAdmin,
		signUp,
		signIn,
		verifyOtp,
		signOut
	};
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const value = useAuthValue();
	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
