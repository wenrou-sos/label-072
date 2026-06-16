import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Machine, Field } from '../../types';
import { getStatusColor, getWorkTypeColor, getMachineTypeName, getStatusName, formatFuel, formatSpeed } from '../../utils/format';

const createMachineIcon = (status: string, type: string) => {
  const color = getStatusColor(status);
  const emoji = type === 'harvester' ? '🌾' : type === 'seeder' ? '🌱' : type === 'drone' ? '🚁' : '🚜';
  
  return L.divIcon({
    className: 'machine-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
          ${status === 'working' ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${emoji}
        </div>
        <div style="
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [36, 40],
    iconAnchor: [18, 36],
  });
};

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface MapViewProps {
  machines: Machine[];
  fields: Field[];
  selectedMachineId: string | null;
  selectedFieldId: string | null;
  onMachineClick: (id: string) => void;
  onFieldClick: (id: string) => void;
  mapCenter?: [number, number];
  mapZoom?: number;
}

export const MapView = ({
  machines,
  fields,
  selectedMachineId,
  selectedFieldId,
  onMachineClick,
  onFieldClick,
  mapCenter = [39.905, 116.397],
  mapZoom = 13,
}: MapViewProps) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .leaflet-container {
          background: #e8e8e8;
        }
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {fields.map((field) => {
          const color = field.workType ? getWorkTypeColor(field.workType) : '#9ca3af';
          const isSelected = selectedFieldId === field.id;
          return (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              pathOptions={{
                color: isSelected ? '#15803d' : color,
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 0.4 : 0.25,
                dashArray: field.workType ? undefined : '10, 10',
              }}
              eventHandlers={{
                click: () => onFieldClick(field.id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-gray-800">{field.name}</div>
                  <div className="text-gray-600">面积: {field.area} 亩</div>
                  <div className="text-gray-600">作物: {field.cropType}</div>
                  {field.workType && (
                    <div className="text-gray-600">作业类型: {field.workType}</div>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {machines.map((machine) => (
          <Marker
            key={machine.id}
            position={machine.position}
            icon={createMachineIcon(machine.status, machine.type)}
            eventHandlers={{
              click: () => onMachineClick(machine.id),
            }}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <div className="font-bold text-gray-800 text-base mb-1">{machine.name}</div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: getStatusColor(machine.status) }}></span>
                  <span className="text-gray-600">{getMachineTypeName(machine.type)} · {getStatusName(machine.status)}</span>
                </div>
                <div className="text-gray-600">驾驶员: {machine.driver}</div>
                <div className="text-gray-600">速度: {formatSpeed(machine.speed)}</div>
                <div className="text-gray-600">油量: {formatFuel(machine.fuelLevel)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
