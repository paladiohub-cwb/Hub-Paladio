"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { type ChartConfig, ChartContainer } from "@/components/ui/chart"



import { Button } from "@/components/ui/button"

export default function Home() {

  const chartData = [
    { mes: "Janeiro", vendas: 186, retencao: 80 },
    { mes: "Fevereiro", vendas: 305, retencao: 200 },
    { mes: "Março", vendas: 237, retencao: 120 },
    { mes: "Abril", vendas: 73, retencao: 190 },
    { mes: "Maio", vendas: 209, retencao: 130 },
    { mes: "Junho", vendas: 214, retencao: 140 },
  ]
  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "#9CACA0",
    },
    retencao: {
      label: "Retenção",
      color: "#DE8D8D",
    },
  } satisfies ChartConfig


  return (
    <>
      <main>
        <div className="w-7xl bg-[rgba(255,255,255,0.10)] relative m-auto p-4 rounded-2xl flex flex-col gap-8">
          <div className="flex items-center gap-4">

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

          <div>
            <ul className="flex gap-4 ">
              <Card className="w-[25%] text-white bg-tranparent flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">
                <CardHeader>
                  <CardDescription className="text-white text-sm">FATURAMENTO:</CardDescription>
                  <CardTitle className="font-semibold tabular-nums text-3xl text-white">R$1.000,00</CardTitle>
                  <CardAction className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground">90</CardAction>
                </CardHeader>
              </Card>

              <Card className="w-[25%] text-white bg-tranparent flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">
                <CardHeader>
                  <CardDescription className="text-white text-sm">Nº DE VENDAS:</CardDescription>
                  <CardTitle className="font-semibold tabular-nums text-3xl text-white">120</CardTitle>
                  <CardAction className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground">90</CardAction>
                </CardHeader>
              </Card>

              <Card className="w-[25%] text-white bg-tranparent flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">
                <CardHeader>
                  <CardDescription className="text-white text-sm">TICKET MÉDIO:</CardDescription>
                  <CardTitle className="font-semibold tabular-nums text-3xl text-white">R$180.000</CardTitle>
                  <CardAction className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground">90</CardAction>
                </CardHeader>
              </Card>

              <Card className="w-[25%] text-white bg-tranparent flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">
                <CardHeader>
                  <CardDescription className="text-white text-sm">RETENÇÃO:</CardDescription>
                  <CardTitle className="font-semibold tabular-nums text-3xl text-white">75%</CardTitle>
                  <CardAction className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground">90</CardAction>
                </CardHeader>
              </Card>
            </ul>
          </div>

          <Card className="text-white bg-tranparent flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vendas" fill="var(--color-vendas)" radius={4} />
                <Bar dataKey="retencao" fill="var(--color-retencao)" radius={4} />
              </BarChart>
            </ChartContainer>
          </Card>
        </div>
      </main>
    </>
  );
}
