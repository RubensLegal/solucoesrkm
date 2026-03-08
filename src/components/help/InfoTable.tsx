export function InfoTable({
    rows,
}: {
    rows: { label: string; value: string }[];
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {rows.map((row, i) => (
                <div
                    key={i}
                    className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
                >
                    <span className="text-sm font-medium text-foreground">{row.label}</span>
                    <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-lg border border-black/10 dark:border-white/10">
                        {row.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
