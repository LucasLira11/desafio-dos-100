"use client";

import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";
import { UndoDepositDialog } from "./undo-deposit-dialog";

interface Deposit {
    id: string;
    amount: number;
    step_number: number;
    deposited_at: string;
    is_mine: boolean;
    profile_name: string;
}

interface HistoryTimelineProps {
    deposits: Deposit[];
}

export function HistoryTimeline({ deposits }: HistoryTimelineProps) {
    const formatBRL = (val: number) =>
        val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const formatRelativeDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isToday(date)) return `Hoje, ${format(date, "HH:mm")}`;
        if (isYesterday(date)) return `Ontem, ${format(date, "HH:mm")}`;
        return format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
    };

    if (deposits.length === 0) {
        return (
            <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-muted/10">
                <p className="text-muted-foreground text-sm">Nenhum depósito registrado ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">O histórico de vocês começará a ser escrito assim que o primeiro depósito for feito.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l border-border/60 ml-4 md:ml-6 space-y-8 pb-8">
            {deposits.map((deposit) => (
                <div key={deposit.id} className="relative pl-6 md:pl-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* Timeline Dot */}
                    <div className="absolute -left-2.75 top-1 bg-background rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-lg">
                                    {formatBRL(deposit.amount)}
                                </span>
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                    Passo {deposit.step_number}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                {deposit.is_mine ? "Você" : deposit.profile_name}
                            </p>

                            {/* Botão de desfazer - Só renderiza se o depósito for do usuário logado */}
                            {deposit.is_mine && (
                                <UndoDepositDialog
                                    amount={deposit.amount}
                                    depositId={deposit.id}
                                    stepNumber={deposit.step_number}
                                />
                            )}
                        </div>

                        <div className="text-xs text-muted-foreground mt-1 sm:mt-0">
                            {formatRelativeDate(deposit.deposited_at)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}