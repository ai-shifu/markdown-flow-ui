import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { Variable } from "../types";
import { useTranslation } from "react-i18next";

interface VariableSelectProps {
  variables?: Variable[];
  systemVariables?: Variable[];
  selectedName?: string;
  onSelect?: (variable: Variable) => void;
  onAddVariable?: (variable: Variable) => void;
}

const EMPTY_VARIABLES: Variable[] = [];

const VariableSelect = ({
  variables: initialVariables,
  systemVariables: initialSystemVariables,
  selectedName,
  onSelect,
  onAddVariable,
}: VariableSelectProps) => {
  const { t } = useTranslation();
  const safeInitialVariables = initialVariables ?? EMPTY_VARIABLES;
  const safeInitialSystemVariables = initialSystemVariables ?? EMPTY_VARIABLES;

  const [variables, setVariables] = useState<Variable[]>(safeInitialVariables);
  useEffect(() => {
    setVariables(safeInitialVariables);
  }, [safeInitialVariables]);
  const systemVariables = safeInitialSystemVariables;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVariableName, setNewVariableName] = useState("");
  const [duplicateError, setDuplicateError] = useState(false);
  const normalizedSearch = searchQuery.toLowerCase();
  const filterPredicate = (variable: Variable) => {
    const nameMatch = variable.name.toLowerCase().includes(normalizedSearch);
    const labelMatch = variable.label
      ? variable.label.toLowerCase().includes(normalizedSearch)
      : false;
    return nameMatch || labelMatch;
  };

  const filteredSystemVariables = useMemo(
    () => systemVariables.filter(filterPredicate),
    [systemVariables, normalizedSearch]
  );
  const filteredCustomVariables = useMemo(
    () => variables.filter(filterPredicate),
    [variables, normalizedSearch]
  );
  const hasAnyResult =
    filteredSystemVariables.length > 0 || filteredCustomVariables.length > 0;

  const handleAddVariable = () => {
    if (newVariableName.trim()) {
      const trimmed = newVariableName.trim();
      const lowerName = trimmed.toLowerCase();
      const isDuplicate = [...variables, ...systemVariables].some(
        (v) => v.name.toLowerCase() === lowerName
      );

      if (isDuplicate) {
        setDuplicateError(true);
        return;
      }

      const newVariable: Variable = {
        name: trimmed,
      };
      setVariables((prev) => [...prev, newVariable]);
      onAddVariable?.({ name: trimmed });
      setNewVariableName("");
      setIsAddingNew(false);
      setSearchQuery("");
      setDuplicateError(false);
      onSelect?.(newVariable);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewVariableName("");
    setDuplicateError(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVariableName(e.target.value);
    if (duplicateError) {
      setDuplicateError(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddVariable();
    } else if (e.key === "Escape") {
      handleCancelAdd();
    }
  };
  return (
    <div className="w-full max-w-sm rounded-lg border bg-white">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("variableSearchPlaceholder", "Search variable")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto p-2">
        {hasAnyResult ? (
          <div className="space-y-4">
            {filteredSystemVariables.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-xs font-medium text-muted-foreground">
                  {t("variableSectionSystem", "System Variables")}
                </p>
                <div className="space-y-1">
                  {filteredSystemVariables.map((variable) => (
                    <button
                      key={`system-${variable.name}`}
                      onClick={() => onSelect?.(variable)}
                      className={cn(
                        "flex w-full items-start justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-accent",
                        selectedName === variable.name && "bg-accent"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {variable.name}
                        </span>
                        {variable.label && (
                          <span className="text-xs text-muted-foreground">
                            {variable.label}
                          </span>
                        )}
                      </div>
                      {selectedName === variable.name && (
                        <Check className="mt-1 h-4 w-4 text-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredCustomVariables.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-xs font-medium text-muted-foreground">
                  {t("variableSectionCustom", "Custom Variables")}
                </p>
                <div className="space-y-1">
                  {filteredCustomVariables.map((variable) => (
                    <button
                      key={`custom-${variable.name}`}
                      onClick={() => onSelect?.(variable)}
                      className={cn(
                        "flex w-full items-start justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-accent",
                        selectedName === variable.name && "bg-accent"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {variable.name}
                        </span>
                        {variable.label && (
                          <span className="text-xs text-muted-foreground">
                            {variable.label}
                          </span>
                        )}
                      </div>
                      {selectedName === variable.name && (
                        <Check className="mt-1 h-4 w-4 text-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            {searchQuery
              ? t("variableNotFound", "No variables found")
              : t("variableEmpty", "No variables yet")}
          </div>
        )}
      </div>

      <div className="border-t border-border p-2">
        {isAddingNew ? (
          <div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
              <Input
                type="text"
                placeholder={t("variableNamePlaceholder", "Variable name")}
                value={newVariableName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
                className="h-8 flex-1 border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelAdd}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddVariable}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
            {duplicateError && (
              <p className="mt-1 px-3 text-xs text-red-500">
                {t("variableAlreadyExists", "Variable already exists")}
              </p>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("variableAddNew", "Add new variable")}
          </Button>
        )}
      </div>
    </div>
  );
};
export default VariableSelect;
