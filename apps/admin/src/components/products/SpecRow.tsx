import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ProductSpec } from "@/types/addProductTypes";

interface SpecRowProps {
  index: number;
  spec: ProductSpec;
  onUpdate: (index: number, field: "key" | "value", value: string) => void;
  onDelete: (index: number) => void;
}

export const SpecRow: React.FC<SpecRowProps> = ({
  index,
  spec,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="flex items-center space-x-2 py-2">
      <Input
        value={spec.key}
        onChange={(e) => onUpdate(index, "key", e.target.value)}
        placeholder="Thuộc tính (VD: RAM)"
        className="flex-1"
      />
      <Input
        value={spec.value}
        onChange={(e) => onUpdate(index, "value", e.target.value)}
        placeholder="Giá trị (VD: 8GB)"
        className="flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
