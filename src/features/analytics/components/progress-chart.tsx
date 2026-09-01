"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Card } from "@/components/ui/card";

interface ChartData {
    date: string;
    total: number;
}

interface ProgressChartProps {
    data: ChartData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
    const formatBRL = (val: number) =>
        val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    if (data.length === 0) {
        return (
            <Card className="h-64 flex items-center justify-center bg-muted/10 border-dashed">
                <p className="text-muted-foreground text-sm">Faltam dados para gerar o gráfico.</p>
            </Card>
        );
    }

    return (
        <Card className="p-4 sm:p-6 w-full h-80 overflow-hidden">
            <h3 className="text-sm font-medium text-muted-foreground mb-6">Curva de Crescimento</h3>
            <div className="w-full h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            stroke="currentColor"
                            className="text-muted-foreground"
                            minTickGap={20}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `R$${value}`}
                            stroke="currentColor"
                            className="text-muted-foreground"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                            formatter={(value: any) => [formatBRL(Number(value) || 0), "Total Guardado"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}