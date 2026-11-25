import { useState } from "react";

const CATEGORIES = ["BILLING", "BUG", "FEATURE_REQUEST", "LOGIN", "DELIVERY"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function TicketReviewForm({ isSaving, onSubmit, ticket }) {
  const [form, setForm] = useState({
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    assigneeId: ticket.assigneeId ?? "",
  });

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const updates = {};

    for (const field of ["category", "priority", "status"]) {
      if (form[field] !== ticket[field]) {
        updates[field] = form[field];
      }
    }

    const currentAssignee = ticket.assigneeId ?? "";
    if (form.assigneeId.trim() !== currentAssignee) {
      updates.assigneeId = form.assigneeId.trim() || null;
    }

    onSubmit(updates);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Agent review</h3>
      <ReviewSelect label="Category" value={form.category} options={CATEGORIES} onChange={updateField("category")} />
      <ReviewSelect label="Priority" value={form.priority} options={PRIORITIES} onChange={updateField("priority")} />
      <ReviewSelect label="Status" value={form.status} options={STATUSES} onChange={updateField("status")} />
      <label>
        Assignee ID
        <input
          value={form.assigneeId}
          maxLength="24"
          placeholder="Optional MongoDB user ID"
          onChange={updateField("assigneeId")}
        />
      </label>
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving…" : "Save review"}
      </button>
    </form>
  );
}

function ReviewSelect({ label, onChange, options, value }) {
  return (
    <label>
      {label}
      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
