import React from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Note } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getCategoryColor } from '../../utils/categoryColors';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: number) => void;
  onView?: (note: Note) => void;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  todo: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onView }) => {
  const { user } = useAuth();
  const isCreator = user && note.creator && note.creator.id === user.id;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 
          className="text-xl font-semibold text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onView && onView(note)}
        >
          {note.title}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[note.status]}`}>
          {note.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-3 line-clamp-3 min-h-[4.5rem]">{note.content}</p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className={`px-2 py-1 rounded border ${getCategoryColor(note.category)}`}>
            {note.category}
          </span>
          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {note.creator && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Created by:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isCreator 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {note.creator.email}
            {isCreator && ' (You)'}
          </span>
        </div>
      )}
      
      <div className="flex gap-2">
        {onEdit && isCreator && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(note)}
          >
            Edit
          </Button>
        )}
        {onDelete && isCreator && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(note.id)}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
};


