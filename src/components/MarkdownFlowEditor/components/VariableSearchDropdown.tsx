import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Variable } from "../types";
import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";

interface VariableSearchDropdownProps {
  open: boolean;
  anchorElement: HTMLElement | null;
  onClose: () => void;
  onSelect: (variable: Variable) => void;
  variables: Variable[];
  systemVariables: Variable[];
  labels: {
    searchPlaceholder: string;
    systemLabel: string;
    customLabel: string;
    emptyLabel: string;
  };
}

const VariableSearchDropdown: React.FC<VariableSearchDropdownProps> = ({
  open,
  anchorElement,
  onClose,
  onSelect,
  variables,
  systemVariables,
  labels,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const updatePosition = useCallback(() => {
    if (!anchorElement) return;
    const rect = anchorElement.getBoundingClientRect();
    setPosition({
      left: rect.left,
      top: rect.bottom + 8,
    });
  }, [anchorElement]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlightIndex(-1);
      return;
    }
    updatePosition();
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        anchorElement &&
        !anchorElement.contains(target)
      ) {
        onClose();
      }
    };
    const handleScroll = () => updatePosition();
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open, anchorElement, onClose, updatePosition]);

  const normalizedQuery = query.trim().toLowerCase();
  const filterVariable = useCallback(
    (variable: Variable) => {
      if (!normalizedQuery) return true;
      const nameMatch = variable.name.toLowerCase().includes(normalizedQuery);
      const labelMatch = variable.label
        ? variable.label.toLowerCase().includes(normalizedQuery)
        : false;
      return nameMatch || labelMatch;
    },
    [normalizedQuery]
  );

  const filteredSystemVariables = useMemo(
    () => systemVariables.filter(filterVariable),
    [systemVariables, filterVariable]
  );
  const filteredCustomVariables = useMemo(
    () => variables.filter(filterVariable),
    [variables, filterVariable]
  );

  const orderedItems = useMemo(
    () => [
      ...filteredSystemVariables.map((variable) => ({
        group: "system" as const,
        variable,
      })),
      ...filteredCustomVariables.map((variable) => ({
        group: "custom" as const,
        variable,
      })),
    ],
    [filteredSystemVariables, filteredCustomVariables]
  );

  const indexesByKey = useMemo(() => {
    const map = new Map<string, number>();
    orderedItems.forEach((item, index) => {
      map.set(`${item.group}-${item.variable.name}`, index);
    });
    return map;
  }, [orderedItems]);

  useEffect(() => {
    if (orderedItems.length && open) {
      setHighlightIndex(0);
    } else if (!orderedItems.length) {
      setHighlightIndex(-1);
    }
  }, [orderedItems.length, normalizedQuery, open]);

  const handleSelect = useCallback(
    (variable: Variable) => {
      onSelect(variable);
      onClose();
    },
    [onClose, onSelect]
  );

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!orderedItems.length) {
      if (event.key === "Escape") {
        onClose();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % orderedItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? orderedItems.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = orderedItems[highlightIndex];
      if (item) {
        handleSelect(item.variable);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="markdown-flow-editor-variable-search"
      style={{
        position: "fixed",
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <div className="relative">
        <Search className="variable-search-icon" />
        <Input
          ref={inputRef}
          value={query}
          placeholder={labels.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          className="variable-search-input"
        />
      </div>
      <div className="variable-search-list">
        {filteredSystemVariables.length > 0 && (
          <div className="variable-search-section">
            <p className="variable-search-section-title">
              {labels.systemLabel}
            </p>
            {filteredSystemVariables.map((variable) => {
              const index = indexesByKey.get(`system-${variable.name}`) ?? -1;
              const isActive = highlightIndex === index;
              return (
                <button
                  key={`system-${variable.name}`}
                  type="button"
                  onClick={() => handleSelect(variable)}
                  onMouseEnter={() => {
                    if (index >= 0) {
                      setHighlightIndex(index);
                    }
                  }}
                  className={cn(
                    "variable-search-item",
                    isActive && "variable-search-item-active"
                  )}
                >
                  <span className="variable-search-item-name">
                    {variable.name}
                  </span>
                  {variable.label && (
                    <span className="variable-search-item-label">
                      {variable.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {filteredCustomVariables.length > 0 && (
          <div className="variable-search-section">
            <p className="variable-search-section-title">
              {labels.customLabel}
            </p>
            {filteredCustomVariables.map((variable) => {
              const index = indexesByKey.get(`custom-${variable.name}`) ?? -1;
              const isActive = highlightIndex === index;
              return (
                <button
                  key={`custom-${variable.name}`}
                  type="button"
                  onClick={() => handleSelect(variable)}
                  onMouseEnter={() => {
                    if (index >= 0) {
                      setHighlightIndex(index);
                    }
                  }}
                  className={cn(
                    "variable-search-item",
                    isActive && "variable-search-item-active"
                  )}
                >
                  <span className="variable-search-item-name">
                    {variable.name}
                  </span>
                  {variable.label && (
                    <span className="variable-search-item-label">
                      {variable.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {filteredSystemVariables.length === 0 &&
          filteredCustomVariables.length === 0 && (
            <div className="variable-search-empty">{labels.emptyLabel}</div>
          )}
      </div>
    </div>
  );
};

export default VariableSearchDropdown;
