import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import Button from '../Button.jsx';
import ActionButtons from '../ActionButtons.jsx';
import Modal from '../Modal.jsx';
import './SchemaEditor.css';

const Icon = ({ name, onClick }) => {
    const icons = {
        grab: <path d="M18 8h-1V6h1v2zm-2 10h-1v-2h1v2zm-2-4h-1v-2h1v2zm-2-4h-1V6h1v2zm-2 2h-1V8h1v2zm-2 4h-1v-2h1v2zm-2 4h-1v-2h1v2zM8 6v2H7V6h1zm-2 4v2H5V8h1zm-2 4v2H3v-2h1zm0 4v2H3v-2h1zm2-14h1V4H6v2zm2 0h1V4H8v2zm2 0h1V4h-1v2zm2 0h1V4h-1v2zm2 0h1V4h-1v2zm2 0h1V4h-1v2z" />,
        edit: <path d="M14.06,9.02l.92.92L5.87,19H5v-.87l9.06-9.11M17.66,3c-.25,0-.51.1-.7.29l-1.83,1.83,3.75,3.75,1.83-1.83c.39-.39.39-1.02,0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6,3.19L3,17.25V21h3.75L17.81,9.94l-3.75-3.75Z" />,
        save: <path d="M17,3H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V7l-4-4M12,19c-1.66,0-3-1.34-3-3s1.34-3,3-3,3,1.34,3,3-1.34,3-3,3M15,9H5V5h10v4Z" />,
        cancel: <path d="M19,6.41L17.59,5,12,10.59,6.41,5,5,6.41,10.59,12,5,17.59,6.41,19,12,13.41,17.59,19,19,17.59,13.41,12,19,6.41Z" />,
        add: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    };
    if (!icons[name]) return null;

    return (
        <button type="button" onClick={onClick} className={`schema-icon-btn icon-${name}`}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
                {icons[name]}
            </svg>
        </button>
    );
};

const SchemaEditor = ({ onCancel, onSchemaUpdate, showNotification }) => {
    const [initialSchema, setInitialSchema] = useState([]);
    const [workingSchema, setWorkingSchema] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingColumnName, setEditingColumnName] = useState(null);
    const [newColumnData, setNewColumnData] = useState({ name: '', type: 'text' });
    const dragItem = useRef();
    const dragOverItem = useRef();

    const fetchSchema = async () => {
        try {
            const response = await api.get('/schema');
            setInitialSchema(response.data);
            setWorkingSchema(response.data);
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to fetch schema.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchema();
    }, []); 

    const handleLocalUpdate = (oldName, updatedColumn) => {
        if (!updatedColumn.name.trim()) {
            showNotification('Column name cannot be empty.', 'error');
            return;
        }
        if (updatedColumn.name !== oldName && workingSchema.some(col => col.name.toLowerCase() === updatedColumn.name.toLowerCase())) {
            showNotification(`A column with the name "${updatedColumn.name}" already exists.`, 'error');
            return;
        }

        setWorkingSchema(prev => prev.map(col => {
            if (col.name === oldName) {
                const newCol = { ...col, ...updatedColumn };
                const wasInitiallyPresent = initialSchema.some(ic => ic.name === oldName);
                if (updatedColumn.name !== oldName && wasInitiallyPresent) {
                    newCol._oldNameForRename = oldName;
                } else {
                    delete newCol._oldNameForRename;
                }
                return newCol;
            }
            return col;
        }));
        setEditingColumnName(null);
    };

    const handleLocalAdd = (e) => {
        e.preventDefault();
        if (!newColumnData.name.trim()) {
            showNotification('Column name cannot be empty.', 'error');
            return;
        }
        if (workingSchema.some(col => col.name.toLowerCase() === newColumnData.name.toLowerCase())) {
            showNotification('A column with this name already exists.', 'error');
            return;
        }
        setWorkingSchema(prev => [...prev, newColumnData]);
        setNewColumnData({ name: '', type: 'text' });
    };

    const handleDragStart = (e, position) => { dragItem.current = position; };
    const handleDragEnter = (e, position) => { dragOverItem.current = position; };
    const handleDrop = () => {
        const newSchema = [...workingSchema];
        const dragItemContent = newSchema[dragItem.current];
        newSchema.splice(dragItem.current, 1);
        newSchema.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setWorkingSchema(newSchema);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const initialSchemaMap = new Map(initialSchema.map(col => [col.name, col]));

            const addedColumns = [];
            const modifiedColumns = [];

            for (const initialCol of initialSchema) {
                const correspondingWorkingCol = workingSchema.find(wc =>
                    wc.name === initialCol.name || wc._oldNameForRename === initialCol.name
                );

                if (correspondingWorkingCol) {
                    const isRenamed = correspondingWorkingCol._oldNameForRename === initialCol.name;
                    const isTypeChanged = initialCol.type !== correspondingWorkingCol.type;

                    if (isRenamed || isTypeChanged) {
                        modifiedColumns.push({
                            oldName: initialCol.name,
                            newName: correspondingWorkingCol.name,
                            newType: correspondingWorkingCol.type
                        });
                    }
                }
            }

            for (const workingCol of workingSchema) {
                if (!initialSchemaMap.has(workingCol.name) && !workingCol._oldNameForRename) {
                    addedColumns.push(workingCol);
                }
            }
            
            for (const modCol of modifiedColumns) {
                await api.put(`/schema/columns/${modCol.oldName}`, {
                    name: modCol.newName,
                    type: modCol.newType
                });
            }
            for (const newCol of addedColumns) {
                await api.post('/schema/columns', newCol);
            }

            const finalOrder = workingSchema.map(c => c.name);
            const initialOrder = initialSchema.map(c => c.name);
            if (JSON.stringify(finalOrder) !== JSON.stringify(initialOrder)) {
                 await api.post('/schema/reorder', finalOrder);
            }

            showNotification('Columns updated successfully!', 'success');
            await fetchSchema();
            onSchemaUpdate();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to save changes.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const EditableColumnRow = ({ col }) => {
        const [editedName, setEditedName] = useState(col.name);
        const [editedType, setEditedType] = useState(col.type);
        return (
            <div className="schema-row editing">
                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="form-input" />
                <select value={editedType} onChange={(e) => setEditedType(e.target.value)} className="form-input">
                    <option value="text">Text</option>
                    <option value="numeric">Numeric</option>
                    <option value="date">Date</option>
                </select>
                <div className="schema-actions">
                    <Icon name="save" onClick={() => handleLocalUpdate(col.name, { name: editedName, type: editedType })} />
                    <Icon name="cancel" onClick={() => setEditingColumnName(null)} />
                </div>
            </div>
        )
    }

    return (
        <Modal title="Manage Columns" onCancel={onCancel}>
            <div className="schema-editor-body">
                <div className="schema-editor-content">
                    {loading ? <p>Loading schema...</p> : workingSchema.map((col, index) => {
                        const isFixed = col.name === 'SL No';
                        if (editingColumnName === col.name) {
                            return <EditableColumnRow col={col} key={col.name}/>
                        }
                        return (
                            <div
                                key={col.name}
                                className={`schema-row ${isFixed ? 'fixed' : ''}`}
                                draggable={!isFixed}
                                onDragStart={!isFixed ? (e) => handleDragStart(e, index) : null}
                                onDragEnter={!isFixed ? (e) => handleDragEnter(e, index) : null}
                                onDragEnd={!isFixed ? handleDrop : null}
                                onDragOver={!isFixed ? (e) => e.preventDefault() : null}
                            >
                                <div className="schema-name-container">
                                    {!isFixed && <Icon name="grab" />}
                                    <span className="schema-name">{col.name}</span>
                                </div>
                                <span className="schema-type-badge" data-type={col.type}>{col.type}</span>
                                {!isFixed && (
                                    <div className="schema-actions">
                                        <Icon name="edit" onClick={() => setEditingColumnName(col.name)} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="form-actions">
                    <form onSubmit={handleLocalAdd} className="add-column-form">
                        <input
                            type="text"
                            placeholder="New Column Name"
                            value={newColumnData.name}
                            onChange={(e) => setNewColumnData({ ...newColumnData, name: e.target.value })}
                            className="form-input"
                        />
                        <select
                            value={newColumnData.type}
                            onChange={(e) => setNewColumnData({ ...newColumnData, type: e.target.value })}
                            className="form-input"
                        >
                            <option value="text">Text</option>
                            <option value="numeric">Numeric</option>
                            <option value="date">Date</option>
                        </select>
                        <Button type="submit" variant="outline">Add</Button>
                    </form>
                    <div className="main-actions">
                        <ActionButtons onSave={handleSaveChanges} onCancel={onCancel} loading={loading} isSubmit={false} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SchemaEditor;
