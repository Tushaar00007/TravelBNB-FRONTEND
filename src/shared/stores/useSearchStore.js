import { create } from 'zustand';

const DEFAULT_FILTERS = {
  minPrice: 0,
  maxPrice: 10000,
  propertyType: [],
  amenities: [],
};

export const useSearchStore = create((set) => ({
  filters: DEFAULT_FILTERS,
  sort: 'newest',
  location: '',
  city: '',
  state: '',
  guests: 0,
  
  setFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  toggleArrayFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: state.filters[key].includes(value)
          ? state.filters[key].filter((v) => v !== value)
          : [...state.filters[key], value],
      },
    })),
  
  setSort: (sort) => set({ sort }),
  setLocation: (location) => set({ location }),
  setCity: (city) => set({ city }),
  setState: (state) => set({ state }),
  setGuests: (guests) => set({ guests }),
  
  clearFilters: () => set({ 
    filters: DEFAULT_FILTERS, 
    sort: 'newest',
    city: '',
    state: '',
    location: ''
  }),
}));
