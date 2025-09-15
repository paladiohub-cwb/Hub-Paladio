"use client";

import { useEffect, useState } from "react";
import { Contrato } from "@/interface/contracts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ContratoAgrupado = {
  contrato: number;
  cliente: string;
  vendedor: string | number;
  parcela: number;
  credito: string;
  total: number;
  categorias: Record<string, number>;
  detalhes: Contrato;
};

export default function ContratosTable() {
  const [contratos, setContratos] = useState<ContratoAgrupado[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] =
    useState<ContratoAgrupado | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/contracts/readAll");
      const data: ContratoAgrupado[] = await res.json();
      setContratos(data);

      const allCats = new Set<string>();
      data.forEach((c) => {
        Object.keys(c.categorias).forEach((cat) => allCats.add(cat));
      });
      setCategorias(Array.from(allCats));
    };
    fetchData();
  }, []);

  const handleRowClick = (contrato: ContratoAgrupado) => {
    setSelectedContrato(contrato);
    setDrawerOpen(true);
  };

  const handleUpdate = () => {
    console.log("Atualizar contrato:", selectedContrato?.contrato);
  };

  const handleDelete = () => {
    console.log("Excluir contrato:", selectedContrato?.contrato);
    setDrawerOpen(false);
  };

  return (
    <>
      <Table>
        <TableCaption>Lista de contratos agrupados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Contrato</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Parcela</TableHead>
            <TableHead>Crédito</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            {categorias.map((cat) => (
              <TableHead key={cat}>{cat}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {contratos.map((c) => (
            <TableRow
              key={c.contrato}
              onClick={() => handleRowClick(c)}
              className="cursor-pointer hover:bg-gray-400"
            >
              <TableCell className="font-bold">{c.contrato}</TableCell>
              <TableCell>{c.cliente}</TableCell>
              <TableCell>{c.vendedor}</TableCell>
              <TableCell>{c.parcela}</TableCell>
              <TableCell>{c.credito}</TableCell>
              <TableCell>{c.detalhes.status}</TableCell>
              <TableCell className="font-bold text-green-500">
                R${c.total.toLocaleString("pt-BR")}
              </TableCell>
              {categorias.map((cat) => (
                <TableCell key={cat}>
                  R${(c.categorias[cat] || 0).toLocaleString("pt-BR")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              Detalhes do Contrato: {selectedContrato?.contrato}
            </DrawerTitle>
            <DrawerDescription>
              Informações completas sobre o contrato.
            </DrawerDescription>
          </DrawerHeader>
          {selectedContrato && (
            <div className="p-6 space-y-4 overflow-auto max-h-[80vh]">
              {/* Seção de Dados Principais (layout de grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div>
                  <div className="font-semibold">Cliente</div>
                  <div>{selectedContrato.cliente}</div>
                </div>
                <div>
                  <div className="font-semibold">Vendedor</div>
                  <div>{selectedContrato.vendedor}</div>
                </div>
                <div>
                  <div className="font-semibold">Status</div>
                  <div>{selectedContrato.detalhes.status}</div>
                </div>
                <div>
                  <div className="font-semibold">Data da Venda</div>
                  <div>{selectedContrato.detalhes.dataDaVenda}</div>
                </div>
                <div>
                  <div className="font-semibold">Ponto de Venda</div>
                  <div>{selectedContrato.detalhes.nomePontoDeVenda}</div>
                </div>
                <div>
                  <div className="font-semibold">Segmento</div>
                  <div>{selectedContrato.detalhes.segmento}</div>
                </div>
              </div>

              {/* Linha divisória para separar seções */}
              <hr className="my-4" />

              {/* Seção de Informações Financeiras (layout de grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div>
                  <div className="font-semibold">Valor Bruto</div>
                  <div>
                    R$
                    {selectedContrato.detalhes.valorBruto.toLocaleString(
                      "pt-BR"
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Crédito Atualizado</div>
                  <div>{selectedContrato.detalhes.creditoAtualizado}</div>
                </div>
                <div>
                  <div className="font-semibold">Parcela</div>
                  <div>{selectedContrato.detalhes.parcela}</div>
                </div>
                <div>
                  <div className="font-semibold">Total</div>
                  <div>R${selectedContrato.total.toLocaleString("pt-BR")}</div>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="font-semibold">Categorias</div>
                  <ul className="list-disc list-inside mt-2">
                    {Object.entries(selectedContrato.categorias).map(
                      ([cat, valor]) => (
                        <li key={cat}>
                          {cat}: R${valor.toLocaleString("pt-BR")}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Seção de Ações */}
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleUpdate}>
                  Atualizar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Excluir</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso irá excluir
                        permanentemente o contrato.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
