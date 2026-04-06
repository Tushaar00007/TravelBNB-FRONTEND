import React, { useEffect, useRef, useState } from 'react';

// Singleton loader - only created once
let googleMapsPromise = null;

const loadGoogleMaps = (apiKey) => {
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    // Check if already loaded globally
    if (window.google && window.google.maps) {
        googleMapsPromise = Promise.resolve(window.google);
        return googleMapsPromise;
    }

    // Load script manually instead of using Loader
    googleMapsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,maps`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = reject;

        // Only add if not already in document
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            document.head.appendChild(script);
        } else {
            // Script already exists, wait for it
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkLoaded);
                    resolve(window.google);
                }
            }, 100);
        }
    });

    return googleMapsPromise;
};

const GoogleMapPanel = ({ plannerData, onPlaceClick }) => {
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const markersRef = useRef([]);
    const [libLoaded, setLibLoaded] = useState(false);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Helper to extract valid places
    const extractPlacesFromPlan = (plan) => {
        if (!plan) return [];
        const places = [];
        let globalIndex = 1;
        Object.entries(plan).forEach(([dayKey, events]) => {
            events.forEach(event => {
                if (
                    typeof event === 'object' && 
                    event.place_name && 
                    (event.latitude || event.lat) && 
                    (event.longitude || event.lng)
                ) {
                    const lat = parseFloat(event.latitude || event.lat);
                    const lng = parseFloat(event.longitude || event.lng);
                    
                    if (lat !== 0 && lng !== 0) {
                        places.push({ 
                            ...event, 
                            lat, 
                            lng, 
                            markerIndex: globalIndex++ 
                        });
                    }
                }
            });
        });
        return places;
    };

    // 1. Initialize Map Instance
    useEffect(() => {
        if (!mapRef.current) return;

        loadGoogleMaps(GOOGLE_MAPS_API_KEY)
            .then((google) => {
                setLibLoaded(true);
                if (mapInstance) return; // already initialized

                const initialPlaces = extractPlacesFromPlan(plannerData?.plan);
                const center = initialPlaces.length > 0 
                    ? { lat: initialPlaces[0].lat, lng: initialPlaces[0].lng }
                    : { lat: 20.5937, lng: 78.9629 }; // India center

                const map = new google.maps.Map(mapRef.current, {
                    zoom: 12,
                    center: center,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                setMapInstance(map);
            })
            .catch((err) => {
                console.error("Google Maps failed to load:", err);
                setLibLoaded(true);
            });
    }, [mapRef.current]);

    // 2. Manage Markers separately
    useEffect(() => {
        if (!mapInstance || !plannerData?.plan) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        const places = extractPlacesFromPlan(plannerData.plan);
        console.log(`[GoogleMapPanel] Plotting ${places.length} markers`);
        
        if (places.length === 0) return;

        const bounds = new window.google.maps.LatLngBounds();
        
        places.forEach((place) => {
            const marker = new window.google.maps.Marker({
                position: { lat: place.lat, lng: place.lng },
                map: mapInstance,
                label: {
                    text: String(place.markerIndex),
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: '13px',
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: '#EA580C',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2.5,
                    scale: 18,
                },
                title: place.place_name,
                zIndex: 999,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding:10px;min-width:160px;font-family:sans-serif">
                        <p style="font-weight:800;font-size:14px;margin:0 0 4px">${place.place_name}</p>
                        <span style="background:#EA580C;color:white;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">
                            ${place.type || ''}
                        </span>
                        <p style="margin:6px 0 0;font-size:12px;color:#555">
                            ⭐ ${place.rating || ''} · 🕐 ${place.visit_time || place.time || ''} hrs
                        </p>
                    </div>
                `
            });

            marker.addListener('mouseover', () => {
                infoWindow.open(mapInstance, marker);
            });
            marker.addListener('mouseout', () => {
                infoWindow.close();
            });
            marker.addListener('click', () => {
                if (onPlaceClick) onPlaceClick(place);
            });

            markersRef.current.push(marker);
            bounds.extend({ lat: place.lat, lng: place.lng });
        });

        // Fit map to show all markers
        if (markersRef.current.length > 0) {
            mapInstance.fitBounds(bounds);
            const listener = mapInstance.addListener('idle', () => {
                if (mapInstance.getZoom() > 15) mapInstance.setZoom(13);
                window.google.maps.event.removeListener(listener);
            });
        }

    }, [mapInstance, plannerData, onPlaceClick]);

    return (
        <div 
            className="w-full rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl"
            style={{ 
                position: 'sticky', 
                top: '84px', 
                height: 'calc(100vh - 100px)',
                backgroundColor: '#f3f4f6'
            }}
        >
            {!libLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-500 animate-pulse">PREPARING MAP...</p>
                    </div>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
};

export default GoogleMapPanel;
