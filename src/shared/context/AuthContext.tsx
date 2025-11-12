import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useClerkAuth } from "@shared/api/clerk";
import {
	getUserProfile,
	upsertUserFromClerk
} from "@shared/api/supabase/userSync";
import React, {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useState
} from "react";
import { Alert, BackHandler, Platform } from "react-native";

interface AuthContextProps {
	isLoaded: boolean;
	isSignedIn: boolean | undefined;
	userId?: string;
	user?: ReturnType<typeof useUser>["user"];
	isAdmin: boolean;
	offlineMode: boolean;
	isGuestMode: boolean;
	setGuestMode: (enabled: boolean) => void;
	signUp: ReturnType<typeof useClerkAuth>["signUp"];
	signIn: ReturnType<typeof useClerkAuth>["signIn"];
	verifyOtp: ReturnType<typeof useClerkAuth>["verifyOtp"];
	signOut: ReturnType<typeof useClerkAuth>["signOut"];
}

const AuthContext = createContext<AuthContextProps | null>(null);

const useAuthValue = () => {
	const { isLoaded: clerkLoaded, isSignedIn, user } = useUser();
	const { signUp, signIn, verifyOtp, signOut } = useClerkAuth();
	const { isOnline } = useNetworkStatus();
	const { t } = useTranslation();
	const [offlineMode, setOfflineMode] = useState(false);
	const [offlineUser, setOfflineUser] = useState<any>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [authStateStable, setAuthStateStable] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isGuestMode, setIsGuestMode] = useState(false);

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

	useEffect(() => {
		(async () => {
			if (clerkLoaded && isSignedIn && user) {
				try {
					const snapshot = {
						id: user.id,
						fullName: user.fullName,
						imageUrl: user.imageUrl,
						isAdmin
					};
					await AsyncStorage.setItem(
						"offline_user",
						JSON.stringify(snapshot)
					);
				} catch {}
			}
		})();
	}, [clerkLoaded, isSignedIn, user, isAdmin]);

	useEffect(() => {
		if (!clerkLoaded && !isOnline && !offlineUser && !isGuestMode) {
			(async () => {
				try {
					const raw = await AsyncStorage.getItem("offline_user");
					if (raw) {
						const cached = JSON.parse(raw);
						setOfflineUser(cached);
						setIsAdmin(!!cached.isAdmin);
						setOfflineMode(true);
						setIsLoaded(true);
					}
				} catch {}
			})();
		}
	}, [clerkLoaded, isOnline, offlineUser, isGuestMode]);

	useEffect(() => {
		if (clerkLoaded && offlineMode) {
			setOfflineMode(false);
		}
	}, [clerkLoaded, offlineMode]);

	const setGuestMode = (enabled: boolean) => {
		setIsGuestMode(enabled);
		if (enabled) {
			// If enabling guest mode, disable offline mode
			setOfflineMode(false);
			setOfflineUser(null);
			setIsLoaded(true);
		}
	};

	const handleSignOut = async () => {
		if (isGuestMode) {
			// For guest mode, show alert and close app
			Alert.alert(
				t("common.guestSignedOut"),
				t("common.guestSignedOutMessage"),
				[
					{
						text: "OK",
						onPress: () => {
							// Clear guest mode state
							setIsGuestMode(false);
							setIsLoaded(false);

							// Close the app after a short delay
							setTimeout(() => {
								if (Platform.OS === "android") {
									BackHandler.exitApp();
								} else if (Platform.OS === "ios") {
									// iOS doesn't allow programmatic app exit
									// The app will remain in background state
									console.log(
										"iOS: App cannot be programmatically closed"
									);
								}
							}, 500);
						}
					}
				],
				{ cancelable: false }
			);
		} else {
			// For authenticated users, do regular sign out
			await signOut();
		}
	};

	return {
		isLoaded,
		isSignedIn: isSignedIn || !!offlineUser || isGuestMode,
		userId: user?.id,
		user: user || offlineUser,
		isAdmin,
		offlineMode,
		isGuestMode,
		setGuestMode,
		signUp,
		signIn,
		verifyOtp,
		signOut: handleSignOut
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
