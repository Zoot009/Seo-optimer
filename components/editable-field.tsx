"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2 } from "lucide-react";

interface EditableFieldProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: "text" | "number" | "textarea";
  className?: string;
  displayClassName?: string;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function EditableField({
  value,
  onSave,
  type = "text",
  className = "",
  displayClassName = "",
  multiline = false,
  placeholder = "",
  disabled = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [showEditIcon, setShowEditIcon] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== "number") {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (type === "number") {
      const numValue = parseFloat(editValue);
      if (!isNaN(numValue)) {
        onSave(numValue);
      }
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Enter" && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        {multiline || type === "textarea" ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-20"
            placeholder={placeholder}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            placeholder={placeholder}
          />
        )}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleSave}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Save (Enter)"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Cancel (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${displayClassName}`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowEditIcon(true)}
      onMouseLeave={() => setShowEditIcon(false)}
      title={disabled ? "This field cannot be edited" : "Double-click to edit"}
    >
      <span className={multiline ? "whitespace-pre-wrap" : ""}>
        {value || placeholder}
      </span>
      {!disabled && showEditIcon && (
        <Edit2 className="h-3 w-3 text-blue-500 absolute -right-5 top-1 opacity-70" />
      )}
    </div>
  );
}

// Component for editable score values
interface EditableScoreProps {
  score: number;
  onSave: (newScore: number) => void;
  className?: string;
  disabled?: boolean;
}

export function EditableScore({
  score,
  onSave,
  className = "",
  disabled = false,
}: EditableScoreProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(score));
  const [showEditIcon, setShowEditIcon] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(String(score));
  }, [score]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onSave(Math.round(numValue));
      setIsEditing(false);
    } else {
      // Invalid value, reset
      setEditValue(String(score));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(score));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="number"
          min="0"
          max="100"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-20 text-center"
        />
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Save (Enter)"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Cancel (Esc)"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowEditIcon(true)}
      onMouseLeave={() => setShowEditIcon(false)}
      title={disabled ? "This field cannot be edited" : "Double-click to edit (0-100)"}
    >
      {score}
      {!disabled && showEditIcon && (
        <Edit2 className="h-2 w-2 text-blue-500 absolute -right-4 top-0 opacity-70" />
      )}
    </div>
  );
}
