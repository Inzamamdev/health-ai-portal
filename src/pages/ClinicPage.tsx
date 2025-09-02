import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  useMap,
  Marker,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
type PlaceResult = google.maps.places.PlaceResult;

// Type for the active place state
interface ActivePlace {
  place: PlaceResult;
  marker: google.maps.marker.AdvancedMarkerElement;
}

function Directions({
  directions,
}: {
  directions: google.maps.DirectionsResult | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !directions) return;

    const renderer = new google.maps.DirectionsRenderer({
      map,
      directions,
    });

    return () => {
      renderer.setMap(null);
    };
  }, [map, directions]);

  return null;
}
function ClinicPage() {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState(null);
  const [places, setPlaces] = useState([]);
  const markerRefs = useRef([]);
  const [activePlace, setActivePlace] = useState<ActivePlace | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [googleMapsUrl, setUrl] = useState(null);

  const SERVER_URL = import.meta.env.VITE_OPENAI_SERVER_URL;
  const { type } = useParams();
  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCenter(userLocation);
          fetchPlaces(userLocation);
        },
        (err) => console.error(err)
      );
    }
  }, []);

  const fetchPlaces = async (location: google.maps.LatLngLiteral) => {
    if (!location) return;

    const response = await fetch(
      `${SERVER_URL}/nearby?lat=${location.lat}&lng=${location.lng}&type=${type}`
    );
    const data = await response.json();
    setPlaces(data.results || []);
  };

  const calculateRoute = async (
    destination: google.maps.LatLngLiteral,
    vicinity: string
  ) => {
    if (!center) return;

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: center,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirections(results);
    const leg = results.routes[0].legs[0];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      center
    )}&destination=${vicinity}&travelmode=driving`;
    setDistance(leg.distance?.text);
    setDuration(leg.duration?.text);
    setUrl(url);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <APIProvider apiKey={API_KEY} libraries={["places"]}>
        {center && (
          <Map
            mapId="df6a48b130e5ff7ed01bce96"
            style={{ width: "100%", height: "100%" }}
            defaultCenter={center}
            defaultZoom={14}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {/* User location marker */}
            <Marker position={center} />

            {/* Query result markers */}
            {places.map((place, idx) => (
              <AdvancedMarker
                ref={(marker) => (markerRefs.current[idx] = marker)}
                key={idx}
                position={{
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                }}
                onClick={() => {
                  setActivePlace({ place, marker: markerRefs.current[idx] });
                  calculateRoute(
                    {
                      lat: place.geometry?.location?.lat,
                      lng: place.geometry?.location?.lng,
                    },
                    place.vicinity
                  );
                }}
              ></AdvancedMarker>
            ))}

            {activePlace && (
              <InfoWindow
                anchor={activePlace.marker}
                onCloseClick={() => setActivePlace(null)}
              >
                <div
                  className="font-bold"
                  onClick={() => window.open(googleMapsUrl)}
                >
                  <img
                    width="100%"
                    height="100%"
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photo_reference=${activePlace.place.photos[0].photo_reference}&key=${API_KEY}`}
                    alt="Image not found"
                  />
                  <div className=" mt-2">
                    <h2 className=" text-xl">
                      Hospital Name: {activePlace.place.name}
                    </h2>
                    <p className="">
                      Hospital Address: {activePlace.place.vicinity}
                    </p>
                    <p>Distance: {distance}</p>
                    <p>Duration: {duration}</p>
                  </div>
                </div>
              </InfoWindow>
            )}
            {directions && <Directions directions={directions} />}
          </Map>
        )}
      </APIProvider>
    </div>
  );
}

export default ClinicPage;
