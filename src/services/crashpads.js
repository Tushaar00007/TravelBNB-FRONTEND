import API from "./api";

/**
 * Service for Crashpad listings and search operations.
 */
const CrashpadService = {
    /**
     * Search crashpads by city and/or state.
     * @param {string} city 
     * @param {string} state 
     */
    search: async (city = "", state = "", guests = null) => {
        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (state) params.append("state", state);
        if (guests) params.append("guests", guests);
        
        try {
            const response = await API.get(`/crashpads/search?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Search failed:", error);
            throw error;
        }
    },

    /**
     * Get unique city/state combinations for search suggestions.
     */
    getLocations: async () => {
        try {
            const response = await API.get("/crashpads/locations");
            return response.data; // Array of { city, state }
        } catch (error) {
            console.error("Failed to fetch locations:", error);
            return [];
        }
    },

    /**
     * Get a single crashpad by ID.
     */
    getById: async (id) => {
        try {
            const response = await API.get(`/crashpads/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch crashpad:", error);
            throw error;
        }
    }
};

export default CrashpadService;
