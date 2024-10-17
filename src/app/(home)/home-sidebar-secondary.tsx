"use client";
import { Button } from "@/components/ui/button";
import Logo from "@/features/editor/components/logo";
import { Crown, Plus } from "lucide-react";

const HomeSidebarRoutes = () => {
  return (
    <aside className="hidden lg:flex flex-col space-y-4 w-[264px] h-full overflow-y-auto shrink-0 pt-6 px-4">
      <Logo />
      <div className="flex flex-col space-y-4 flex-1">
        <Button className="flex gap-1 w-full" variant={"secondary"}>
          <Plus className="size-3" />
          Create a design
        </Button>
        <Button className="flex gap-1 w-full">
          <Crown className="size-3 fill-orange-300 stroke-orange-300" />
          Upgrade to Pro
        </Button>
      </div>
    </aside>
  );
};

export default HomeSidebarRoutes;
