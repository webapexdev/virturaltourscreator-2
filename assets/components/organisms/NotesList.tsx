import React, { useState, useEffect, useCallback } from 'react';
import { NoteCard } from '../molecules/NoteCard';
import { Input } from '../atoms/Input';
import { Dropdown } from '../atoms/Dropdown';
import { Button } from '../atoms/Button';
import { Note } from '../../services/api';
import { useNotesQuery } from '../../hooks/useNotesQuery';

interface NotesListProps {
  notes: Note[];
  categories: string[];
  onEditNote: (note: Note) => void;
  onViewNote?: (note: Note) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const NotesList: React.FC<NotesListProps> = ({ 
  notes: initialNotes, 
  categories: initialCategories,
  onEditNote, 
  onViewNote,
  onDelete,
  onRefresh,
  isLoading: externalIsLoading = false
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Build filters object
  const filters = {
    ...(debouncedSearch && debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(statusFilter && statusFilter.trim() ? { status: statusFilter.trim() } : {}),
    ...(categoryFilter && categoryFilter.trim() ? { category: categoryFilter.trim() } : {}),
  };

  // Use React Query for filtered notes
  const hasFilters = Object.keys(filters).length > 0;
  const { data: filteredData, isLoading: filteredIsLoading } = useNotesQuery(
    hasFilters ? filters : undefined,
    hasFilters // Only fetch when filters are applied
  );

  // Use filtered data if filters are applied, otherwise use initial notes
  const notes = hasFilters ? (filteredData?.notes || []) : initialNotes;
  const categories = initialCategories;
  
  // Combine loading states: show loading if external refetch is happening OR filtered query is loading
  const isLoading = externalIsLoading || (hasFilters && filteredIsLoading);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      if (onDelete) {
        await onDelete(id);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note');
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'todo', label: 'Todo' },
    { value: 'done', label: 'Done' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat })),
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <Dropdown
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusOptions}
            placeholder="All Statuses"
          />
          
          <Dropdown
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No notes found. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note: Note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onDelete={handleDelete}
              onView={onViewNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};


