import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-react";

type cornerPositions =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

const HandleComponent = ({ side }: { side: cornerPositions }) => {
  let Icon;
  if (side === "top-left") Icon = <ArrowDownRight />;
  else if (side === "top-right") Icon = <ArrowDownLeft />;
  else if (side === "bottom-left") Icon = <ArrowUpRight />;
  else Icon = <ArrowUpLeft />;

  return (
    <div className="w-6 h-6 rounded-full shadow border bg-white border-zinc-200 transition hover:bg-primary flex justify-center items-center p-0.5">
      {Icon}
    </div>
  );
};

export default HandleComponent;
