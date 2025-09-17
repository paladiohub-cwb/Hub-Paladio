"use client";
import * as XLSX from "xlsx";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import UsersList from "@/components/users/UsersList";

export default function Users() {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<
    { index: number; error: string; contrato?: any }[]
  >([]);
  console.log(jsonData);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      setJsonData(parsedData as any[]);
      setErrors([]);
    };

    reader.readAsArrayBuffer(file);
  };
  const handleSendToAPI = async () => {
    if (jsonData.length === 0) {
      toast.error("Nenhum usuário carregado.");
      return;
    }

    setLoading(true);
    setErrors([]);
    setProgress(0);

    try {
      const res = await fetch("/api/users/registerInBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData), // manda todos de uma vez
      });

      const { results, failures } = await res.json();

      if (failures.length > 0) {
        setErrors(
          failures.map((f: any) => ({
            index: f.index + 1,
            error: f.error,
            contrato: f.raw,
          }))
        );
        toast.error("Alguns usuários falharam. Verifique os erros.");
      } else {
        toast.success("Todos os usuários foram cadastrados com sucesso!");
      }

      setProgress(100);
      setJsonData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Erro geral:", error);
      toast.error("Erro ao cadastrar usuários");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ marginBottom: "1rem" }}
      />

      {loading && (
        <div className="w-full bg-gray-200 rounded ">
          <div
            className="bg-blue-600 h-4 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded mt-4">
          <h2 className="font-bold mb-2">Erros encontrados:</h2>
          <ul className="list-disc pl-5">
            {errors.map((err, idx) => {
              return (
                <li key={idx}>
                  <span className="font-semibold">Linha {err.index}:</span>{" "}
                  {err.error}
                  {err.contrato?.contrato && (
                    <span className="text-gray-600">
                      {" "}
                      (Contrato: {err.contrato.contrato})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex justify-center items-center mt-4">
        <Button variant="default" onClick={handleSendToAPI} disabled={loading}>
          {loading ? `Enviando... ${progress}%` : "Registrar contratos"}
        </Button>
      </div>

      <UsersList />
    </>
  );
}
