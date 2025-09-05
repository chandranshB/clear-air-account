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
    
    // Clear existing markers and layers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add pollution zone markers with enhanced visuals
    pollutionZones.forEach((zone) => {
      // Calculate dynamic sizes based on AQI
      const markerSize = Math.max(12, Math.min(25, zone.aqi / 8));
      const heatmapRadius = zone.aqi * 75; // Increased for better visibility
      
      // Main marker with pulsing effect for high pollution
      const marker = L.circleMarker([zone.coordinates[0], zone.coordinates[1]], {
        color: zone.aqi > 150 ? '#ffffff' : 'rgba(255,255,255,0.8)',
        weight: zone.aqi > 150 ? 3 : 2,
        fillColor: getAqiColor(zone.level),
        fillOpacity: 0.85,
        radius: markerSize,
        className: zone.aqi > 150 ? 'animate-pulse' : ''
      }).addTo(map);

      // Multi-layer heatmap for realistic pollution spread
      if (showHeatmap) {
        // Outer layer - very light
        L.circle([zone.coordinates[0], zone.coordinates[1]], {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.1,
          radius: heatmapRadius * 1.5,
          weight: 0
        }).addTo(map);
        
        // Middle layer - medium opacity
        L.circle([zone.coordinates[0], zone.coordinates[1]], {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.2,
          radius: heatmapRadius,
          weight: 0
        }).addTo(map);
        
        // Inner layer - higher opacity
        L.circle([zone.coordinates[0], zone.coordinates[1]], {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.3,
          radius: heatmapRadius * 0.6,
          weight: 0
        }).addTo(map);
      }

      // Enhanced popup with trends and forecasts
      const violatorsList = zone.violators.map(v => 
        `<li class="flex justify-between"><strong>${v.name}</strong><span>${v.contribution}%</span></li>`
      ).join('');

      // Simulate trend data
      const trend = zone.aqi > 100 ? 'increasing' : 'stable';
      const trendIcon = trend === 'increasing' ? '📈' : '📊';
      const forecast = zone.aqi > 150 ? 'Poor for next 3 hours' : 'Moderate conditions expected';

      marker.bindPopup(`
        <div class="text-sm max-w-xs">
          <h3 class="font-bold text-base mb-2 text-gray-800">${zone.name}</h3>
          
          <div class="mb-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm" 
                  style="background-color: ${getAqiColor(zone.level)}">
              AQI: ${zone.aqi} (${zone.level.toUpperCase()})
            </span>
          </div>
          
          <div class="mb-3">
            <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>📈 Trend: ${trend}</span>
              <span>${trendIcon}</span>
            </div>
            <div class="text-xs text-gray-600">
              🔮 Forecast: ${forecast}
            </div>
          </div>
          
          <div class="border-t pt-2">
            <strong class="text-red-600 text-xs">Main Contributors:</strong>
            <ul class="mt-1 space-y-1 text-xs">${violatorsList}</ul>
          </div>
          
          <div class="mt-2 pt-2 border-t">
            <button class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">
              View Historical Data
            </button>
          </div>
        </div>
      `, {
        maxWidth: 320,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        setSelectedZone(selectedZone === zone.id ? null : zone.id);
      });
    });

    // Handle fullscreen map resizing
    if (isFullscreen) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [showHeatmap, selectedZone, isFullscreen]);

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3'}`}>
      {/* Map Container */}
      <Card className={`${isFullscreen ? 'h-full border-0 rounded-none' : 'lg:col-span-2'} transition-all duration-300`}>
        <CardHeader className={`${isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm' : ''} pb-3`}>
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
        <CardContent className="p-0 relative">
          <div 
            ref={mapRef} 
            className={`w-full rounded-b-lg ${isFullscreen ? 'h-screen' : 'h-64 sm:h-80 lg:h-96'}`}
            style={{ zIndex: 1 }}
          />
        </CardContent>
      </Card>

      {/* Zone Details - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              {selectedZoneData ? 'Zone Analysis' : 'City Overview'}
            </CardTitle>
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

                {/* Pollution Trends */}
                <div className="bg-muted/30 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">24h Trend</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-background rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, selectedZoneData.aqi / 3)}%`,
                          backgroundColor: getAqiColor(selectedZoneData.level)
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedZoneData.aqi > 100 ? '+12%' : '-5%'}
                    </span>
                  </div>
                </div>

                {/* Forecast */}
                <div className="bg-muted/30 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">3-Hour Forecast</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedZoneData.aqi > 150 
                      ? 'Air quality expected to remain poor. Avoid outdoor activities.' 
                      : 'Moderate conditions expected. Take precautions for sensitive individuals.'}
                  </p>
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
              <div className="space-y-4">
                {/* City Average */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">City Average AQI</h4>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold">112</div>
                    <div>
                      <Badge className="bg-air-poor text-white">Moderate</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Based on 5 monitoring stations</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-air-poor">3</div>
                    <div className="text-xs text-muted-foreground">High pollution zones</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-air-good">2</div>
                    <div className="text-xs text-muted-foreground">Clean zones</div>
                  </div>
                </div>

                <div className="text-center py-4 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on any zone marker to view detailed analysis</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PollutionMap;