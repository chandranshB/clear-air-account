import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Factory, Car, Hammer, Flame, Layers, Maximize } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PollutionZone {
  id: string;
  name: string;
  coordinates: [number, number];
  aqi: number;
  level: 'excellent' | 'good' | 'moderate' | 'poor' | 'severe' | 'hazardous';
  violators: Array<{
    type: 'vehicle' | 'industry' | 'construction' | 'burning';
    name: string;
    contribution: number;
  }>;
}

// Dehradun coordinates with real pollution data simulation
const pollutionZones: PollutionZone[] = [
  {
    id: "1",
    name: "Clock Tower",
    coordinates: [30.3165, 78.0322],
    aqi: 98,
    level: 'moderate',
    violators: [
      { type: 'vehicle', name: 'Heavy Traffic (350+ vehicles/hr)', contribution: 55 },
      { type: 'construction', name: 'Smart City Development', contribution: 25 },
      { type: 'industry', name: 'Commercial Generators', contribution: 20 }
    ]
  },
  {
    id: "2", 
    name: "ISBT Dehradun",
    coordinates: [30.3255, 78.0422],
    aqi: 156,
    level: 'poor',
    violators: [
      { type: 'vehicle', name: 'Interstate Bus Terminal', contribution: 65 },
      { type: 'industry', name: 'Diesel Generators', contribution: 25 },
      { type: 'burning', name: 'Waste Burning', contribution: 10 }
    ]
  },
  {
    id: "3",
    name: "Forest Research Institute", 
    coordinates: [30.3346, 78.0669],
    aqi: 42,
    level: 'good',
    violators: [
      { type: 'vehicle', name: 'Light Traffic', contribution: 70 },
      { type: 'construction', name: 'Maintenance Work', contribution: 30 }
    ]
  },
  {
    id: "4",
    name: "Rajpur Road",
    coordinates: [30.3629, 78.0747],
    aqi: 124,
    level: 'poor', 
    violators: [
      { type: 'vehicle', name: 'Commercial Vehicles', contribution: 50 },
      { type: 'construction', name: 'Road Widening', contribution: 35 },
      { type: 'industry', name: 'Hotel Generators', contribution: 15 }
    ]
  },
  {
    id: "5",
    name: "ONGC Dehradun",
    coordinates: [30.2679, 78.0599], 
    aqi: 189,
    level: 'poor',
    violators: [
      { type: 'industry', name: 'Oil & Gas Operations', contribution: 60 },
      { type: 'vehicle', name: 'Industrial Traffic', contribution: 30 },
      { type: 'burning', name: 'Flare Emissions', contribution: 10 }
    ]
  }
];

const getAqiColor = (level: string) => {
  const colors = {
    excellent: '#00e400',
    good: '#ffff00', 
    moderate: '#ff7e00',
    poor: '#ff0000',
    severe: '#8f3f97',
    hazardous: '#7e0023'
  };
  return colors[level as keyof typeof colors] || colors.moderate;
};

const getViolatorIcon = (type: string) => {
  const icons = {
    vehicle: Car,
    industry: Factory,
    construction: Hammer,
    burning: Flame
  };
  return icons[type as keyof typeof icons];
};

const PollutionMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedZoneData = pollutionZones.find(zone => zone.id === selectedZone);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Dehradun
    const map = L.map(mapRef.current).setView([30.3165, 78.0322], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add pollution zone markers
    pollutionZones.forEach((zone) => {
      // Main marker
      const marker = L.circleMarker([zone.coordinates[0], zone.coordinates[1]], {
        color: 'white',
        weight: 2,
        fillColor: getAqiColor(zone.level),
        fillOpacity: 0.9,
        radius: Math.max(8, zone.aqi / 20)
      }).addTo(map);

      // Heatmap circles
      if (showHeatmap) {
        L.circle([zone.coordinates[0], zone.coordinates[1]], {
          color: getAqiColor(zone.level),
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.2,
          radius: zone.aqi * 50,
          weight: 0
        }).addTo(map);
      }

      // Popup content
      const violatorsList = zone.violators.map(v => 
        `<li><strong>${v.name}</strong>: ${v.contribution}%</li>`
      ).join('');

      marker.bindPopup(`
        <div class="text-sm">
          <h3 class="font-bold text-base mb-2">${zone.name}</h3>
          <div class="mb-2">
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white" 
                  style="background-color: ${getAqiColor(zone.level)}">
              AQI: ${zone.aqi} (${zone.level.toUpperCase()})
            </span>
          </div>
          <div>
            <strong>Violators:</strong>
            <ul class="mt-1 space-y-1">${violatorsList}</ul>
          </div>
        </div>
      `, {
        maxWidth: 300
      });

      marker.on('click', () => {
        setSelectedZone(selectedZone === zone.id ? null : zone.id);
      });
    });
  }, [showHeatmap, selectedZone]);

  return (
    <div className={`grid gap-4 lg:gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
      {/* Map Container */}
      <Card className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-2'} transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="text-base sm:text-lg">Live Pollution Map - Dehradun</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className="flex items-center space-x-1"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">{showHeatmap ? 'Hide' : 'Show'} Heatmap</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-1"
              >
                <Maximize className="h-4 w-4" />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className={`${isFullscreen ? 'h-[70vh]' : 'h-64 sm:h-80 lg:h-96'} w-full rounded-b-lg`}
          />
        </CardContent>
      </Card>

      {/* Zone Details - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Zone Details</CardTitle>
          </CardHeader>
          <CardContent className="card-mobile">
            {selectedZoneData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedZoneData.name}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      className="text-white border-0"
                      style={{ backgroundColor: getAqiColor(selectedZoneData.level) }}
                    >
                      AQI: {selectedZoneData.aqi}
                    </Badge>
                    <span className="text-sm text-muted-foreground capitalize">
                      {selectedZoneData.level}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3 text-destructive">
                    Identified Violators:
                  </h4>
                  <div className="space-y-2">
                    {selectedZoneData.violators.map((violator, idx) => {
                      const IconComponent = getViolatorIcon(violator.type);
                      return (
                        <div key={idx} className="flex items-center space-x-3 p-2 bg-muted/50 rounded hover-scale cursor-pointer">
                          <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {violator.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {violator.contribution}% contribution
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full btn-mobile animate-scale-in"
                  onClick={() => console.log('Take action on violators')}
                >
                  Take Enforcement Action
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Click on any zone marker to view responsible parties and violation details</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PollutionMap;