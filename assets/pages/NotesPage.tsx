import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotesList } from '../components/organisms/NotesList';
import { NoteForm } from '../components/molecules/NoteForm';
import { NoteDetailPage } from './NoteDetailPage';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Note } from '../services/api';
import { useNotesQuery, useNoteQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } from '../hooks/useNotesQuery';

const NotesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: notesData, refetch, isFetching } = useNotesQuery(undefined, true);
  const notes = notesData?.notes || [];
  const categories = notesData?.categories || [];

  const createNoteMutation = useCreateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();

  // Combine loading states: show loading if query is fetching OR mutations are pending
  const isRefetching = isFetching || createNoteMutation.isPending || deleteNoteMutation.isPending;

  const handleCreateNote = async (data: any) => {
    try {
      await createNoteMutation.mutateAsync(data);
      navigate('/notes', { replace: true });
    } catch (error: any) {
      // Re-throw error so NoteForm can catch and display it
      throw error;
    }
  };

  const handleEditNote = (note: Note) => {
    navigate(`/notes/${note.id}/edit`, { replace: true });
  };

  const handleViewNote = (note: Note) => {
    navigate(`/notes/${note.id}`, { replace: true });
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNoteMutation.mutateAsync(id);
  };

  const handleCreateClick = () => {
    navigate('/notes/new', { replace: true });
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">All Notes</h2>
        <Button onClick={handleCreateClick}>
          + Create Note
        </Button>
      </div>
      <NotesList 
        notes={notes}
        categories={categories}
        onEditNote={handleEditNote} 
        onViewNote={handleViewNote}
        onDelete={handleDeleteNote}
        onRefresh={() => refetch()}
        isLoading={isRefetching}
      />
    </>
  );
};

const NoteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: notesData } = useNotesQuery(undefined, false);
  const categories = notesData?.categories || [];
  const createNoteMutation = useCreateNoteMutation();

  const handleCreateNote = async (data: any) => {
    try {
      await createNoteMutation.mutateAsync(data);
      navigate('/notes', { replace: true });
    } catch (error: any) {
      // Re-throw error so NoteForm can catch and display it
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/notes', { replace: true });
  };

  return (
    <Card title="Create New Note">
      <NoteForm
        categories={categories}
        onSubmit={handleCreateNote}
        onCancel={handleCancel}
      />
    </Card>
  );
};

const NoteEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const noteId = id ? parseInt(id, 10) : 0;
  const { data: notesData } = useNotesQuery(undefined, false);
  const notes = notesData?.notes || [];
  const categories = notesData?.categories || [];
  const { data: editingNoteData } = useNoteQuery(noteId, !!noteId);
  const updateNoteMutation = useUpdateNoteMutation();

  const note = notes.find((n: Note) => n.id === noteId) || editingNoteData;

  const handleUpdateNote = async (data: any) => {
    if (note) {
      try {
        await updateNoteMutation.mutateAsync({ id: note.id, data });
        navigate('/notes', { replace: true });
      } catch (error: any) {
        // Re-throw error so NoteForm can handle it
        throw error;
      }
    }
  };

  const handleCancel = () => {
    navigate('/notes', { replace: true });
  };

  if (!note) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading note...</p>
      </div>
    );
  }

  return (
    <Card title="Edit Note">
      <NoteForm
        note={note}
        categories={categories}
        onSubmit={handleUpdateNote}
        onCancel={handleCancel}
      />
    </Card>
  );
};

const NoteDetailViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const noteId = id ? parseInt(id, 10) : 0;
  const { data: notesData } = useNotesQuery(undefined, false);
  const notes = notesData?.notes || [];
  const deleteNoteMutation = useDeleteNoteMutation();

  const handleEditNote = (note: Note) => {
    navigate(`/notes/${note.id}/edit`, { replace: true });
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNoteMutation.mutateAsync(id);
    navigate('/notes', { replace: true });
  };

  const handleBack = () => {
    navigate('/notes', { replace: true });
  };

  return (
    <NoteDetailPage 
      noteId={noteId} 
      onBack={handleBack}
      onEdit={handleEditNote}
      onDelete={handleDeleteNote}
    />
  );
};

export const NotesPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<NotesListPage />} />
          <Route path="/new" element={<NoteCreatePage />} />
          <Route path="/:id" element={<NoteDetailViewPage />} />
          <Route path="/:id/edit" element={<NoteEditPage />} />
        </Routes>
      </main>
    </div>
  );
};


