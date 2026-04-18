import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialFormData = {
    type: "",
    location: {
        address_line: "",
        city: "",
        state: "",
        country: "INDIA",
        pincode: "",
        lat: null,
        lng: null,
        flat_suite: "",
        street: "",
        landmark: "",
        locality: "",
        address: ""
    },
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    safety: [],
    title: "",
    description: "",
    is_free: true,
    price_per_night: 0
};

export const useHostOnboardingStore = create(
    persist(
        (set) => ({
            formData: initialFormData,
            images: [],
            
            // Actions
            setFormData: (data) => set((state) => ({ 
                formData: { ...state.formData, ...data } 
            })),
            
            setNestedLocation: (locationData) => set((state) => ({
                formData: {
                    ...state.formData,
                    location: { ...state.formData.location, ...locationData }
                }
            })),
            
            setImages: (images) => set({ images }),
            
            resetOnboarding: () => set({ 
                formData: initialFormData, 
                images: [] 
            }),

            toggleMultiSelect: (field, item) => set((state) => ({
                formData: {
                    ...state.formData,
                    [field]: state.formData[field].includes(item)
                        ? state.formData[field].filter(i => i !== item)
                        : [...state.formData[field], item]
                }
            }))
        }),
        {
            name: 'host-onboarding-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
