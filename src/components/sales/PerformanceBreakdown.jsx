import React from "react";
import { useCategoriesContext } from "../../context/CategoriesContext";

export default function PerformanceBreakdown({ topBrands, topModels }) {
  const { getCategory } = useCategoriesContext();
  const hasData = topBrands.length > 0 || topModels.length > 0;

  return (
    <div className="bg-white border border-[#e6e4dd] rounded-xl p-5">
      <div className="text-[13px] font-semibold mb-3">Performance — top brands &amp; models</div>
      {!hasData ? (
        <div className="text-[13px] text-[#7c8783]">Log a few sales to see what sells best.</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <PerformanceTable
            heading="By brand"
            rows={topBrands.map(b => ({ label: getCategory(b.key).label, count: b.count }))}
          />
          <PerformanceTable
            heading="By model"
            rows={topModels.map(m => ({ label: m.name, count: m.count }))}
          />
        </div>
      )}
    </div>
  );
}

function PerformanceTable({ heading, rows }) {
  const max = Math.max(...rows.map(r => r.count), 1);
  return (
    <div>
      <div className="text-[11.5px] text-[#7c8783] mb-2">{heading}</div>
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map(r => (
            <tr key={r.label} className="border-t border-[#e6e4dd]">
              <td className="py-2 pr-2">{r.label}</td>
              <td className="py-2 pr-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{r.count}×</td>
              <td className="py-2 w-20">
                <div className="h-1.5 rounded bg-[#edece7] overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
