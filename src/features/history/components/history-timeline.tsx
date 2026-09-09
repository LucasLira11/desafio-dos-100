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
    profile_color: string;
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
            <div className="text-center py-14 px-6 border border-dashed border-border rounded-2xl bg-card">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-foreground font-medium text-sm">Nenhum depósito registrado ainda</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-64 mx-auto">
                    O histórico de vocês começará a ser escrito assim que o primeiro depósito for feito.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {deposits.map((deposit) => (
                <div
                    key={deposit.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-l-[3px] border-border bg-card"
                    style={{ borderLeftColor: deposit.profile_color }}
                >
                    <div
                        className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${deposit.profile_color}1A`, color: deposit.profile_color }}
                    >
                        <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-base tracking-tight truncate">
                                {formatBRL(deposit.amount)}
                            </span>
                            <span className="text-[10px] shrink-0 bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                Passo {deposit.step_number}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: deposit.profile_color }}
                            />
                            <p className="text-xs text-muted-foreground truncate">
                                {deposit.is_mine ? "Você" : deposit.profile_name}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formatRelativeDate(deposit.deposited_at)}
                        </span>
                        {deposit.is_mine && (
                            <UndoDepositDialog
                                amount={deposit.amount}
                                depositId={deposit.id}
                                stepNumber={deposit.step_number}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
