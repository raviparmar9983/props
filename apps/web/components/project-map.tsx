interface ProjectMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export function ProjectMap({ latitude, longitude, title }: ProjectMapProps) {
  const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div className="mt-3 overflow-hidden rounded-card border border-slate-200 shadow-card">
      <iframe
        src={src}
        title={`Map location — ${title}`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0 md:h-80"
      />
    </div>
  );
}
