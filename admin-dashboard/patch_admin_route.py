import sys

file_path = r'g:\Dhanush\New folder\Movex-Cab\admin-dashboard\src\pages\Drivers.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

route_target = """              {/* Route Assignment */}
              <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl mb-4">
                <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Metro Route Assignment</h5>
                <select 
                  className="glass-input w-full" 
                  value={editForm.assignedRoute || ''} 
                  onChange={(e) => setEditForm({...editForm, assignedRoute: e.target.value})}
                >
                  <option value="">-- No Route Assigned --</option>
                  {routes.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Assign this driver to a predefined Metro/Bus route.</p>
              </div>"""

new_route_target = """              {/* Route Assignment (Visual) */}
              <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-glass)] rounded-xl mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Metro Route Assignment</h5>
                  <button 
                    type="button"
                    onClick={() => setEditForm({...editForm, assignedRoute: ''})}
                    className="text-xs text-[var(--danger)] hover:underline"
                  >
                    Clear Assignment
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {routes.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-[var(--text-muted)] text-sm">
                      No routes available. Create them in the Route Manager.
                    </div>
                  ) : (
                    routes.map(r => (
                      <div 
                        key={r._id} 
                        onClick={() => setEditForm({...editForm, assignedRoute: r._id})}
                        className={`cursor-pointer border rounded-xl p-3 transition-all ${
                          editForm.assignedRoute === r._id 
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]' 
                            : 'border-[var(--border-glass)] bg-white/5 hover:border-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-bold text-[var(--text-primary)] text-sm truncate pr-2">{r.name}</h6>
                          {editForm.assignedRoute === r._id && (
                            <div className="bg-[var(--accent)] rounded-full p-1">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-muted)]">
                          <MapPin className="w-3 h-3 text-[var(--accent)]" />
                          <span>{r.junctions?.length || 0} Junctions</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-3">Select a visual card above to securely assign this driver to a predefined Metro route.</p>
              </div>"""

if route_target in content:
    content = content.replace(route_target, new_route_target)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied Admin Dashboard Route Assignment patch!")
