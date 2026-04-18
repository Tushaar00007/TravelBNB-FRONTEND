import { useQuery } from '@tanstack/react-query';
import API from '../../../services/api';
import CrashpadService from '../../../services/crashpads';

export const useProperties = (filters, sort, location, guests, city, state) => {
  return useQuery({
    queryKey: ['properties', { filters, sort, location, guests, city, state }],
    queryFn: async () => {
      const homeParams = {
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        propertyType: filters.propertyType.join(',') || undefined,
        amenities: filters.amenities.join(',') || undefined,
        sort: sort,
        guests: guests || undefined,
      };

      if (city) homeParams.city = city.trim();
      if (state) homeParams.state = state.trim();
      if (!city && !state && location) homeParams.location = location;

      const homesPromise = API.get('/homes/', { params: homeParams })
        .then(res => Array.isArray(res.data) ? res.data.map(h => ({ ...h, _type: 'home' })) : [])
        .catch(err => { console.error('❌ Homes fetch error:', err); return []; });

      const crashpadsPromise = (city || state)
        ? CrashpadService.search(city, state, guests)
          .then(res => Array.isArray(res) ? res.map(c => ({ ...c, _type: 'crashpad' })) : [])
          .catch(err => { console.error('❌ Crashpads fetch error:', err); return []; })
        : Promise.resolve([]);

      const [homesData, crashpadsData] = await Promise.all([homesPromise, crashpadsPromise]);
      return [...homesData, ...crashpadsData];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
  });
};

export const usePropertyDetails = (id) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await API.get(`/homes/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useReviews = (propertyId) => {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: async () => {
      const res = await API.get(`/reviews/${propertyId}`);
      return res.data;
    },
    enabled: !!propertyId,
  });
};
