export function formatPhoneNumber(phone) {
	if (phone === null || phone === undefined || phone === "") {
		return "N/A";
	}

	const rawValue = String(phone).trim();
	if (!rawValue) {
		return "N/A";
	}

	const digitsOnly = rawValue.replace(/\D/g, "");

	if (!digitsOnly) {
		return rawValue;
	}

	if (rawValue.startsWith("+")) {
		return `+${digitsOnly}`;
	}

	if (digitsOnly.length === 10) {
		return `0${digitsOnly}`;
	}

	if (digitsOnly.length === 13 && digitsOnly.startsWith("234")) {
		return `+${digitsOnly}`;
	}

	if (digitsOnly.length === 12 && digitsOnly.startsWith("234")) {
		return `+${digitsOnly}`;
	}

	return digitsOnly;
}
