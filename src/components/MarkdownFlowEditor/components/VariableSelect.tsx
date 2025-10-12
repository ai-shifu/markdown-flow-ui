import type React from "react";
import { useState } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { Variable } from "../types";
import { useTranslation } from "react-i18next";

interface VariableSelectProps {
  variables?: Variable[];
  selectedName?: string;
  onSelect?: (variable: Variable) => void;
  onAddVariable?: (variable: Variable) => void;
}

const VariableSelect = ({
  variables: initialVariables = [],
  selectedName,
  onSelect,
  onAddVariable,
}: VariableSelectProps) => {
  const { t } = useTranslation();
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVariableName, setNewVariableName] = useState("");
  const [duplicateError, setDuplicateError] = useState(false);
  console.log("variables", variables, selectedName);

  const filteredVariables = variables.filter((variable) =>
    variable.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVariable = () => {
    if (newVariableName.trim()) {
      const isDuplicate = variables.some(
        (v) => v.name.toLowerCase() === newVariableName.trim().toLowerCase()
      );

      if (isDuplicate) {
        setDuplicateError(true);
        return;
      }

      const newVariable: Variable = {
        name: newVariableName.trim(),
      };
      setVariables([...variables, newVariable]);
      onAddVariable?.({ name: newVariableName.trim() });
      setNewVariableName("");
      setIsAddingNew(false);
      setSearchQuery("");
      setDuplicateError(false);
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
    <div className="w-full max-w-sm rounded-lg border border-border bg-popover shadow-lg">
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
        {!!filteredVariables.length ? (
          filteredVariables.map((variable) => (
            <button
              key={variable.name}
              onClick={() => onSelect?.(variable)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                selectedName === variable.name && "bg-accent"
              )}
            >
              <span className="text-foreground">{variable.name}</span>
              {selectedName === variable.name && (
                <Check className="h-4 w-4 text-foreground" />
              )}
            </button>
          ))
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
