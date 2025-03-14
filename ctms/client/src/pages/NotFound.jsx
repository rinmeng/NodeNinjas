import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-background animate-fade-in">
      <Card className="w-[400px] text-center">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            <Construction className="h-20 w-20 text-destructive" />
            <span className="text-4xl font-bold">404</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl text-muted-foreground">
            Sorry, the page you are looking for does not exist or was moved.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
