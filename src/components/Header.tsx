import { Shield, Eye, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentView: 'public' | 'government';
  onViewChange: (view: 'public' | 'government') => void;
}

const Header = ({ currentView, onViewChange }: HeaderProps) => {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AirWatch</h1>
              <p className="text-sm text-muted-foreground">Pollution Accountability System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={currentView === 'public' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('public')}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Public View</span>
              </Button>
              <Button
                variant={currentView === 'government' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('government')}
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Government</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">New Delhi</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;