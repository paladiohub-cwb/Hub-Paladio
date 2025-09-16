"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ContratosTable from "@/components/contracts/ContractsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Relatorios() {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSendToAPI = async () => {
    if (jsonData.length === 0) {
      toast.error("Nenhum contrato carregado.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      for (let i = 0; i < jsonData.length; i++) {
        const contrato = jsonData[i];
        const res = await fetch("/api/contracts/registerInBulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contrato), // envia 1 contrato por vez
        });

        if (!res.ok) {
          console.error(`Erro no contrato ${i + 1}`, await res.json());
        }

        // Atualiza porcentagem
        setProgress(Math.round(((i + 1) / jsonData.length) * 100));
      }

      toast.success("Todos contratos foram processados!");
      setJsonData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Erro geral:", error);
      toast.error("Erro ao cadastrar contratos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllContracts = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir TODOS os contratos? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/contracts/deleteBulk", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro desconhecido");
      }

      const data = await res.json();
      toast.success(data.message);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao excluir contratos");
    }
  };

  return (
    <div className="w-7xl bg-[rgba(255,255,255,0.1)] relative m-auto p-4 rounded-2xl" >

      <h1>Upload de Relatórios</h1>
      <Button
        variant="destructive"
        onClick={() => handleDeleteAllContracts()}
        disabled={loading}
      >
        Excluir todos contratos
      </Button>

      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ marginBottom: "1rem" }}
      />

      {jsonData.length > 0 && (
        <div className="bg-green-500 p-2 rounded">
          <h2>Resultado JSON (preview):</h2>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: "1rem",
              borderRadius: "8px",
              maxHeight: "400px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}

      {loading && (
        <div className="w-full bg-gray-200 rounded ">
          <div
            className="bg-blue-600 h-4 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="flex justify-center items-center ">
        <Button variant="default" onClick={handleSendToAPI} disabled={loading}>
          {loading ? `Enviando... ${progress}%` : "Registrar contratos"}
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">

            <div className="flex gap-2 items-center">
              Selecione a loja: 
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cajuru">Cajuru</SelectItem>
                  <SelectItem value="boa vista">Boa Vista</SelectItem>
                  <SelectItem value="curitiba">Curitiba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              Mês: 
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Janeiro">Janeiro</SelectItem>
                  <SelectItem value="Fevereiro">Fevereiro</SelectItem>
                  <SelectItem value="Março">Março</SelectItem>
                  <SelectItem value="Abril">Abril</SelectItem>
                  <SelectItem value="Maio">Maio</SelectItem>
                  <SelectItem value="Junho">Junho</SelectItem>
                  <SelectItem value="Julho">Julho</SelectItem>
                  <SelectItem value="Agosto">Agosto</SelectItem>
                  <SelectItem value="Setembro">Setembro</SelectItem>
                  <SelectItem value="Outubro">Outubro</SelectItem>
                  <SelectItem value="Novembro">Novembro</SelectItem>
                  <SelectItem value="Dezembro">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              Ano: 
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
                <Button>Filtrar</Button>
            </div>

          </div>

      <div className="">
        <ContratosTable />
      </div>
    </div>
  );
}
