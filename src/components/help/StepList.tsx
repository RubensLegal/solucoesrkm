export function StepList({ steps }: { steps: string[] }) {
    return (
        <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed pt-1">{step}</p>
                </div>
            ))}
        </div>
    );
}
