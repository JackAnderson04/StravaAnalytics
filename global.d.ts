declare namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element, opts?: MapOptions);
        setCenter(latLng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        addListener(eventName: string, handler: Function): MapsEventListener;
      }
      
      class Marker {
        constructor(opts?: MarkerOptions);
        setPosition(latLng: LatLng | LatLngLiteral): void;
        setMap(map: Map | null): void;
      }
      
      class Circle {
        constructor(opts?: CircleOptions);
        setCenter(latLng: LatLng | LatLngLiteral): void;
        setRadius(radius: number): void;
        setMap(map: Map | null): void;
      }
      
      class LatLng {
        constructor(lat: number, lng: number, noWrap?: boolean);
        lat(): number;
        lng(): number;
      }
      
      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeId?: string;
        styles?: Array<MapStyleElement>;
      }
      
      interface MapStyleElement {
        featureType?: string;
        elementType?: string;
        stylers: Array<{[key: string]: string}>;
      }
      
      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        title?: string;
        animation?: AnimationValue;
      }
      
      interface CircleOptions {
        strokeColor?: string;
        strokeOpacity?: number;
        strokeWeight?: number;
        fillColor?: string;
        fillOpacity?: number;
        map?: Map;
        center?: LatLng | LatLngLiteral;
        radius?: number;
        editable?: boolean;
      }
      
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      
      interface MapsEventListener {
        remove(): void;
      }
      
      interface MapMouseEvent {
        latLng?: LatLng;
      }
      
      enum AnimationValue {
        DROP = 1,
        BOUNCE = 2
      }
      
      const Animation: {
        DROP: AnimationValue.DROP;
        BOUNCE: AnimationValue.BOUNCE;
      };
    }
  }

  interface Window {
    google: typeof google;
  }