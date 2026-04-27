import React from "react";

export default function QuotationFooterActions({
  editMode = false,
  sending = false,
  onEdit,
  onSend,
}) {
  return (
    <div className="quotation-actions">
      <button className="primary-button" disabled={sending} onClick={onSend} type="button">
        {sending ? "Sending..." : "Send"}
      </button>
      <button className="secondary-button" onClick={onEdit} type="button">
        {editMode ? "Preview" : "Edit"}
      </button>
    </div>
  );
}
