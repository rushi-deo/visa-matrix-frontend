import React from "react";

export default function HrLoadingState({ message = "Loading HR workspace..." }) {
  return (
    <section className="panel hr-panel-center">
      <div className="hr-loader" aria-hidden="true" />
      <p>{message}</p>
    </section>
  );
}

