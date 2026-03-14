import { useState } from 'react';
import { type Note, type Category, noteService } from '../services/api';
import { Button } from './Button';

interface NoteCardProps {
  note: Note;
  allCategories: Category[];
  onArchive: (id: number, status: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: any) => void; // Cambiado a any para soportar categoryIds
  onCategoryCreated: () => void;
}

export const NoteCard = ({ 
  note, 
  allCategories, 
  onArchive, 
  onDelete, 
  onUpdate, 
  onCategoryCreated 
}: NoteCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: note.title, content: note.content });
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>(note.categories?.map(c => c.id) || []);
  const [newCatName, setNewCatName] = useState('');

  const handleSave = () => {
    onUpdate(note.id, { 
      ...editedNote, 
      categoryIds: selectedCatIds,
      isArchived: false 
    });
    setIsModalOpen(false);
  };

  const toggleCategory = (id: number) => {
    setSelectedCatIds(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const response = await noteService.createCategory(newCatName);
      const newCat = response.data;
      setSelectedCatIds(prev => [...prev, newCat.id]);
      setNewCatName('');
      onCategoryCreated();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <>
      {/* TARJETA VISUAL */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col w-[260px] h-[380px] transition-all hover:shadow-2xl group overflow-hidden">
        <div className="flex justify-end mb-3">
          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full ring-1 ring-indigo-100">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden">
          <h3 className="text-xl font-black text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {note.title}
          </h3>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {note.categories?.map(cat => (
              <span key={cat.id} className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                {cat.name}
              </span>
            ))}
          </div>

          <p className="text-slate-500 text-sm leading-relaxed overflow-y-auto pr-1">
            {note.content}
          </p>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
          <Button variant="warning" onClick={() => setIsModalOpen(true)} className="h-12 w-12 flex-1 rounded-2xl p-0">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">✏️</span>
              <span className="font-bold uppercase tracking-tighter text-[9px]">Edit</span>
            </div>
          </Button>
          
          <Button variant="warning" onClick={() => onArchive(note.id, note.isArchived)} className="h-12 w-12 flex-1 rounded-2xl p-0">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">{note.isArchived ? "🚀" : "📂"}</span>
              <span className="font-bold uppercase tracking-tighter text-[9px]">{note.isArchived ? "Activate" : "Archive"}</span>
            </div>
          </Button>

          <Button variant="danger" onClick={() => onDelete(note.id)} className="h-12 w-12 flex-1 rounded-2xl p-0">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">🗑️</span>
              <span className="font-bold uppercase tracking-tighter text-[9px]">Delete</span>
            </div>
          </Button>
        </div>
      </div>

      {/* MODAL DE EDICIÓN (SCREEN GRANDE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center px-10 py-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-indigo-600 italic">EDIT NOTE</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-2"
              >✕</button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-grow overflow-y-auto px-10 py-8 flex flex-col gap-6 custom-scrollbar">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                <input 
                  className="text-3xl font-black border-none focus:ring-0 p-0 text-slate-800 placeholder:text-slate-200"
                  value={editedNote.title}
                  onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                  placeholder="Note title..."
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedCatIds.includes(cat.id) 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm mt-1">
                  <input 
                    placeholder="Create new tag..." 
                    className="text-xs border border-slate-200 rounded-xl px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                  />
                  <button onClick={handleCreateCategory} className="text-indigo-600 font-bold text-2xl px-2">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-grow">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content</label>
                <textarea 
                  className="text-lg text-slate-600 flex-grow border-none focus:ring-0 p-0 resize-none placeholder:text-slate-200"
                  value={editedNote.content}
                  onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                  placeholder="Start writing..."
                />
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-10 py-8 border-t border-slate-100 flex gap-4">
              <Button onClick={handleSave} className="flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-xl">
                Save Changes ✨
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest">
                Discard
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};