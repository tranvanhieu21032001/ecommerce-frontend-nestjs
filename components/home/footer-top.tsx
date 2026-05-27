import { Clock3, Mail, MapPin, Phone } from "lucide-react";

const data = [
  {
    title: "Visit Us",
    subtitle: "New Orleans, USA",
    icon: <MapPin size={34} strokeWidth={1.5} />,
  },
  {
    title: "Call Us",
    subtitle: "+12 958 648 597",
    icon: <Phone size={34} strokeWidth={1.5} />,
  },
  {
    title: "Working Hours",
    subtitle: "Mon - Sat: 10:00 AM - 7:00 PM",
    icon: <Clock3 size={34} strokeWidth={1.5} />,
  },
  {
    title: "Email Us",
    subtitle: "thehole@gmail.com",
    icon: <Mail size={34} strokeWidth={1.5} />,
  },
];

export function FooterTop() {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <div
          key={item.title}
          className="group flex items-center gap-4 border-b border-white/10 bg-[#0A4432] px-5 py-5 transition-colors duration-300 hover:bg-[#10503A] sm:odd:border-r lg:border-b-0 lg:not-last:border-r"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#93D991] transition-colors group-hover:bg-[#3B9C3C] group-hover:text-white">
            {item.icon}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {item.title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-white/65">
              {item.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
