import React, { useEffect, useRef, useState } from 'react';
import type { NearbyShopResponse, DirectionsResponse } from '../services/clinic.service';

// Goong Map types
declare global {
  interface Window {
    goongjs: any;
  }
}

// Map Key cho frontend (khác với API Key của backend)
const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_API_KEY || 'Qu7Vly4VMWH8W5pYa8X1TCjzozBR21AY8PhcmQ2m';

interface ShopMapProps {
  userLocation: { lat: number; lng: number };
  nearbyShops: NearbyShopResponse[];
  currentShop?: { id: number; latitude: number; longitude: number; shopName: string };
  directions?: DirectionsResponse | null;
  onShopClick?: (shopId: number) => void;
}

export default function ShopMap({ 
  userLocation, 
  nearbyShops, 
  currentShop,
  directions,
  onShopClick 
}: ShopMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);

  // Load Goong Map script
  useEffect(() => {
    if (window.goongjs) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      script.remove();
      link.remove();
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapContainer.current || map.current) return;

    const goongjs = window.goongjs;
    goongjs.accessToken = GOONG_MAP_KEY;

    map.current = new goongjs.Map({
      container: mapContainer.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [userLocation.lng, userLocation.lat],
      zoom: 13,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [scriptLoaded, userLocation]);

  // Update markers when shops change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const goongjs = window.goongjs;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker
    const userMarker = new goongjs.Marker({ color: '#3b82f6' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new goongjs.Popup({ offset: 25 }).setHTML('<div class="font-bold">Vị trí của bạn</div>')
      )
      .addTo(map.current);
    markersRef.current.push(userMarker);

    // Add current shop marker (if viewing a specific shop)
    if (currentShop) {
      const el = document.createElement('div');
      el.className = 'shop-marker-current';
      el.innerHTML = '🏥';
      el.style.fontSize = '32px';
      el.style.cursor = 'pointer';

      const currentMarker = new goongjs.Marker(el)
        .setLngLat([currentShop.longitude, currentShop.latitude])
        .setPopup(
          new goongjs.Popup({ offset: 25 }).setHTML(
            `<div class="font-bold text-primary">${currentShop.shopName}</div>`
          )
        )
        .addTo(map.current);
      markersRef.current.push(currentMarker);
    }

    // Add nearby shops markers
    nearbyShops.forEach(shop => {
      const el = document.createElement('div');
      el.className = 'shop-marker';
      el.innerHTML = '🏪';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';
      el.onclick = () => onShopClick?.(shop.id);

      const marker = new goongjs.Marker(el)
        .setLngLat([shop.longitude, shop.latitude])
        .setPopup(
          new goongjs.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${shop.shopName}</h3>
              <p class="text-xs text-slate-600">${shop.shopType}</p>
              <p class="text-xs">📍 ${shop.distanceKm} km</p>
              <p class="text-xs">⭐ ${shop.ratingAvg}</p>
            </div>
          `)
        )
        .addTo(map.current);
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (nearbyShops.length > 0 || currentShop) {
      const bounds = new goongjs.LngLatBounds();
      bounds.extend([userLocation.lng, userLocation.lat]);
      
      if (currentShop) {
        bounds.extend([currentShop.longitude, currentShop.latitude]);
      }
      
      nearbyShops.forEach(shop => {
        bounds.extend([shop.longitude, shop.latitude]);
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [mapLoaded, nearbyShops, currentShop, userLocation, onShopClick]);

  // Draw route when directions available
  useEffect(() => {
    if (!mapLoaded || !map.current || !directions) return;

    const route = directions.routes[0];
    if (!route) return;

    console.log('Drawing route with polyline:', route.overview_polyline);

    try {
      // Decode polyline
      const polylineString = route.overview_polyline.points;
      const coordinates = decodePolyline(polylineString);

      console.log('Decoded coordinates:', coordinates.length, 'points');

      // Remove old route
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Add route to map
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });

      // Fit bounds to route
      const goongjs = window.goongjs;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new goongjs.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 50 });
      
      console.log('✅ Route drawn successfully');
    } catch (error) {
      console.error('❌ Error drawing route:', error);
    }
  }, [mapLoaded, directions]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-2xl overflow-hidden shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
}

// Decode polyline helper function
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}
