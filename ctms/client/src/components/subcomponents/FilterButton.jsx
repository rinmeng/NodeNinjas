import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function FilterButton({
  active,
  onClick,
  icon,
  activeIcon,
  inactiveIcon,
  label,
  badgeText,
  tooltipText,
}) {
  const Icon =
    active !== null && active !== "" ? activeIcon : inactiveIcon || icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active !== null && active !== "" ? "default" : "outline"}
          onClick={onClick}
          className="flex items-center gap-2 transition-all"
        >
          <Icon size={18} />
          <span>{label}</span>
          {active !== null && active !== "" && (
            <Badge variant="secondary" className="capitalize">
              {badgeText}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default FilterButton;
