import { useEffect, useState } from 'react';
import { noteService, type Note, type Category } from './services/api';
import { Button } from './components/Button';
import { NoteCard } from './components/NoteCard';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const fetchNotes = async () => {
    try {
      const response = await noteService.getNotes(viewArchived);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await noteService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [viewArchived]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;
    
    await noteService.createNote({
      ...newNote,
      categoryIds: selectedCategoryIds
    });
    
    setNewNote({ title: '', content: '' });
    setSelectedCategoryIds([]);
    fetchNotes();
  };

  const toggleCategorySelection = (id: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  const handleCreateInlineCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const response = await noteService.createCategory(newCatName);
      const newCat = response.data;
      setSelectedCategoryIds(prev => [...prev, newCat.id]);
      setNewCatName('');
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const filteredNotes = filterCategoryId 
    ? notes.filter(note => note.categories.some(cat => cat.id === filterCategoryId))
    : notes;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-2xl font-black tracking-tighter text-indigo-600 italic">
            NOTES
          </h1>
          
          <div className="flex items-center gap-3">
            <select 
              className="text-xs font-bold bg-slate-100 border-none rounded-full px-4 py-2 text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <Button variant="secondary" onClick={() => setViewArchived(!viewArchived)} className="text-xs whitespace-nowrap">
              {viewArchived ? "🚀 Active notes" : "📂 Archived notes"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        {!viewArchived && (
          <section className="mb-16 flex justify-center">
            {/* Formulario más ancho: max-w-4xl */}
            <form onSubmit={handleCreate} className="w-full max-w-4xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] rounded-[3rem] shadow-2xl shadow-indigo-200">
              <div className="bg-white p-10 rounded-[2.9rem] flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Got an idea? 💡"
                  className="text-2xl font-bold border-none focus:ring-0 placeholder:text-slate-300 w-full text-slate-800"
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                />
                <textarea 
                  placeholder="Write it down..."
                  className="text-slate-500 border-none focus:ring-0 placeholder:text-slate-300 w-full resize-none min-h-[120px] text-lg"
                  value={newNote.content}
                  onChange={e => setNewNote({...newNote, content: e.target.value})}
                />

                <div className="py-5 border-t border-slate-50 mt-2">
                  <p className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Select Categories</p>
                  
                  {/* Tags más grandes y con más estilo */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`px-5 py-2 rounded-full text-xs font-black transition-all transform hover:scale-105 ${
                          selectedCategoryIds.includes(cat.id)
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                          : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 max-w-sm">
                    <input 
                      type="text"
                      placeholder="New category name..."
                      className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 flex-1 outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 transition-all"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateInlineCategory())}
                    />
                    <button 
                      type="button"
                      onClick={handleCreateInlineCategory}
                      className="text-indigo-600 font-bold text-2xl px-2 hover:scale-125 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={!newNote.title.trim()} className="px-12 py-4 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-xl shadow-indigo-100 rounded-2xl font-black uppercase tracking-widest">
                    Save note ✨
                  </Button>
                </div>
              </div>
            </form>
          </section>
        )}

        <main className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note}
                allCategories={categories}
                onArchive={(id, status) => noteService.updateNote(id, { isArchived: !status }).then(fetchNotes)}
                onDelete={(id) => window.confirm("Delete this note?") && noteService.deleteNote(id).then(fetchNotes)}
                onUpdate={(id, data) => noteService.updateNote(id, data).then(fetchNotes)}
                onCategoryCreated={fetchCategories}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-6xl mb-6 opacity-20">🌵</div>
              <p className="text-slate-300 font-bold text-xl italic tracking-tight">Nothing here yet... 🍕</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;