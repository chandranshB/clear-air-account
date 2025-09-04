import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Factory, Car, Hammer, Flame } from "lucide-react";

interface PollutionZone {
  id: string;
  name: string;
  aqi: number;
  level: 'excellent' | 'good' | 'moderate' | 'poor' | 'severe' | 'hazardous';
  violators: Array<{
    type: 'vehicle' | 'industry' | 'construction' | 'burning';
    name: string;
    contribution: number;
  }>;
}

const mockData: PollutionZone[] = [
  {
    id: "1",
    name: "Connaught Place",
    aqi: 89,
    level: 'moderate',
    violators: [
      { type: 'vehicle', name: 'Heavy Traffic (450+ vehicles/hr)', contribution: 45 },
      { type: 'construction', name: 'Metro Line 3 Construction', contribution: 35 },
      { type: 'industry', name: 'Commercial Generators', contribution: 20 }
    ]
  },
  {
    id: "2", 
    name: "Industrial Area Phase-1",
    aqi: 187,
    level: 'poor',
    violators: [
      { type: 'industry', name: 'ABC Steel Industries', contribution: 60 },
      { type: 'industry', name: 'XYZ Chemicals Ltd.', contribution: 25 },
      { type: 'burning', name: 'Illegal Waste Burning', contribution: 15 }
    ]
  },
  {
    id: "3",
    name: "Diplomatic Enclave", 
    aqi: 34,
    level: 'good',
    violators: [
      { type: 'vehicle', name: 'Light Traffic', contribution: 70 },
      { type: 'industry', name: 'Embassy Generators', contribution: 30 }
    ]
  }
];

const getAqiColor = (level: string) => {
  const colors = {
    excellent: 'air-excellent',
    good: 'air-good', 
    moderate: 'air-moderate',
    poor: 'air-poor',
    severe: 'air-severe',
    hazardous: 'air-hazardous'
  };
  return colors[level as keyof typeof colors];
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
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Simulation */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Live Pollution Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="absolute top-4 left-4 text-xs text-muted-foreground">
                Interactive Map (Click zones for details)
              </div>
              
              {/* Pollution Zones */}
              {mockData.map((zone, index) => (
                <div
                  key={zone.id}
                  className={`absolute cursor-pointer transition-all duration-200 rounded-full border-2 border-white shadow-lg hover:scale-110 ${selectedZone === zone.id ? 'ring-4 ring-primary' : ''}`}
                  style={{
                    left: `${20 + index * 25}%`,
                    top: `${30 + index * 15}%`,
                    width: `${Math.max(60, zone.aqi / 3)}px`,
                    height: `${Math.max(60, zone.aqi / 3)}px`,
                    backgroundColor: `hsl(var(--air-${zone.level}))`
                  }}
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {zone.aqi}
                  </div>
                </div>
              ))}
              
              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 text-xs">
                <div className="font-semibold mb-2">AQI Scale</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-air-good"></div>
                    <span>0-50 Good</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-air-moderate"></div>
                    <span>51-100 Moderate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-air-poor"></div>
                    <span>101-200 Poor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Details */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedZone ? (
            <div className="space-y-4">
              {mockData
                .filter(zone => zone.id === selectedZone)
                .map(zone => (
                  <div key={zone.id} className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{zone.name}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className={`bg-air-${zone.level} text-white border-air-${zone.level}`}>
                          AQI: {zone.aqi}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {zone.level}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-3 text-destructive">
                        Identified Violators:
                      </h4>
                      <div className="space-y-2">
                        {zone.violators.map((violator, idx) => {
                          const IconComponent = getViolatorIcon(violator.type);
                          return (
                            <div key={idx} className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
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
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Click on a zone in the map to view responsible parties and violation details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PollutionMap;