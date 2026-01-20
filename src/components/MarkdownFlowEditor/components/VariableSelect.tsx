import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { Variable } from "../types";
import { isValidVariableName } from "../utils";
import { useTranslation } from "react-i18next";

interface VariableSelectProps {
  variables?: Variable[];
  systemVariables?: Variable[];
  hiddenVariables?: Variable[];
  enableVariableHiding?: boolean;
  selectedName?: string;
  onSelect?: (variable: Variable) => void;
  onAddVariable?: (variable: Variable) => void;
  onBulkHide?: () => void;
  onBulkRestore?: () => void;
}

const EMPTY_VARIABLES: Variable[] = [];

const VariableSelect = ({
  variables: initialVariables,
  systemVariables: initialSystemVariables,
  hiddenVariables: initialHiddenVariables,
  enableVariableHiding = false,
  selectedName,
  onSelect,
  onAddVariable,
  onBulkHide,
  onBulkRestore,
}: VariableSelectProps) => {
  const { t } = useTranslation();
  const safeInitialVariables = initialVariables ?? EMPTY_VARIABLES;
  const safeInitialSystemVariables = initialSystemVariables ?? EMPTY_VARIABLES;
  const hiddenVariables = initialHiddenVariables ?? EMPTY_VARIABLES;

  const [variables, setVariables] = useState<Variable[]>(safeInitialVariables);
  useEffect(() => {
    setVariables(safeInitialVariables);
  }, [safeInitialVariables]);
  const systemVariables = safeInitialSystemVariables;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVariableName, setNewVariableName] = useState("");
  const [duplicateError, setDuplicateError] = useState(false);
  const [invalidNameError, setInvalidNameError] = useState(false);
  const resetErrors = () => {
    setDuplicateError(false);
    setInvalidNameError(false);
  };
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
  const filteredHiddenVariables = useMemo(
    () => hiddenVariables.filter(filterPredicate),
    [hiddenVariables, normalizedSearch]
  );
  const hasAnyResult =
    filteredSystemVariables.length > 0 ||
    filteredCustomVariables.length > 0 ||
    (enableVariableHiding && filteredHiddenVariables.length > 0);

  const handleAddVariable = () => {
    const inputValue = newVariableName;
    if (!inputValue || !isValidVariableName(inputValue)) {
      setInvalidNameError(true);
      setDuplicateError(false);
      return;
    }

    const lowerName = inputValue.toLowerCase();
    const isDuplicate = [...variables, ...systemVariables].some(
      (v) => v.name.toLowerCase() === lowerName
    );

    if (isDuplicate) {
      setDuplicateError(true);
      setInvalidNameError(false);
      return;
    }

    const newVariable: Variable = {
      name: inputValue,
    };
    setVariables((prev) => [newVariable, ...prev]);
    onAddVariable?.({ name: inputValue });
    setNewVariableName("");
    setIsAddingNew(false);
    setSearchQuery("");
    resetErrors();
    onSelect?.(newVariable);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewVariableName("");
    resetErrors();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVariableName(e.target.value);
    if (duplicateError || invalidNameError) {
      resetErrors();
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
                <div className="flex items-center justify-between px-3 text-xs font-medium text-muted-foreground">
                  <p>{t("variableSectionCustom", "Custom Variables")}</p>
                  {enableVariableHiding && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={onBulkHide}
                    >
                      {t("variableHideUnused", "Hide")}
                    </Button>
                  )}
                </div>
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

            {enableVariableHiding && (
              <HiddenVariableSection
                hiddenVariables={filteredHiddenVariables}
                onSelect={onSelect}
                onBulkRestore={onBulkRestore}
                selectedName={selectedName}
              />
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
            {(duplicateError || invalidNameError) && (
              <p className="mt-1 px-3 text-xs text-red-500">
                {duplicateError
                  ? t("variableAlreadyExists", "Variable already exists")
                  : t(
                      "variableNameInvalid",
                      "Use letters, numbers, or underscores without spaces"
                    )}
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

interface HiddenVariableSectionProps {
  hiddenVariables: Variable[];
  selectedName?: string;
  onSelect?: (variable: Variable) => void;
  onBulkRestore?: () => void;
}

const HiddenVariableSection: React.FC<HiddenVariableSectionProps> = ({
  hiddenVariables,
  onSelect,
  onBulkRestore,
  selectedName,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!hiddenVariables.length) {
    return null;
  }

  return (
    <div className="space-y-1 border-t border-border pt-2">
      <div className="flex items-center justify-between px-3 text-xs font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          <span>
            {t("variableHiddenSection", "Hidden variables")} (
            {hiddenVariables.length})
          </span>
        </button>
        {open && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={onBulkRestore}
          >
            {t("variableRestoreAll", "Restore")}
          </Button>
        )}
      </div>
      {open && (
        <div className="space-y-1">
          {hiddenVariables.map((variable) => (
            <button
              key={`hidden-${variable.name}`}
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
      )}
    </div>
  );
};
