"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Send, LogOut } from "lucide-react";
import { toast } from "sonner";

type Message = {
  userId: string;
  nombre: string;
  apellido: string;
  message: string;
  timestamp: string;
  claseId: string;
};

export default function ClaseVirtualPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rolFromUrl = searchParams.get("rol");
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const claseId = Array.isArray(id) ? id[0] : id;

  // Verificar acceso
  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (rolFromUrl === "instructor") {
          const perfil = await api.get<{ id: string }>("/instructores/mi-perfil");
          const clases = await api.get<any[]>(`/clases?instructorId=${perfil.id}`);
          if (!clases.some(c => c.id === claseId)) throw new Error();
          setIsInstructor(true);
        } else {
          const activas = await api.get<any[]>("/inscripciones/mis-activas");
          if (!activas.some(ins => ins.horario.clase.id === claseId)) throw new Error();
          setIsInstructor(false);
        }
        setLoading(false);
      } catch {
        toast.error("No tienes acceso a esta clase");
        window.location.href = "/dashboard";
      }
    };
    if (claseId) checkAccess();
  }, [claseId, rolFromUrl]);

  // Conectar Socket.IO
  useEffect(() => {
    if (loading) return;
    const token = localStorage.getItem("rv_token");
    if (!token) {
      toast.error("Sesión no válida");
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket conectado");
      newSocket.emit("join-clase", claseId);
    });

    newSocket.on("new-message", (msg: Message) => {
      // Solo mostrar mensajes de esta clase
      if (msg.claseId === claseId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    newSocket.on("disconnect", () => console.log("🔌 Socket desconectado"));
    newSocket.on("connect_error", (err) => console.error("❌ Error socket:", err.message));

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [loading, claseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit("send-message", { claseId, message: input });
    setInput("");
  };

  if (loading) return <div className="p-8 text-center">Cargando sala virtual...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center border-b">
        <div>
          <h1 className="text-xl font-bold">Clase virtual</h1>
          <p className="text-sm text-gray-500">ID: {claseId}</p>
        </div>
        <div className="flex gap-2">
          <Badge label={isInstructor ? "Instructor" : "Estudiante"} variant={isInstructor ? "purple" : "green"} />
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}>
            <LogOut className="w-4 h-4 mr-1" /> Salir
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No hay mensajes aún. ¡Escribe el primero!</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                msg.userId === user?.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <p className="text-xs font-bold mb-1">
                {msg.nombre} {msg.apellido} {msg.userId === user?.id && "(Tú)"}
              </p>
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-lg border px-3 py-2 dark:bg-gray-700"
          />
          <Button onClick={sendMessage} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}