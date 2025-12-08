import { useLocation, useNavigate, useParams } from "react-router-dom";
import { InsulationCalculator } from "@/components/InsulationCalculator";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeft } from "lucide-react";

const PipingInsulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId, orderId, itemId } = useParams();
  const item = location.state?.item;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}/orders/${orderId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Piping Insulation Measurement Sheet
                </h1>
                <p className="text-xs text-muted-foreground">
                  {item?.description || "IS Factor Based Measurement System"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <InsulationCalculator />
      </main>
    </div>
  );
};

export default PipingInsulation;
