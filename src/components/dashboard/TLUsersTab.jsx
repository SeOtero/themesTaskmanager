import React from 'react';

const TLUsersTab = ({ 
    usersList, 
    editingUserId, 
    setEditingUserId, 
    editForm, 
    setEditForm, 
    setPointsToSend, 
    handleGivePoints, 
    saveUserChanges, 
    startEditingUser 
}) => {
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-black/30 text-slate-400 text-[10px] uppercase font-bold">
                        <tr className="border-b border-white/5">
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Rol Actual</th>
                            <th className="p-4">Equipo</th>
                            <th className="p-4 text-right">Gestión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {usersList.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.02]">
                                <td className="p-4">
                                    <div className="font-bold text-white">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                {editingUserId === user.id ? (
                                    <>
                                        <td className="p-4">
                                            <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500">
                                                <option value="agent">Agente</option>
                                                <option value="team_leader">TL</option>
                                                <option value="admin">Admin</option>
                                                <option value="tester">Tester</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <select value={editForm.team} onChange={e => setEditForm({ ...editForm, team: e.target.value })} className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500">
                                                <option value="default">Default</option>
                                                <option value="team1">Team 1</option>
                                                <option value="team2">Team 2</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
                                                <input type="number" placeholder="Bonus" className="w-16 bg-transparent text-xs text-yellow-400 text-center outline-none" onChange={(e) => setPointsToSend(e.target.value)} />
                                                <button onClick={() => handleGivePoints(user.id)} className="bg-yellow-600 text-black px-2 py-1 rounded text-[10px] font-bold hover:bg-yellow-500">➕ ENVIAR</button>
                                            </div>
                                            <button onClick={() => saveUserChanges(user.id)} className="text-green-400 text-xs font-bold hover:underline ml-2">GUARDAR</button>
                                            <button onClick={() => setEditingUserId(null)} className="text-red-400 text-xs font-bold hover:underline ml-2">CANCELAR</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${user.role === 'admin' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : user.role === 'team_leader' ? 'bg-blue-900/30 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-slate-400">{user.team}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => startEditingUser(user)} className="text-indigo-400 text-xs font-bold hover:text-white transition-colors">EDITAR ✏️</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TLUsersTab;