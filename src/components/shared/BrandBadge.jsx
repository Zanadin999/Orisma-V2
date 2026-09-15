import React from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";

export default function BrandBadge({ categoryKey }) {
  const { getCategory } = useCategoriesContext();
  const brand = getCategory(categoryKey);
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${brand.color}`}>
      {brand.label}
    </span>
  );
}
