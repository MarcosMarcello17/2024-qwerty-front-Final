import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AppLayout from "./AppLayout";
import ModalCrearGrupo from "./components/ModalCrearGrupo";

// Sample shared expense events data
const sampleEvents = [
  {
    id: "event1",
    name: "Beach Trip July",
    description: "Weekend getaway with friends",
    members: 4,
    totalExpenses: 350.75,
    status: "Ongoing",
  },
  {
    id: "event2",
    name: "Monthly Dinner Club",
    description: "Rotating host dinner party",
    members: 6,
    totalExpenses: 120.0,
    status: "Settled",
  },
  {
    id: "event3",
    name: "Project Phoenix",
    description: "Team lunch expenses",
    members: 3,
    totalExpenses: 85.5,
    status: "Needs Settling",
  },
];

export default function GroupsPage() {
  const [grupoAAgregar, setGrupoAAgregar] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [isCreateEventFormOpen, setIsCreateEventFormOpen] =
    React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addGrupoModalOpen, setAddGrupoModalOpen] = useState(false);
  const [error, setError] = useState("");

  const fetchGrupos = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/grupos/mis-grupos",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los grupos.");
      }

      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      setError("Ocurrió un error al obtener los grupos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const handleAddExpenseSuccess = () => {
    setIsAddExpenseFormOpen(false);
    setSelectedEventForExpense(null);
    // Refetch event details
  };

  const openAddExpenseModal = (event) => {
    setSelectedEventForExpense(event);
    setIsAddExpenseFormOpen(true);
  };

  const getStatusBadgeVariant = (status) => {
    if (status === "Ongoing") return "outline";
    if (status === "Settled") return "default"; // Using default for a "good" status like green
    if (status === "Needs Settling") return "destructive";
    return "secondary";
  };

  const closeModal = () => {
    setAddGrupoModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              Grupos
            </h1>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setAddGrupoModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Grupo
          </Button>
        </div>

        <div className="flex flex-col flex-grow px-4">
          {/* Display user groups */}
          <div className="mb-4">
            {isLoading ? (
              <p>Cargando grupos...</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {grupos.length > 0 ? (
                  grupos.map((grupo) => (
                    <Card
                      key={grupo.id}
                      className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="font-headline text-lg">
                            {grupo.nombre}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          className="flex items-center text-sm text-muted-foreground bg-transparent hover:text-black"
                          onClick={() => fetchMiembros(grupo)}
                        >
                          <Users className="mr-2 h-4 w-4" /> Miembros
                        </Button>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModalDetallesGrupo(grupo)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Ver grupo
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openModalEliminar(grupo)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Eliminar Grupo
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardHeader>
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <CardTitle className="font-headline">
                        No hay ningun grupo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Crea un grupo para compartir gastos con amigos o
                        familiares
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" /> Crear Grupo
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalCrearGrupo
        isOpen={addGrupoModalOpen}
        onRequestClose={() => closeModal()}
        grupoAAgregar={grupoAAgregar ? grupoAAgregar.id : null}
      />
    </AppLayout>
  );
}
