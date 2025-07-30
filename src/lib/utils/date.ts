export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { 
		weekday: 'short', 
		month: 'short', 
		day: 'numeric',
		year: 'numeric'
	});
}

export function formatTime(timeString: string): string {
	const [hours, minutes] = timeString.split(':').map(Number);
	const date = new Date();
	date.setHours(hours, minutes, 0, 0);
	return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function isToday(dateString: string): boolean {
	const today = new Date();
	const eventDate = new Date(dateString);
	return today.toDateString() === eventDate.toDateString();
}
