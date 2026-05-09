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
    getCenter(): LatLngLiteral;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    setContent(content: string | Element): void;
    open(map: Map, anchor?: marker.AdvancedMarkerElement): void;
  }

  interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    mapId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
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
    icons?: IconSequence[];
    map?: Map;
  }

  interface InfoWindowOptions {
    content?: string | Element;
    position?: LatLngLiteral;
  }

  interface IconSequence {
    icon: Symbol;
    offset?: string;
  }

  interface Symbol {
    path: SymbolPath;
    scale?: number;
  }

  enum SymbolPath {
    BACKWARD_CLOSED_ARROW,
    BACKWARD_OPEN_ARROW,
    CIRCLE,
    FORWARD_CLOSED_ARROW,
    FORWARD_OPEN_ARROW,
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
