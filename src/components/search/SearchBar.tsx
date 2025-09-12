import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilter?: (filters: SearchFilters) => void;
  showFilters?: boolean;
  debounceMs?: number;
  className?: string;
}

export interface SearchFilters {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  status?: string[];
  category?: string[];
  priority?: string[];
  customFilters?: Record<string, any>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  onFilter,
  showFilters = false,
  debounceMs = 300,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const clearFilters = () => {
    setFilters({});
    onFilter?.({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== null && v !== '');
    }
    return value !== null && value !== '';
  });

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`p-2 border-l border-primary-200 focus:outline-none ${
                showFilterPanel ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600'
              } ${hasActiveFilters ? 'text-primary-600' : ''}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const start = e.target.value ? new Date(e.target.value) : null;
                      handleFilterChange({
                        ...filters,
                        dateRange: {
                          start,
                          end: filters.dateRange?.end || null
                        }
                      });
                    }}
                    className="text-xs px-2 py-1 border border-primary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const end = e.target.value ? new Date(e.target.value) : null;
                      handleFilterChange({
                        ...filters,
                        dateRange: {
                          start: filters.dateRange?.start || null,
                          end
                        }
                      });
                    }}
                    className="text-xs px-2 py-1 border border-primary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              {filters.status !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(filters.status as string[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          const newStatus = (filters.status as string[]).filter(s => s !== status);
                          handleFilterChange({ ...filters, status: newStatus });
                        }}
                        className="inline-flex items-center px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                      >
                        {status}
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-primary-100">
                <Button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    handleFilterChange({
                      ...filters,
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
                    handleFilterChange({
                      ...filters,
                      dateRange: { start: monthAgo, end: today }
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Last 30 days
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
