import { APIProvider } from "@vis.gl/react-google-maps";

/**
 * A wrapper for the @vis.gl/react-google-maps APIProvider.
 * Use this to wrap any component or page that requires Google Maps functionality.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.libraries=['places', 'geocoding', 'marker']] - Libraries to load.
 */
const GoogleMapsProvider = ({ children, libraries = ["places", "geocoding", "marker"] }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("Google Maps API Key is missing. Please check your .env file.");
        return <>{children}</>;
    }

    return (
        <APIProvider 
            apiKey={apiKey} 
            libraries={libraries}
            onLoad={() => console.log("Google Maps API Loaded")}
            onError={(err) => console.error("Google Maps API Load Error:", err)}
        >
            {children}
        </APIProvider>
    );
};

export default GoogleMapsProvider;
