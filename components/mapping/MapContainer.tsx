'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapContainerProps {
  radius: number; // in miles
  centerPoint: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const MapContainer = ({
  radius,
  centerPoint,
  onMapClick,
  setLoading,
  setError
}: MapContainerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // load google maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true);
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['geometry']
        });

        const google = await loader.load();
        const { Map } = google.maps;

        // start centered on a default location
        const center = { lat: 43.0389, lng: -87.9065 }; // Milwaukee by default
        
        if (mapRef.current) {
          googleMapRef.current = new Map(mapRef.current, {
            center,
            zoom: 12,
            mapTypeId: 'terrain',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          // add click event listener
          googleMapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });

          setMapLoaded(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps');
        setLoading(false);
      }
    };

    if (!mapLoaded) {
      initializeMap();
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [setError, setLoading, mapLoaded, onMapClick]);

  // update circle and marker when center point changes
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current || !window.google) return;

    if (centerPoint) {
      const google = window.google;
      const position = new google.maps.LatLng(centerPoint[0], centerPoint[1]);

      // update map center
      googleMapRef.current.setCenter(position);

      // create or update marker
      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: 'Center point',
          animation: google.maps.Animation.DROP
        });
      } else {
        markerRef.current.setPosition(position);
      }

      // create or update circle
      const radiusInMeters = radius * 1609.34; // convert miles to meters
      
      if (!circleRef.current) {
        circleRef.current = new google.maps.Circle({
          strokeColor: '#FF5722',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF5722',
          fillOpacity: 0.1,
          map: googleMapRef.current,
          center: position,
          radius: radiusInMeters,
          editable: false
        });
      } else {
        circleRef.current.setCenter(position);
        circleRef.current.setRadius(radiusInMeters);
      }
    }
  }, [centerPoint, radius, mapLoaded]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
};

export default MapContainer;