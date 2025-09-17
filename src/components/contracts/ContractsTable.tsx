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
      
      setContratos(data)
      console.log("contratos", data)

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

function renameCategorias (lics){

  if (lics == "LICENCIADO") return "LIC"
  if (lics == "LICENCIADO 0,50%") return "LIC50"
  if (lics == "LICENCIADO 0,80%") return "LIC80"
  if (lics == "LICENCIADO 1,00%") return "LIC100"
  if (lics == "LICENCIADO 1,50%") return "LIC150"
  if (lics == "AUTORIZADO 2,00%") return "AUT200"
  if (lics == "VENDEDOR") return "AUT200"

}

const categoriasList = [
  {
    id: 89812, nome:"LICENCIADO", 
    users: 
    [
      { id: 89809, nome: "LOJA", part: 0.010 }, 
    ],
  },
  {
    id: 89812, nome:"LICENCIADO 1,50%", 
    users: 
    [
      {id: 89809, nome: "LOJA", part: 0.010}, 
      {id: 3030, nome: "Bruno", part: 0.0050},
    ],
  },
  {
    id: 89812, nome:"LICENCIADO 0,80%", 
    users: 
    [
      {id: 89809, nome: "Felipe Otelakoski", part: 0.0080}, 
    ],
  },
  {
    id: 89812, nome:"LICENCIADO 0,50%", 
    users: 
    [
      {id: 89809, nome: "Felipe Otelakoski", part: 0.0050}, 
    ],
  },
  {
    id: 89812, nome:"AUTORIZADO 2,00%", 
    users: 
    [
      {id: 89809, nome: "Felipe Otelakoski", part: 0.020}, 
    ],
  },
  {
    id: 89812, nome:"VENDEDOR", 
    users: 
    [
      {id: 89809, nome: "Felipe Otelakoski", part: 0.02}, 
    ],
  }
]

const vendedores = [ {id: 91539, nome: "Felipe Otelakoski", part: 0.02} ]

const getUsersByCategoria = (categoria: string) => {
  const cat = categoriasList.find(c => c.nome.toLowerCase() == categoria.toLowerCase());
  return cat?.users ?? []; // [] se não achar
}

function calcConstracts(contracts, comissionado, cod){

    const { status, detalhes: { vendedor, categoria, creditoAtualizado, comissao, valorBruto }  } = contracts

    // console.log(contracts)
    // console.log(categoria)
    // console.log(comissionado)
    console.log(vendedor, vendedores.find( c => c.id == parseInt(vendedor) )?.id)

    const resultado = (categoria === "AUTORIZADO 2,00%" || categoria === "VENDEDOR")
    ? { calc: vendedores.find( c => c.id == parseInt(vendedor) )?.part * creditoAtualizado, id: vendedores.find( c => c.id == parseInt(vendedor) )?.id, nome: vendedores.find( c => c.id == parseInt(vendedor) )?.nome }
      // ? { id: comissionado[0].id,name: comissionado[0].nome, calc: comissionado[0].part * creditoAtualizado } 
      //trocar por funcao de buscar vendedor com o código do contrato
      : comissionado.map( ( { part, id, nome } ) =>  ({ id, name: nome, calc: part * creditoAtualizado }) )

    console.log(resultado)
    return resultado?.length ? resultado : []
  }

  return (
    <>
      <Table>
        <TableCaption>Lista de contratos agrupados</TableCaption>
        <TableHeader className="">
          <TableRow className="uppercase text-[12px]">
            <TableHead>Contrato</TableHead>
            <TableHead> <div className="max-w-[140px]">Cliente</div> </TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Parcela</TableHead>
            <TableHead><div className="w-[100px]">Crédito</div> </TableHead>
            {/* <TableHead>Status</TableHead> */}
            <TableHead>Total</TableHead>
              {categorias.map((cat) => (
                <TableHead key={cat}>
                  <div className="w-[60px]"> <strong>{renameCategorias(cat)} </strong></div>
                </TableHead>
              ))}

            {/* <TableHead><div className="w-[100px]">BT CALCULAR</div> </TableHead> */}
              
          </TableRow>
        </TableHeader>
        <TableBody>
            
          {contratos.map((c) => (
            <TableRow
              key={c.contrato}
              onClick={() => handleRowClick(c)}
              className="cursor-pointer hover:bg-[rgba(255,255,255,0.1)] text-[12px] h-[60px] text-left"
            >
              <TableCell>{c.contrato}</TableCell>
              <TableCell className=" text-wrap"> <div className="max-w-[140px]">{c.cliente}</div></TableCell>
              <TableCell>{c.vendedor}</TableCell>
              <TableCell>{c.parcela}</TableCell>
              <TableCell>R${ c.credito.toLocaleString("pt-BR") }</TableCell>
              {/* <TableCell>{c.detalhes.status}</TableCell> */}
              <TableCell className="font-bold">
                R${c.total.toLocaleString("pt-BR")}
              </TableCell>
                {/* {categorias.map((cat) => { console.log(cat) 
                return (
                  <TableCell key={cat}>
                    R$ {(c.categorias[cat] || 0).toLocaleString("pt-BR")} 
                  </TableCell>
                )})} */}

                {categorias.map((cat) => { 

                return (

                  <TableCell key={cat}>
                    {/* R$ {(c.categorias[cat] || 0).toLocaleString("pt-BR")} 
                     */}

                    {/* { c.categorias[cat] ? "tem" : "não" } */}

                     {/* { ( vendedores.find( cod => cod.id == c.vendedor )?.id == c.vendedor ) 
                        ? 'R$0' // nada a mostrar
                        : calcConstracts(c, getUsersByCategoria(cat)).map(({ id, name, calc }) => (
                            <div key={id}>
                              {name} — {calc.toLocaleString("pt-BR")}
                            </div>
                          ))
                      } */}

                      { calcConstracts(c, getUsersByCategoria(cat)).map(({ id, name, calc }) => (
                            <div key={id}>
                              {name} — {calc.toLocaleString("pt-BR")}
                            </div>
                          )
                      )}

                  </TableCell>
                )})}

      
            </TableRow>
          ))}


        </TableBody>
      </Table>

      <Drawer >
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
