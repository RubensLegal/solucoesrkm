export function HelpSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
