import re

with open('src/components/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'IntegratedMonthlyCalendar' not in content:
    import_marker = "import { TaskManager } from './TaskManager';"
    import_repl = "import { TaskManager } from './TaskManager';\nimport { IntegratedMonthlyCalendar } from './IntegratedMonthlyCalendar';"
    assert import_marker in content, 'import_marker not found'
    content = content.replace(import_marker, import_repl, 1)

# 2. Update eventoViewMode state
content = content.replace(
    "const [eventoViewMode, setEventoViewMode] = useState<'cards' | 'table'>('cards');",
    "const [eventoViewMode, setEventoViewMode] = useState<'cards' | 'table' | 'calendar'>('calendar');",
    1
)

# 3. Update view mode buttons in Eventos tab
old_buttons = """                    {/* View Mode Switcher (Cards vs Tabela) */}
                    <div className="flex items-center bg-[#fdfaf2] p-1 rounded-lg border border-[#d2c595]/80 shadow-2xs shrink-0 w-full md:w-auto justify-center">
                      <button
                        type="button"
                        onClick={() => setEventoViewMode('cards')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                          eventoViewMode === 'cards'
                            ? 'bg-[#8d1811] text-white shadow-xs'
                            : 'text-[#543d03] hover:bg-[#dfd1a1]/30'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventoViewMode('table')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                          eventoViewMode === 'table'
                            ? 'bg-[#8d1811] text-white shadow-xs'
                            : 'text-[#543d03] hover:bg-[#dfd1a1]/30'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        Tabela
                      </button>
                    </div>"""

new_buttons = """                    {/* View Mode Switcher (Calendário vs Cards vs Tabela) */}
                    <div className="flex items-center bg-[#fdfaf2] p-1 rounded-lg border border-[#d2c595]/80 shadow-2xs shrink-0 w-full md:w-auto justify-center flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setEventoViewMode('calendar')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                          eventoViewMode === 'calendar'
                            ? 'bg-[#8d1811] text-white shadow-xs'
                            : 'text-[#543d03] hover:bg-[#dfd1a1]/30'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Calendário Mensal
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventoViewMode('cards')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                          eventoViewMode === 'cards'
                            ? 'bg-[#8d1811] text-white shadow-xs'
                            : 'text-[#543d03] hover:bg-[#dfd1a1]/30'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventoViewMode('table')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                          eventoViewMode === 'table'
                            ? 'bg-[#8d1811] text-white shadow-xs'
                            : 'text-[#543d03] hover:bg-[#dfd1a1]/30'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        Tabela
                      </button>
                    </div>"""

assert old_buttons in content, 'old_buttons not found in content'
content = content.replace(old_buttons, new_buttons, 1)

# 4. Update content render in Eventos tab
old_render = """                {/* Empty State */}
                {filteredEventos.length === 0 ? ("""

new_render = """                {eventoViewMode === 'calendar' ? (
                  <IntegratedMonthlyCalendar
                    eventos={eventos}
                    reunioes={reunioes}
                    turmas={turmas}
                    tasks={adminTasks}
                    onAddEvento={(initialDate) => {
                      setEditingEvento(null);
                      setNewEvtTurmaId('');
                      setNewEvtTitle('');
                      setNewEvtDate(initialDate || '');
                      setNewEvtTime('19:00');
                      setNewEvtVenue('');
                      setNewEvtDescription('');
                      setShowEventoModal(true);
                    }}
                    onAddReuniao={(initialDate) => {
                      setActiveTab('reunioes');
                      if (initialDate) setMeetingDate(initialDate);
                    }}
                    onEditEvento={handleStartEditEvento}
                    onDeleteEvento={handleDeleteEvento}
                    onDeleteReuniao={handleDeleteMeeting}
                    onPrintAttendance={(evt) => setPrintingAttendanceEvent(evt)}
                    onPrintExecutionSheet={(evt) => setPrintingEvent(evt)}
                  />
                ) : filteredEventos.length === 0 ? ("""

assert old_render in content, 'old_render not found in content'
content = content.replace(old_render, new_render, 1)

with open('src/components/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('AdminPanel.tsx successfully updated!')
