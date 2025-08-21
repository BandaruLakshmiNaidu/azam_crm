// === REUSABLE DATA TABLE COMPONENT ===
// Comprehensive table component with sorting, filtering, pagination

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableColumn, LoadingState } from '@shared/types';
import { useTable } from '@/hooks/use-table';
import { getStatusColor } from '@shared/utils';

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchableFields?: (keyof T)[];
  loading?: boolean;
  error?: string;
  onRowClick?: (item: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  actions?: {
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive';
  }[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchableFields = [],
  loading = false,
  error,
  onRowClick,
  onRowSelect,
  actions = [],
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const {
    filteredData,
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    searchQuery,
    sortConfig,
    setSearchQuery,
    setPageSize,
    setCurrentPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    handleSort,
    resetFilters,
    selectRow,
    selectAllRows,
    clearSelection,
    selectedRows,
    isRowSelected,
    isAllSelected,
  } = useTable({
    data,
    columns,
    searchableFields,
  });

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const renderCell = (item: T, column: TableColumn<T>) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }

    // Default rendering based on common patterns
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    if (column.key === 'status' && typeof value === 'string') {
      return (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      );
    }

    if (typeof value === 'number' && column.key.toString().includes('amount')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
      }).format(value);
    }

    if (value && typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString();
    }

    return value?.toString() || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-azam-blue border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Error loading data: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchableFields.join(', ')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          {searchQuery && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {totalItems} total items
          </span>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onRowSelect && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllRows();
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={column.width ? `w-[${column.width}]` : ''}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      {getSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-[50px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onRowSelect ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    onRowSelect && isRowSelected(item.id) ? 'bg-muted' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {onRowSelect && (
                    <TableCell>
                      <Checkbox
                        checked={isRowSelected(item.id)}
                        onCheckedChange={() => selectRow(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key.toString()}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                              }}
                              className={
                                action.variant === 'destructive'
                                  ? 'text-destructive focus:text-destructive'
                                  : ''
                              }
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm">Page</span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 h-8 text-center"
              />
              <span className="text-sm">of {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {onRowSelect && selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <span className="text-sm">
            {selectedRows.size} item(s) selected
          </span>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
}