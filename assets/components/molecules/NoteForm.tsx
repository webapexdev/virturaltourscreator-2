import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Dropdown } from '../atoms/Dropdown';
import { Button } from '../atoms/Button';
import { Note, NoteCreateData, NoteUpdateData } from '../../services/api';

interface NoteFormProps {
  note?: Note;
  categories: string[];
  onSubmit: (data: NoteCreateData | NoteUpdateData) => Promise<void>;
  onCancel?: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({ note, categories, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState(note?.category || '');
  const [status, setStatus] = useState<'new' | 'todo' | 'done'>(note?.status || 'new');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      // Ensure category is set properly - use the exact value from note
      const noteCategory = note.category || '';
      setCategory(noteCategory);
      setStatus(note.status || 'new');
    } else {
      // Reset form when note is cleared
      setTitle('');
      setContent('');
      setCategory('');
      setStatus('new');
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Frontend validation
    const validationErrors: Record<string, string> = {};

    if (!title.trim()) {
      validationErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      validationErrors.content = 'Content is required';
    }

    if (!category.trim()) {
      validationErrors.category = 'Category is required';
    } else if (categories.length > 0 && !categories.includes(category.trim())) {
      validationErrors.category = 'Please select a valid category';
    }

    // If there are validation errors, set them and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const data: NoteCreateData | NoteUpdateData = {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        status,
      };

      await onSubmit(data);
    } catch (error: any) {
      // Handle validation errors with field-specific messages
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const newErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: string) => {
          const [field] = detail.split(':');
          newErrors[field] = detail;
        });
        setErrors(newErrors);
      } else {
        // Handle general errors (network, server, etc.)
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred while saving the note';
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map(cat => ({ value: cat, label: cat })),
  ];

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'todo', label: 'Todo' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />

      <Textarea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        error={errors.content}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Dropdown
          label="Category"
          value={category}
          onChange={(value) => setCategory(value)}
          options={categoryOptions}
          placeholder="Select a category"
          error={errors.category}
        />

        <Dropdown
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as 'new' | 'todo' | 'done')}
          options={statusOptions}
          error={errors.status}
        />
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {note ? 'Update' : 'Create'} Note
        </Button>
      </div>
    </form>
  );
};


