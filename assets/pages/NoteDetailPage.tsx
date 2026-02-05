import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Note } from '../services/api';
import { useNoteQuery } from '../hooks/useNotesQuery';
import { getCategoryColor } from '../utils/categoryColors';

interface NoteDetailPageProps {
  noteId: number;
  onBack: () => void;
  onEdit?: (note: Note) => void;
  onDelete?: (id: number) => void;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ noteId, onBack, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { data: note, isLoading, error: queryError } = useNoteQuery(noteId);
  
  const error = queryError ? ((queryError as any).response?.data?.error || 'Failed to load note') : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error || 'Note not found'}</p>
              <Button onClick={onBack}>Back to Notes</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const isCreator = user && note.creator && note.creator.id === user.id;
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    todo: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to Notes
          </Button>
        </div>

        <Card>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold text-gray-900">{note.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[note.status] || statusColors.new}`}>
                {note.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded border ${getCategoryColor(note.category)}`}>
                {note.category}
              </span>
              <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
            </div>

            {note.creator && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Created by:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isCreator 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {note.creator.email}
                  {isCreator && ' (You)'}
                </span>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Content</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>

            {isCreator && (onEdit || onDelete) && (
              <div className="border-t pt-6 flex gap-3 justify-end">
                {onEdit && (
                  <Button
                    variant="outline"
                    onClick={() => onEdit(note)}
                  >
                    Edit Note
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this note?')) {
                        try {
                          await onDelete(note.id);
                          onBack();
                        } catch (error: any) {
                          console.error('Failed to delete note:', error);
                          alert(error.response?.data?.error || 'Failed to delete note');
                        }
                      }
                    }}
                  >
                    Delete Note
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

