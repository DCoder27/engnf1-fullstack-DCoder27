import { useState } from "react";

import { createResource, updateResource } from "../api/adminApi.js";

const EMPTY_FORM = {
  name: "",
  type: "ROOM",
  capacity: "",
  description: "",
  isActive: true,
};

const toFormValues = (resource) => {
  if (!resource) {
    return EMPTY_FORM;
  }

  return {
    name: resource.name,
    type: resource.type,
    capacity: String(resource.capacity),
    description: resource.description ?? "",
    isActive: resource.isActive,
  };
};

export function ResourceForm({ resource, token, onCancel, onSaved }) {
  const [values, setValues] = useState(() => toFormValues(resource));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(resource);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const capacity = Number(values.capacity);

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      setError("Capacity must be a whole number from 1 to 500.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      type: values.type,
      capacity,
      description: values.description.trim() || null,
      ...(isEditing ? { isActive: values.isActive } : {}),
    };

    setError("");
    setIsSaving(true);

    try {
      const savedResource = isEditing
        ? await updateResource({
            resourceId: resource.id,
            updates: payload,
            token,
          })
        : await createResource({ resource: payload, token });
      onSaved(savedResource);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="resource-form__heading">
        <div>
          <span>{isEditing ? "Update inventory" : "Expand inventory"}</span>
          <h3>{isEditing ? "Edit resource" : "New resource"}</h3>
        </div>
        {isEditing && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <label>
        Resource name
        <input
          required
          minLength="3"
          maxLength="60"
          value={values.name}
          onChange={(event) => setField("name", event.target.value)}
          placeholder="e.g. Design Lab"
        />
      </label>

      <div className="resource-form__row">
        <label>
          Type
          <select
            value={values.type}
            onChange={(event) => setField("type", event.target.value)}
          >
            <option value="ROOM">Room</option>
            <option value="LAB">Lab</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </label>
        <label>
          Capacity
          <input
            required
            type="number"
            min="1"
            max="500"
            step="1"
            value={values.capacity}
            onChange={(event) => setField("capacity", event.target.value)}
            placeholder="1–500"
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          maxLength="300"
          rows="4"
          value={values.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder="Optional details about the resource"
        />
        <small>{values.description.length}/300</small>
      </label>

      {isEditing && (
        <label className="resource-form__toggle">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => setField("isActive", event.target.checked)}
          />
          Available for new bookings
        </label>
      )}

      {error && <p className="resource-form__error">{error}</p>}
      <button className="resource-form__submit" type="submit" disabled={isSaving}>
        {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create resource"}
      </button>
    </form>
  );
}
