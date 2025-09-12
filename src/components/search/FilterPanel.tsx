import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/Button';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterPanelProps {
  title?: string;
  filters: {
    status?: FilterOption[];
    category?: FilterOption[];
    priority?: FilterOption[];
    dateRange?: {
      start: Date | null;
      end: Date | null;
    };
  };
  selectedFilters: {
    status: string[];
    category: string[];
    priority: string[];
    dateRange?: {
      start: Date | null;
      end: Date | null;
    };
  };
  onFilterChange: (filters: any) => void;
  onClearAll: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title = "Filters",
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...selectedFilters.status, status]
      : selectedFilters.status.filter(s => s !== status);

    onFilterChange({
      ...selectedFilters,
      status: newStatus
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategory = checked
      ? [...selectedFilters.category, category]
      : selectedFilters.category.filter(c => c !== category);

    onFilterChange({
      ...selectedFilters,
      category: newCategory
    });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriority = checked
      ? [...selectedFilters.priority, priority]
      : selectedFilters.priority.filter(p => p !== priority);

    onFilterChange({
      ...selectedFilters,
      priority: newPriority
    });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    onFilterChange({
      ...selectedFilters,
      dateRange: {
        ...selectedFilters.dateRange,
        [type]: date
      }
    });
  };

  const hasActiveFilters =
    selectedFilters.status.length > 0 ||
    selectedFilters.category.length > 0 ||
    selectedFilters.priority.length > 0 ||
    selectedFilters.dateRange?.start ||
    selectedFilters.dateRange?.end;

  return (
    <div className={`bg-white border border-primary-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {selectedFilters.status.length + selectedFilters.category.length + selectedFilters.priority.length +
                 (selectedFilters.dateRange?.start || selectedFilters.dateRange?.end ? 1 : 0)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                onClick={onClearAll}
                variant="outline"
                size="sm"
                className="text-xs h-7"
              >
                Clear All
              </Button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <Filter className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={selectedFilters.dateRange?.start ? selectedFilters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={selectedFilters.dateRange?.end ? selectedFilters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          {filters.status && filters.status.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="space-y-2">
                {filters.status.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.status.includes(option.value)}
                      onChange={(e) => handleStatusChange(option.value, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500">({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {filters.category && filters.category.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="space-y-2">
                {filters.category.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.category.includes(option.value)}
                      onChange={(e) => handleCategoryChange(option.value, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500">({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Priority Filter */}
          {filters.priority && filters.priority.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority
              </label>
              <div className="space-y-2">
                {filters.priority.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.priority.includes(option.value)}
                      onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500">({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4 border-t border-primary-100">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  onFilterChange({
                    ...selectedFilters,
                    dateRange: { start: weekAgo, end: today }
                  });
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Last 7 days
              </Button>
              <Button
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  onFilterChange({
                    ...selectedFilters,
                    dateRange: { start: monthAgo, end: today }
                  });
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Last 30 days
              </Button>
              <Button
                onClick={() => {
                  const today = new Date();
                  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                  onFilterChange({
                    ...selectedFilters,
                    dateRange: { start: yearAgo, end: today }
                  });
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Last year
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
