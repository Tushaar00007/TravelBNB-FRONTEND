import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

/**
 * A reusable Google Places Autocomplete input field.
 * Handles selecting a place and returning its data (address and coordinates).
 * 
 * @param {Object} props
 * @param {string} props.value - Current value of the input.
 * @param {Function} props.onPlaceSelect - Callback when a place is selected. Receives (place, { lat, lng }).
 * @param {string} props.placeholder - Input placeholder.
 * @param {string} props.className - Input classes.
 */
const PlaceAutocomplete = ({ value, onPlaceSelect, placeholder = "Search for a destination", className = "" }) => {
    const [inputValue, setInputValue] = useState(value || "");
    const inputRef = useRef(null);
    const places = useMapsLibrary("places");

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = {
            fields: ["geometry", "name", "formatted_address"],
        };

        const autocomplete = new places.Autocomplete(inputRef.current, options);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const formattedAddress = place.formatted_address || place.name;
                
                setInputValue(formattedAddress);
                if (onPlaceSelect) {
                    onPlaceSelect(place, { lat, lng });
                }
            }
        });

        return () => {
            if (window.google && window.google.maps && window.google.maps.event) {
                google.maps.event.clearInstanceListeners(autocomplete);
            }
        };
    }, [places]);

    return (
        <input
            ref={inputRef}
            className={className}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
        />
    );
};

export default PlaceAutocomplete;
