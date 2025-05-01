import { iconVariants } from "@/app/types/types";
import Icon from "./Icon";

const icons: iconVariants[] = ["home", "lyrics", "details", "discover"];

export default function Sidebar() {
  return (
    <nav className="fixed top-16 left-0 h-full w-60 bg-black text-white overflow-y-auto z-20 py-6">
      <ul>
        {icons.map((icon: iconVariants, index) => (
          <li className="flex items-center gap-4" key={index}>
            <Icon variant={icon} size={25} />
            <p>{icon[0].toUpperCase() + icon.slice(1, icon.length)}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}
