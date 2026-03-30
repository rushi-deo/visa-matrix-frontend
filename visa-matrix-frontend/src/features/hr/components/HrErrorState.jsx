import React from "react";

export default function HrErrorState({ message, onRetry }) {
  return (
    <section className="panel hr-panel-center">
      <div className="alert-card alert-card--danger">
        <span className="alert-card__eyebrow">HR Error</span>
        <strong>{message}</strong>
      </div>
      {onRetry ? (
        <button className="secondary-button" type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </section>
  );
}

