import React, { useState } from "react";
import { PackagePlus, Repeat } from "lucide-react";
import UnitFormFields, { emptyUnitForm } from "../inventory/UnitFormFields";
import TradeInFormFields, { emptyTradeInForm } from "./TradeInFormFields";
import { rupiah } from "../../utils/pricing";

export default function AcquireUnitForm({ availableUnits, onSubmit, onTradeIn }) {
  const [mode, setMode] = useState("purchase");
  const [purchaseForm, setPurchaseForm] = useState(emptyUnitForm());
  const [tradeInForm, setTradeInForm] = useState(emptyTradeInForm());
  
  // Trade-in specific fields
  const [selectedInventoryUnit, setSelectedInventoryUnit] = useState("");

  function handlePurchaseChange(field, value) {
    setPurchaseForm(prev => ({ ...prev, [field]: value }));
  }

  function handleTradeInChange(field, value) {
    setTradeInForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (mode === "purchase") {
      onSubmit(purchaseForm);
      setPurchaseForm(emptyUnitForm());
    } else {
      // Trade-in mode
      if (!selectedInventoryUnit || !tradeInForm.tradeInValuation) return;
      
      const inventoryUnit = availableUnits.find(u => u.id === Number(selectedInventoryUnit));
      if (!inventoryUnit) return;
      
      const tradeInVal = Number(tradeInForm.tradeInValuation) || 0;
      
      onTradeIn({
        soldUnit: inventoryUnit,
        acquiredUnit: {
          ...tradeInForm,
          unitPrice: tradeInVal,
          costUnit: 0,
          additionalCost: 0,
        },
        tradeInValue: tradeInVal,
      });
      
      setTradeInForm(emptyTradeInForm());
      setSelectedInventoryUnit("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-[12px] text-[#7c8783] block mb-1">Acquisition Mode</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("purchase")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium border ${
              mode === "purchase" 
                ? "bg-[#0e3b3a] text-white border-[#0e3b3a]" 
                : "bg-white text-[#7c8783] border-[#e6e4dd] hover:bg-[#f6f5f1]"
            }`}
          >
            <PackagePlus size={14} /> Purchase
          </button>
          <button
            type="button"
            onClick={() => setMode("tradein")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium border ${
              mode === "tradein" 
                ? "bg-[#0e3b3a] text-white border-[#0e3b3a]" 
                : "bg-white text-[#7c8783] border-[#e6e4dd] hover:bg-[#f6f5f1]"
            }`}
          >
            <Repeat size={14} /> Trade-in
          </button>
        </div>
      </div>

      {mode === "tradein" && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[12px] text-blue-700">
            ℹ️ Trade-in: Customer trades their unit for one from inventory (no zakat applied)
          </div>
          
          <div>
            <label className="text-[12px] text-[#7c8783] block mb-1">Select Inventory Unit (Customer Buying)</label>
            <select
              required
              value={selectedInventoryUnit}
              onChange={e => setSelectedInventoryUnit(e.target.value)}
              className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal-600 bg-white"
            >
              <option value="">-- Select unit from inventory --</option>
              {availableUnits.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.plate} — {rupiah((u.unitPrice || 0) + (u.costUnit || 0) + (u.additionalCost || 0))}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {mode === "purchase" ? (
        <UnitFormFields form={purchaseForm} onChange={handlePurchaseChange} />
      ) : (
        <TradeInFormFields form={tradeInForm} onChange={handleTradeInChange} />
      )}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#0e3b3a] text-white text-[13px] font-medium rounded-lg py-2.5 mt-1 hover:bg-[#0b302f]"
      >
        {mode === "purchase" ? (
          <>
            <PackagePlus size={14} /> Add to inventory
          </>
        ) : (
          <>
            <Repeat size={14} /> Process Trade-in
          </>
        )}
      </button>
    </form>
  );
}
