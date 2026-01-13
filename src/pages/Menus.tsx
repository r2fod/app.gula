import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MenuManager from "@/features/menu/components/MenuManager";

const Menus = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="ml-4 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Eventos
        </Button>
      </div>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gestión de Menús</h1>
        <MenuManager />
      </main>
    </div>
  );
};

export default Menus;
