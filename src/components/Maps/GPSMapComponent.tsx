import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface GPSMapComponentProps {
	lat: number;
	lng: number;
	zoom?: number;
	height?: string;
}

const GPSMapComponent: React.FC<GPSMapComponentProps> = ({
	lat,
	lng,
	zoom = 15,
	height = "400px",
}) => {
	return (
		<div style={{ height, width: "100%" }}>
			<MapContainer
				center={[lat, lng]}
				zoom={zoom}
				style={{ height: "100%", width: "100%" }}
				key={`${lat}-${lng}`} // Force re-render when coordinates change
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<Marker position={[lat, lng]}>
					<Popup>
						<div className='text-center'>
							<strong>📍 Current Location</strong>
							<br />
							<span className='text-sm text-gray-600'>
								Lat: {lat.toFixed(6)}
								<br />
								Lng: {lng.toFixed(6)}
							</span>
						</div>
					</Popup>
				</Marker>
			</MapContainer>
		</div>
	);
};

export default GPSMapComponent;
