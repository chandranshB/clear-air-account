import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Camera, 
  TrendingUp, 
  Users, 
  FileText,
  Shield,
  MapPin,
  Clock
} from "lucide-react";
import PollutionMap from "./PollutionMap";

const PublicDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-air-poor/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-air-poor" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Current AQI</p>
                <Badge variant="outline" className="bg-air-poor text-white border-air-poor">
                  Poor
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">847</p>
                <p className="text-sm text-muted-foreground">Violations Today</p>
                <div className="flex items-center text-xs text-destructive">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23% from yesterday
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹24.5L</p>
                <p className="text-sm text-muted-foreground">Fines Issued</p>
                <div className="flex items-center text-xs text-success">
                  <Users className="h-3 w-3 mr-1" />
                  342 violators
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Citizen Reports</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Last hour
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <PollutionMap />

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Report a Polluter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Spotted a violation? Help us maintain clean air by reporting polluters with photo evidence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Automatic location tagging</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Real-time status tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Reward points for verified reports</span>
              </div>
            </div>
            <Button className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Clean Route Navigator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Plan your journey through cleaner air zones and avoid heavily polluted areas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-air-good rounded-full"></div>
                <span>Real-time air quality routing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-air-good rounded-full"></div>
                <span>Health impact calculator</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-air-good rounded-full"></div>
                <span>Alternative route suggestions</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Plan Clean Route
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enforcement Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: "2 hours ago",
                violation: "Heavy diesel truck without valid PUC",
                location: "Ring Road, Lajpat Nagar",
                fine: "₹5,000",
                status: "Fine Issued"
              },
              {
                time: "3 hours ago", 
                violation: "Industrial emission exceeding limits",
                location: "ABC Steel Industries, Phase-1",
                fine: "₹2,50,000",
                status: "Notice Served"
              },
              {
                time: "5 hours ago",
                violation: "Construction site without dust covers",
                location: "Metro Line 3, Connaught Place",
                fine: "₹15,000", 
                status: "Compliance Required"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.violation}</div>
                  <div className="text-sm text-muted-foreground">{item.location}</div>
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-destructive">{item.fine}</div>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDashboard;