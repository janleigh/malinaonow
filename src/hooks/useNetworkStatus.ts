import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

function useNetworkStatus() {
	const [isOnline, setIsOnline] = useState(true);

	useEffect(() => {
		const s = NetInfo.addEventListener((state) => {
			setIsOnline(
				Boolean(state.isConnected) &&
					Boolean(state.isInternetReachable)
			);
		});
		return () => s && s();
	}, []);

	return { isOnline };
}

export { useNetworkStatus };
