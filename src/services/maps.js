import API from "./api";

/**
 * Geocodes an address string using the backend API.
 * Hides the Google Maps API key from the frontend.
 * 
 * @param {string} address - The address to geocode.
 * @returns {Promise<{lat: number, lng: number, formatted_address: string}>}
 */
export const geocodeAddress = async (address) => {
    try {
        const response = await API.post("/geocode", { address });
        return response.data;
    } catch (error) {
        console.error("Geocoding failed:", error);
        throw error;
    }
};

/**
 * Reverse geocodes coordinates using the backend API.
 * Hides the Google Maps API key from the frontend.
 * 
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {Promise<{formatted_address: string}>}
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await API.post("/reverse-geocode", { lat, lng });
        return response.data;
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        throw error;
    }
};

/**
 * Performs a PIN code lookup via the backend.
 * @param {string} pincode - 6-digit PIN.
 * @returns {Promise<{city: string, district: string, state: string, country: string, lat: number, lng: number}>}
 */
export const pincodeLookup = async (pincode) => {
    try {
        // Correct path without duplicate /api. Assuming axios instance has base /api.
        const response = await API.get(`/pincode-lookup?pin=${pincode}`);
        return response.data;
    } catch (error) {
        console.error("PIN lookup failed:", error);
        throw error;
    }
};
