import Dexie from 'dexie';

export const db = new Dexie('VeetrackDB');

db.version(1).stores({
  notes: '++id, title, content, created_at, updated_at',
  todos: '++id, title, deadline, is_completed, created_at',
  tasks: '++id, title, frequency, current_streak, longest_streak, last_completed_at',
  finance: '++id, name, amount, date, type, created_at',
  chat_history: '++id, role, message, created_at',
  settings: 'key, value'
});
