// Google Maps types declaration
declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    panTo(latLng: LatLngLiteral): void;
    fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
    setCenter(latLng: LatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  class LatLngBounds {
    constructor(sw?: LatLngLiteral, ne?: LatLngLiteral);
    extend(point: LatLngLiteral): LatLngBounds;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }

  interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    mapId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    gestureHandling?: string;
    styles?: MapTypeStyle[];
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  interface PolylineOptions {
    path: LatLngLiteral[];
    geodesic?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    map?: Map;
  }

  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers: Array<Record<string, string>>;
  }

  interface MapsLibrary {
    Map: typeof Map;
  }

  namespace marker {
    class AdvancedMarkerElement {
      constructor(options: AdvancedMarkerElementOptions);
      map: Map | null;
      content: Element | null;
      addListener(event: string, handler: () => void): void;
    }

    interface AdvancedMarkerElementOptions {
      position: LatLngLiteral;
      map?: Map;
      content?: Element;
      title?: string;
    }
  }

  function importLibrary(name: string): Promise<MapsLibrary>;
}

interface Window {
  google: {
    maps: typeof google.maps;
  };
}
