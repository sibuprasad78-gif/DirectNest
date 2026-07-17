"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Crosshair,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

type LocationPickerProps = {
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (
    location: string,
    latitude: number,
    longitude: number
  ) => void;
};

type NominatimSearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type NominatimReverseResult = {
  display_name?: string;
};

const DEFAULT_LATITUDE = 20.2961;
const DEFAULT_LONGITUDE = 85.8245;

export default function LocationPicker({
  location = "",
  latitude = null,
  longitude = null,
  onLocationChange,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<import("leaflet").Map | null>(null);

  const markerRef = useRef<import("leaflet").Marker | null>(null);

  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const onLocationChangeRef = useRef(onLocationChange);

  const [searchValue, setSearchValue] = useState(location);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasValidCoordinates =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    setSearchValue(location);
  }, [location]);

  const reverseGeocode = useCallback(
    async (
      selectedLatitude: number,
      selectedLongitude: number
    ) => {
      if (
        !Number.isFinite(selectedLatitude) ||
        !Number.isFinite(selectedLongitude)
      ) {
        setErrorMessage("Invalid location coordinates.");
        return;
      }

      try {
        setErrorMessage("");

        const reverseUrl =
          "https://nominatim.openstreetmap.org/reverse" +
          "?format=jsonv2" +
          `&lat=${selectedLatitude}` +
          `&lon=${selectedLongitude}` +
          "&zoom=18" +
          "&addressdetails=1";

        const response = await fetch(reverseUrl, {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
          },
        });

        if (!response.ok) {
          throw new Error("Reverse geocoding failed.");
        }

        const data =
          (await response.json()) as NominatimReverseResult;

        const selectedAddress =
          data.display_name?.trim() ||
          `${selectedLatitude.toFixed(
            6
          )}, ${selectedLongitude.toFixed(6)}`;

        setSearchValue(selectedAddress);

        onLocationChangeRef.current(
          selectedAddress,
          selectedLatitude,
          selectedLongitude
        );
      } catch (error) {
        console.error("Reverse geocoding error:", error);

        const fallbackAddress =
          `${selectedLatitude.toFixed(6)}, ` +
          `${selectedLongitude.toFixed(6)}`;

        setSearchValue(fallbackAddress);

        onLocationChangeRef.current(
          fallbackAddress,
          selectedLatitude,
          selectedLongitude
        );
      }
    },
    []
  );

  const createMarkerIcon = useCallback(
    (leaflet: typeof import("leaflet")) => {
      return leaflet.divIcon({
        className: "directnest-location-marker",
        html: `
          <div
            style="
              width: 42px;
              height: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <div
              style="
                width: 30px;
                height: 30px;
                background: #1d4ed8;
                border: 3px solid #ffffff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 5px 14px rgba(0,0,0,0.35);
              "
            >
              <div
                style="
                  width: 8px;
                  height: 8px;
                  margin: 8px;
                  background: #ffffff;
                  border-radius: 9999px;
                "
              ></div>
            </div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
      });
    },
    []
  );

  const addOrMoveMarker = useCallback(
    (
      selectedLatitude: number,
      selectedLongitude: number,
      moveMap: boolean
    ) => {
      if (
        !Number.isFinite(selectedLatitude) ||
        !Number.isFinite(selectedLongitude)
      ) {
        return;
      }

      const leaflet = leafletRef.current;
      const map = mapRef.current;

      if (!leaflet || !map) {
        return;
      }

      const markerPosition: [number, number] = [
        selectedLatitude,
        selectedLongitude,
      ];

      if (markerRef.current) {
        markerRef.current.setLatLng(markerPosition);
      } else {
        const marker = leaflet.marker(markerPosition, {
          draggable: true,
          icon: createMarkerIcon(leaflet),
        });

        marker.addTo(map);

        marker.on("dragend", () => {
          const markerLocation = marker.getLatLng();

          void reverseGeocode(
            markerLocation.lat,
            markerLocation.lng
          );
        });

        markerRef.current = marker;
      }

      if (moveMap) {
        map.setView(markerPosition, 17, {
          animate: true,
        });
      }
    },
    [createMarkerIcon, reverseGeocode]
  );

  useEffect(() => {
    let componentIsMounted = true;

    const loadMap = async () => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      try {
        setIsMapLoading(true);
        setErrorMessage("");

        if (!document.getElementById("leaflet-map-css")) {
          const leafletStylesheet =
            document.createElement("link");

          leafletStylesheet.id = "leaflet-map-css";
          leafletStylesheet.rel = "stylesheet";
          leafletStylesheet.href =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

          document.head.appendChild(leafletStylesheet);
        }

        const leafletModule = await import("leaflet");
        const leaflet = leafletModule.default;

        if (
          !componentIsMounted ||
          !mapContainerRef.current
        ) {
          return;
        }

        leafletRef.current = leafletModule;

        const initialLatitude = hasValidCoordinates
          ? latitude
          : DEFAULT_LATITUDE;

        const initialLongitude = hasValidCoordinates
          ? longitude
          : DEFAULT_LONGITUDE;

        const map = leaflet.map(mapContainerRef.current, {
          center: [
            initialLatitude as number,
            initialLongitude as number,
          ],
          zoom: hasValidCoordinates ? 17 : 12,
          zoomControl: true,
          attributionControl: true,
        });

        mapRef.current = map;

        leaflet
          .tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }
          )
          .addTo(map);

        map.on("click", (event) => {
          const selectedLatitude = Number(event.latlng.lat);
          const selectedLongitude = Number(event.latlng.lng);

          addOrMoveMarker(
            selectedLatitude,
            selectedLongitude,
            false
          );

          void reverseGeocode(
            selectedLatitude,
            selectedLongitude
          );
        });

        if (hasValidCoordinates) {
          addOrMoveMarker(
            latitude as number,
            longitude as number,
            false
          );
        }

        window.setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (error) {
        console.error("Leaflet map error:", error);

        if (componentIsMounted) {
          setErrorMessage(
            "Map could not be loaded. Please refresh the page."
          );
        }
      } finally {
        if (componentIsMounted) {
          setIsMapLoading(false);
        }
      }
    };

    void loadMap();

    return () => {
      componentIsMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !hasValidCoordinates ||
      latitude === null ||
      longitude === null
    ) {
      return;
    }

    addOrMoveMarker(latitude, longitude, false);
  }, [
    latitude,
    longitude,
    hasValidCoordinates,
    addOrMoveMarker,
  ]);

  const handleSearch = async () => {
    const searchQuery = searchValue.trim();

    if (!searchQuery) {
      setErrorMessage(
        "Please enter an area, landmark or address."
      );
      return;
    }

    try {
      setIsSearching(true);
      setErrorMessage("");

      const searchUrl =
        "https://nominatim.openstreetmap.org/search" +
        "?format=jsonv2" +
        `&q=${encodeURIComponent(searchQuery)}` +
        "&countrycodes=in" +
        "&limit=1" +
        "&addressdetails=1";

      const response = await fetch(searchUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const results =
        (await response.json()) as NominatimSearchResult[];

      if (results.length === 0) {
        setErrorMessage(
          "Location not found. Add city, district or state name."
        );
        return;
      }

      const firstResult = results[0];

      const selectedLatitude = Number(firstResult.lat);
      const selectedLongitude = Number(firstResult.lon);

      if (
        !Number.isFinite(selectedLatitude) ||
        !Number.isFinite(selectedLongitude)
      ) {
        setErrorMessage(
          "This location returned invalid coordinates."
        );
        return;
      }

      const selectedAddress =
        firstResult.display_name.trim();

      setSearchValue(selectedAddress);

      onLocationChangeRef.current(
        selectedAddress,
        selectedLatitude,
        selectedLongitude
      );

      addOrMoveMarker(
        selectedLatitude,
        selectedLongitude,
        true
      );
    } catch (error) {
      console.error("Location search error:", error);

      setErrorMessage(
        "Unable to search. Check your internet connection and try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSearch();
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(
        "Current location is not supported by this browser."
      );
      return;
    }

    setIsGettingCurrentLocation(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const selectedLatitude = Number(
          position.coords.latitude
        );

        const selectedLongitude = Number(
          position.coords.longitude
        );

        if (
          !Number.isFinite(selectedLatitude) ||
          !Number.isFinite(selectedLongitude)
        ) {
          setErrorMessage(
            "Unable to read your current coordinates."
          );

          setIsGettingCurrentLocation(false);
          return;
        }

        addOrMoveMarker(
          selectedLatitude,
          selectedLongitude,
          true
        );

        void reverseGeocode(
          selectedLatitude,
          selectedLongitude
        ).finally(() => {
          setIsGettingCurrentLocation(false);
        });
      },
      (geolocationError) => {
        let message =
          "Unable to get your current location.";

        if (
          geolocationError.code ===
          geolocationError.PERMISSION_DENIED
        ) {
          message =
            "Location permission denied. Allow location access in Chrome.";
        } else if (
          geolocationError.code ===
          geolocationError.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location is unavailable.";
        } else if (
          geolocationError.code ===
          geolocationError.TIMEOUT
        ) {
          message =
            "Location request timed out. Please try again.";
        }

        setErrorMessage(message);
        setIsGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="property-location"
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          Property location
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              id="property-location"
              type="text"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setErrorMessage("");
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search area, landmark or full address"
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isSearching}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}

            Search
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={isGettingCurrentLocation}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isGettingCurrentLocation ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Crosshair className="h-5 w-5" />
        )}

        Use current location
      </button>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
        {isMapLoading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-gray-100">
            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />

            <span className="ml-2 text-sm font-medium text-gray-600">
              Loading map...
            </span>
          </div>
        )}

        <div
          ref={mapContainerRef}
          className="h-[340px] w-full"
        />
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-950">
              Selected location
            </p>

            <p className="mt-1 break-words text-sm leading-6 text-blue-800">
              {location ||
                "Search, use current location or click on the map."}
            </p>

            {hasValidCoordinates &&
              latitude !== null &&
              longitude !== null && (
                <p className="mt-2 text-xs font-medium text-blue-700">
                  Latitude: {latitude.toFixed(6)} · Longitude:{" "}
                  {longitude.toFixed(6)}
                </p>
              )}
          </div>
        </div>
      </div>

      <p className="text-xs leading-5 text-gray-500">
        Search the address, use current location, click anywhere on the
        map, or drag the marker to select the exact property position.
      </p>
    </div>
  );
}