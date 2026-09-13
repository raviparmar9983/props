"use client";

import { BottomSheet } from "./bottom-sheet";
import { FilterPanel, type FilterPanelProps } from "./filter-panel";

interface FilterSheetProps extends FilterPanelProps {
  open: boolean;
  onClose: () => void;
}

export function FilterSheet({ open, onClose, ...panelProps }: FilterSheetProps) {
  function handleApply() {
    panelProps.onApply();
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filter Properties"
      subtitle="Narrow down your search"
    >
      <FilterPanel {...panelProps} onApply={handleApply} />
    </BottomSheet>
  );
}
