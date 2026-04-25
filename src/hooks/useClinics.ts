import { useQuery } from '@tanstack/react-query';
import { clinicService } from '../services/clinic.service';
import { Clinic } from '../types';
import { useState, useMemo } from 'react';

export function useClinics() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState('Tất cả');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const { data: clinics = [], isLoading, error } = useQuery({
    queryKey: ['clinics'],
    queryFn: clinicService.getAll,
  });

  const filteredClinics = useMemo(() => {
    return clinics.filter((c: Clinic) => {
      const matchSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchOpen = !showOpenOnly || c.isOpen;
      const matchVerified = !showVerifiedOnly || c.verified;
      const matchRating = c.rating >= minRating;
      
      // Additional service type filtration if needed
      const matchService = activeService === 'Tất cả' || c.tags.includes(activeService);

      return matchSearch && matchOpen && matchVerified && matchRating && matchService;
    });
  }, [clinics, searchQuery, showOpenOnly, showVerifiedOnly, minRating, activeService]);

  return {
    clinics: filteredClinics,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    activeService,
    setActiveService,
    showOpenOnly,
    setShowOpenOnly,
    showVerifiedOnly,
    setShowVerifiedOnly,
    minRating,
    setMinRating,
  };
}
