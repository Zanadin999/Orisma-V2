import React from "react";
import { Calendar } from "lucide-react";
import { TIMEFRAME_OPTIONS } from "../../utils/dateFilters";

export default function TimeframeFilter({ 
  timeframe, 
  onTimeframeChange, 
  customStart, 
  customEnd, 
  onCustomStartChange, 
  onCustomEndChange 
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-[#7c8783]" />
        <select
          value={timeframe}
          onChange={e => onTimeframeChange(e.target.value)}
          className="border border-[#e6e4dd] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-teal-600 bg-white"
        >
          {TIMEFRAME_OPTIONS.map(tf => (
            <option key={tf.key} value={tf.key}>
              {tf.label}
            </option>
          ))}
        </select>
      </div>
      
      {timeframe === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={e => onCustomStartChange(e.target.value)}
            className="border border-[#e6e4dd] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-teal-600"
            placeholder="Start date"
          />
          <span className="text-[#7c8783] text-[13px]">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => onCustomEndChange(e.target.value)}
            className="border border-[#e6e4dd] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-teal-600"
            placeholder="End date"
          />
        </div>
      )}
    </div>
  );
}
