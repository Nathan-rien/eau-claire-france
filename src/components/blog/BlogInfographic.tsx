import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

interface Props {
  infographic: {
    type: "bar" | "line";
    title: string;
    data: { label: string; value: number }[];
    unit?: string;
  };
}

export default function BlogInfographic({ infographic }: Props) {
  const { type, title, data, unit } = infographic;
  if (!data?.length) return null;

  return (
    <figure className="my-8 p-5 bg-muted/30 rounded-xl border border-border">
      <figcaption className="text-sm font-semibold text-foreground mb-4">{title}</figcaption>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}${unit ?? ""}`} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} connectNulls />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}${unit ?? ""}`} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
