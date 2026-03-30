import React from "react";

export default function HrTrendBars({ title, items, valueKey, labelKey, formatter = (value) => value }) {
  return (
    <article className="panel">
      <div className="panel__header">
        <div>
          <h3>{title}</h3>
          <p>Operational trend snapshot.</p>
        </div>
      </div>
      <div className="chart-bars hr-chart-bars">
        {items.map((item) => (
          <article className="chart-bar hr-chart-bar" key={item[labelKey]}>
            <strong>{formatter(item[valueKey])}</strong>
            <div className="chart-bar__column" style={{ height: `${Math.max(18, item[valueKey] * 12)}px` }} />
            <span>{item[labelKey]}</span>
          </article>
        ))}
      </div>
    </article>
  );
}

