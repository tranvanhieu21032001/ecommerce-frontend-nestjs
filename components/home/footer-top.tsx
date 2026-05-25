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
    <div className="grid grid-cols-2 gap-8 border-b">
      {data.map((item) => (
        <div
          key={item.title}
          className="group flex items-center gap-3 p-4 transition-colors duration-300 hover:bg-gray-50 lg:col-span-1"
        >
          <span className="text-gray-600 transition-colors group-hover:text-[#3B9C3C]">
            {item.icon}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-black">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 transition-colors group-hover:text-gray-900">
              {item.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
