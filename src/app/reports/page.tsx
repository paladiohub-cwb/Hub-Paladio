"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import ContratosTable from "@/components/contracts/ContractsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export default function Relatorios() {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [register, setRegister] = useState(false)
  const [errors, setErrors] = useState<
    { index: number; error: string; contrato?: any }[]
  >([]);
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
      setErrors([]); // limpa erros ao subir novo arquivo
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
    setErrors([]);

    try {
      for (let i = 0; i < jsonData.length; i++) {
        const contrato = jsonData[i];
        const res = await fetch("/api/contracts/registerInBulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contrato),
        });

        if (!res.ok) {
          const errorData = await res.json();
          const messageFailures = (errorData.failures ?? [])
            .map((f: any) => (f.errors ?? []).join("; "))
            .join(" | ");

          const contractNumber = (errorData.failures ?? []).map(
            (contract: any) => contract.original.Contrato
          );

          console.log(contractNumber);
          setErrors((prev) => [
            ...prev,
            {
              index: i + 1,
              error: errorData.message
                ? `${errorData.message} — ${messageFailures} - N° de Contrato: ${contractNumber}`
                : messageFailures || "Erro desconhecido",
              contrato,
            },
          ]);
        }

        setProgress(Math.round(((i + 1) / jsonData.length) * 100));
      }

      if (errors.length === 0) {
        toast.success("Todos contratos foram processados!");
      } else {
        toast.error("Alguns contratos falharam. Verifique a lista de erros.");
      }

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
    <div className="w-7xl bg-[rgba(255,255,255,0.1)] relative m-auto p-4 rounded-2xl flex flex-col">

      <ul className="relative flex right-0 gap-4 justify-end mb-3">
        <li>
          <Button
            className="opacity-50"
            variant="destructive"
            onClick={() => handleDeleteAllContracts()}
            disabled={loading}
          >
            Excluir todos contratos
          </Button>
        </li>
        <li>
          <Button variant="outline" className=" rounded-lg hover:bg-white hover:text-zinc-950">
            <HoverCard>
              <HoverCardTrigger 
                className="">Baixar Recibo</HoverCardTrigger>
              <HoverCardContent className="bg-black w-[100px] flex flex-col gap-2">
                <Button variant="outline" className="text-white">XLSX</Button>
                <Button variant="outline" className="text-white">CSV</Button>
              </HoverCardContent>
            </HoverCard>
            </Button>
        </li>
        <li>
          <Button className="bg-[#9CACA0]" onClick={() => setRegister(!register)} >Novo Recibo</Button>
        </li>

      </ul>
      
      <div className={ !register ? `hidden` : `w-3xl m-auto p-8 border rounded-2xl mb-4 mt-4 shadow-2xl bg-[rgba(0,0,0,0.20)]`}>
      <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          <AccordionItem value="item-1">

            <span onClick={() => setRegister(!register) } className="text-sm flex text-right relative cursor-pointer">[x] Fechar</span>

            <AccordionTrigger>1. VALIDAÇÃO DA PLANILHA</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <ul className="flex gap-4">

                <li>
                  Mês:
                  <Select>
                    <SelectTrigger className="w-[120px]">
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
                </li>
                <li>
                  Ano:
                  <Select>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </li>
                <li>
                  Valor Nfe: <Input type="text" placeholder="Valor da Nfe:" />
                </li>
                <li>
                 Selecione a planilha: 
                    <Input type="file" accept=".xlsx, .csv" 
                      placeholder="Planilha de Importação" ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                </li>

              </ul>

              <span>
              <Button className="bg-[#9CACA0] p-6 hover:text-white text-black w-full" variant="default" onClick={handleSendToAPI} disabled={loading}>
                    {loading ? `Enviando... ${progress}%` : "Registrar contratos"}
                  </Button>
              </span>

              {loading && (
                <div className="w-full bg-gray-200 rounded ">
                  <div
                    className="bg-[#9CACA0] h-4 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded max-h-[250px] overflow-scroll">
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
              
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>2. CADASTRO DE DADOS</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We offer worldwide shipping through trusted courier partners.
                Standard delivery takes 3-5 business days, while express shipping
                ensures delivery within 1-2 business days.
              </p>
              <p>
                All orders are carefully packaged and fully insured. Track your
                shipment in real-time through our dedicated tracking portal.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>3. APLICAÇÃO DE REGRAS</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We stand behind our products with a comprehensive 30-day return
                policy. If you&apos;re not completely satisfied, simply return the
                item in its original condition.
              </p>
              <p>
                Our hassle-free return process includes free return shipping and
                full refunds processed within 48 hours of receiving the returned
                item.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>4. FINALIZAÇÃO</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We stand behind our products with a comprehensive 30-day return
                policy. If you&apos;re not completely satisfied, simply return the
                item in its original condition.
              </p>
              <p>
                Our hassle-free return process includes free return shipping and
                full refunds processed within 48 hours of receiving the returned
                item.
              </p>
            </AccordionContent>
          </AccordionItem>
      </Accordion>
      </div>

      <div className="flex items-center gap-4 mt-8 mb-4">

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
                <Button variant="outline">Filtrar</Button>
            </div>

          </div>

      <div className="">
        <ContratosTable />
      </div>
    </div>
  );
}
