import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, RefreshCw, Package } from "lucide-react";
import type { ProductVariant } from "@/types/addProductTypes";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface VariantOption {
  name: string;
  values: string[];
}

interface VariantSectionProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice: number;
}

export const VariantSection: React.FC<VariantSectionProps> = ({
  variants,
  onChange,
  basePrice,
}) => {
  // Local state to manage options before generating
  const [options, setOptions] = useState<VariantOption[]>([
    { name: "Màu sắc", values: [] },
  ]);
  const [inputValue, setInputValue] = useState<{ [key: number]: string }>({});

  const handleAddOption = () => {
    setOptions([...options, { name: "", values: [] }]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionNameChange = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const handleAddValue = (index: number) => {
    const val = (inputValue[index] || "").trim();
    if (!val) return;
    
    const newOptions = [...options];
    if (newOptions[index].values.includes(val)) {
      toast.warning("Giá trị đã tồn tại");
      return;
    }
    
    newOptions[index].values.push(val);
    setOptions(newOptions);
    setInputValue({ ...inputValue, [index]: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue(index);
    }
  };

  const handleRemoveValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values.splice(valIndex, 1);
    setOptions(newOptions);
  };

  const generateVariants = () => {
    // Filter out empty options
    const validOptions = options.filter(
      (opt) => opt.name.trim() !== "" && opt.values.length > 0
    );

    if (validOptions.length === 0) {
      toast.warning("Vui lòng thêm ít nhất một thuộc tính và giá trị");
      return;
    }

    // Cartesian product
    const cartesian = (arrays: any[][]): any[][] => {
      return arrays.reduce(
        (a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())),
        [[]]
      );
    };

    const valuesArrays = validOptions.map((opt) => opt.values);
    const combinations = cartesian(valuesArrays);

    const newVariants: ProductVariant[] = combinations.map((combo) => {
      // combo can be a string (if 1 option) or an array of strings (if > 1 options)
      const comboArray = Array.isArray(combo) ? combo : [combo];
      const attributes = validOptions.map((opt, i) => ({
        name: opt.name,
        value: comboArray[i],
      }));

      const variantName = comboArray.join(" - ");

      // Basic SKU generation
      const skuSuffix = comboArray
        .map((c) => c.substring(0, 3).toUpperCase())
        .join("-");

      return {
        variantName,
        sku: `VAR-${skuSuffix}-${Math.floor(Math.random() * 1000)}`,
        price: basePrice || 0,
        stockQuantity: 0,
        discountPercentage: 0,
        attributes,
      };
    });

    onChange(newVariants);
    toast.success(`Đã tạo ${newVariants.length} biến thể`);
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    onChange(updated);
  };

  // Compute totals
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Biến Thể Sản Phẩm</CardTitle>
          {variants.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              <Package className="w-3.5 h-3.5 mr-1" />
              {variants.length} biến thể
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Tùy chọn thuộc tính</h4>
            <Button variant="outline" size="sm" onClick={handleAddOption} type="button">
              <Plus className="w-4 h-4 mr-2" /> Thêm tùy chọn
            </Button>
          </div>

          <div className="space-y-4">
            {options.map((opt, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-1/3">
                    <Label>Tên thuộc tính</Label>
                    <Input
                      value={opt.name}
                      onChange={(e) => handleOptionNameChange(i, e.target.value)}
                      placeholder="VD: Màu sắc, Dung lượng..."
                      className="mt-1 bg-background"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Giá trị (Nhấn Enter để thêm)</Label>
                    <div className="flex mt-1 gap-2">
                      <Input
                        value={inputValue[i] || ""}
                        onChange={(e) =>
                          setInputValue({ ...inputValue, [i]: e.target.value })
                        }
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        placeholder="VD: Đen, Trắng..."
                        className="bg-background"
                      />
                      <Button type="button" variant="secondary" onClick={() => handleAddValue(i)}>
                        Thêm
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-6 text-destructive"
                    onClick={() => handleRemoveOption(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {opt.values.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opt.values.map((v, vIdx) => (
                      <div key={vIdx} className="flex items-center bg-background border px-3 py-1 rounded-full text-sm">
                        {v}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(i, vIdx)}
                          className="ml-2 text-muted-foreground hover:text-destructive"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {options.length > 0 && (
            <div className="flex justify-end">
              <Button type="button" onClick={generateVariants} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" /> Tạo các biến thể
              </Button>
            </div>
          )}
        </div>

        {variants.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Danh sách biến thể</h4>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    Tổng tồn kho: <span className="font-bold ml-1">{totalStock.toLocaleString()}</span>
                  </Badge>
                </div>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tên / Thuộc tính</th>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium w-50">Giá (₫)</th>
                      <th className="px-4 py-3 font-medium w-28">Giảm giá (%)</th>
                      <th className="px-4 py-3 font-medium w-20">Số lượng</th>
                      <th className="px-4 py-3 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((variant, i) => {
                      const finalPrice = variant.price * (1 - (variant.discountPercentage || 0) / 100);
                      return (
                        <tr key={i} className="hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{variant.variantName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {variant.attributes.map(a => `${a.name}: ${a.value}`).join(" | ")}
                            </div>
                            {variant.discountPercentage > 0 && (
                              <div className="text-xs text-green-600 mt-0.5">
                                Giá sau giảm: {Math.round(finalPrice).toLocaleString()}₫
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={variant.price || ""}
                              onChange={(e) => handleVariantChange(i, "price", Number(e.target.value))}
                              className="h-8 text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={variant.discountPercentage || ""}
                              onChange={(e) => handleVariantChange(i, "discountPercentage", Number(e.target.value))}
                              className="h-8 text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0}
                              value={variant.stockQuantity || ""}
                              onChange={(e) => handleVariantChange(i, "stockQuantity", Number(e.target.value))}
                              className="h-8 text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveVariant(i)}
                              className="text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
