export function transformGLNtoEPCIS(gln) {
    // Remove non-digit characters from the GLN
    const cleanGLN = gln.replace(/\D/g, '');

    // Check if the cleaned GLN has the expected length
    if (cleanGLN.length >= 13) {
        const companyPrefix = cleanGLN.slice(0, 7);
        const locationReference = cleanGLN.slice(7, 12);
        const extensionDigit = cleanGLN.slice(12, 13);

        // Construct the EPCIS format
        const epcisFormat = `urn:epc:id:sgln:${companyPrefix}.${locationReference}.${extensionDigit}`;

        return epcisFormat;
    }

    return null;
}

export const calculateTimeZoneOffset = () => {
    const currentTime = new Date();
    const timezoneOffsetMinutes = currentTime.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(timezoneOffsetMinutes) / 60);
    const offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);
    const offsetSign = timezoneOffsetMinutes > 0 ? '-' : '+';
    const formattedOffset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

    // Convert to ISO string and replace 'Z' with the formatted offset
    const EventTimeZoneOffSet = currentTime.toISOString().replace('Z', formattedOffset);

    return EventTimeZoneOffSet
}
