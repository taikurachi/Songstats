import { iconVariants } from "@/app/types/types";
import Icon from "./Icon";

const icons: iconVariants[] = ["home", "lyrics", "details", "discover"];

export default function Sidebar() {
  return (
    <nav className="sticky top-20 left-0 h-full bg-spotify-darkGray rounded-lg text-white overflow-y-auto z-20 py-6">
      <ul className="flex flex-col ml-8 gap-8">
        {icons.map((icon: iconVariants, index) => (
          <li className="flex items-center gap-8" key={index}>
            <Icon variant={icon} size={25} />
            <p className="text-lg">
              {icon[0].toUpperCase() + icon.slice(1, icon.length)}
            </p>
          </li>
        ))}
      </ul>
    </nav>
  );
}
