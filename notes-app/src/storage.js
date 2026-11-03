const NOTES_KEY = "notes";

function readNotes(storage) {
  const serializedNotes = storage.getItem(NOTES_KEY);

  if (!serializedNotes) {
    return [];
  }

  const notes = JSON.parse(serializedNotes);
  return Array.isArray(notes) ? notes : [];
}

function writeNotes(storage, notes) {
  storage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function createStore(storage = window.localStorage) {
  function list() {
    return readNotes(storage);
  }

  function save(note) {
    const notes = list();
    const now = new Date().toISOString();
    const noteToSave = {
      ...note,
      id: note.id || crypto.randomUUID(),
      updatedAt: now,
    };
    const existingIndex = notes.findIndex(({ id }) => id === noteToSave.id);

    if (existingIndex === -1) {
      notes.push(noteToSave);
    } else {
      notes[existingIndex] = {
        ...notes[existingIndex],
        ...noteToSave,
      };
    }

    writeNotes(storage, notes);
    return notes[existingIndex === -1 ? notes.length - 1 : existingIndex];
  }

  function remove(id) {
    const notes = list().filter((note) => note.id !== id);
    writeNotes(storage, notes);
  }

  function search(text) {
    const query = text.trim().toLowerCase();

    if (!query) {
      return list();
    }

    return list().filter((note) =>
      [note.title, note.body].some((value) =>
        String(value ?? "").toLowerCase().includes(query),
      ),
    );
  }

  return { list, save, remove, search };
}
