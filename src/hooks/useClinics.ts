import { useQuery } from '@tanstack/react-query';
import { shopService, ShopPublicResponse } from '../services/shop.service';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Debounce a value by `delay` ms — prevents API spam while typing */
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useClinics() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'Tất cả';
  const initialCity = searchParams.get('city') || '';
  const initialQ = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [cityQuery, setCityQuery] = useState(initialCity);
  // activeService stores the BE shopType value ('Tất cả' | 'CLINIC' | 'SPA' | ...)
  const [activeService, setActiveService] = useState(initialType);
  const [minRating, setMinRating] = useState(0);

  // Debounce text inputs so API is only called after user stops typing
  const debouncedSearch = useDebounce(searchQuery, 400);
  const debouncedCity   = useDebounce(cityQuery,   400);

  const shopTypeParam = activeService === 'Tất cả' ? undefined : activeService;

  const { data: shops = [], isLoading, error } = useQuery({
    queryKey: ['shops-public', debouncedSearch, debouncedCity, shopTypeParam],
    queryFn: () => shopService.searchPublic({
      keyword:  debouncedSearch || undefined,
      city:     debouncedCity   || undefined,
      shopType: shopTypeParam,
    }),
    staleTime: 30_000,
  });

  // Client-side rating filter (BE already filters by shopType/keyword/city)
  const filteredShops = useMemo(() => {
    if (minRating === 0) return shops;
    return shops.filter((s: ShopPublicResponse) => s.ratingAvg >= minRating);
  }, [shops, minRating]);

  return {
    clinics: filteredShops,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    cityQuery,
    setCityQuery,
    activeService,
    setActiveService,
    minRating,
    setMinRating,
  };
}
