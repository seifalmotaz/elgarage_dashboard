'use client';

import React, { useState } from 'react';
import Modal from '../../../ui/Modal';
import { useCarSpecs } from '../../../../hooks/useCarSpecs';
import { SpecType, CreateSpecTypeDto, CreateSpecOptionDto } from '../../../../lib/api-client';
import SpecTypeList from './SpecTypeList';
import SpecOptionManager from './SpecOptionManager';
import AddSpecTypeDialog from './AddSpecTypeDialog';
import AddSpecOptionDialog from './AddSpecOptionDialog';
import toast from 'react-hot-toast';

interface SpecOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSpecTypesChange?: () => void;
}

export default function SpecOptionsDialog({ 
  isOpen, 
  onClose, 
  onSpecTypesChange 
}: SpecOptionsDialogProps) {
  const {
    specTypes,
    loading,
    refetch,
    createSpecType,
    updateSpecType,
    deleteSpecType,
    reorderSpecTypes,
    createSpecOption,
    updateSpecOption,
    deleteSpecOption,
    reorderSpecOptions,
  } = useCarSpecs();

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [showAddTypeDialog, setShowAddTypeDialog] = useState(false);
  const [showAddOptionDialog, setShowAddOptionDialog] = useState(false);
  const [editingType, setEditingType] = useState<SpecType | null>(null);
  const [editingOption, setEditingOption] = useState<{ id: string; label: string; value: string } | null>(null);

  // Get selected spec type
  const selectedType = specTypes.find(type => type.id === selectedTypeId) || null;

  // Handle type selection
  const handleTypeSelect = (id: string) => {
    setSelectedTypeId(id === selectedTypeId ? null : id);
    setEditingOption(null);
  };

  // Handle type deletion with confirmation
  const handleTypeDelete = async (id: string) => {
    const type = specTypes.find(t => t.id === id);
    if (!type) return;

    const confirmMessage = type.options.length > 0
      ? `سيتم حذف نوع المواصفة "${type.name}" وجميع خياراته (${type.options.length}). هل أنت متأكد؟`
      : `سيتم حذف نوع المواصفة "${type.name}". هل أنت متأكد؟`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const success = await deleteSpecType(id);
    if (success && selectedTypeId === id) {
      setSelectedTypeId(null);
    }
    if (onSpecTypesChange) {
      onSpecTypesChange();
    }
  };

  // Handle type reordering
  const handleTypeReorder = async (typeIds: string[]) => {
    await reorderSpecTypes(typeIds);
    if (onSpecTypesChange) {
      onSpecTypesChange();
    }
  };

  // Handle type save (create or update)
  const handleTypeSave = async (data: CreateSpecTypeDto) => {
    if (editingType) {
      // Omit `key` for update to comply with backend validation
      const { key, ...updateData } = data;
      await updateSpecType(editingType.id, updateData);
    } else {
      await createSpecType(data);
    }
    refetch();
    if (onSpecTypesChange) {
      onSpecTypesChange();
    }
  };

  // Handle option deletion
  const handleOptionDelete = async (optionId: string) => {
    if (!selectedTypeId) return;

    const option = selectedType?.options.find(o => o.id === optionId);
    if (!option) return;

    if (!window.confirm(`سيتم حذف الخيار "${option.label}". هل أنت متأكد؟`)) {
      return;
    }

    await deleteSpecOption(selectedTypeId, optionId);
  };

  // Handle option reordering
  const handleOptionReorder = async (optionIds: string[]) => {
    if (!selectedTypeId) return;
    await reorderSpecOptions(selectedTypeId, optionIds);
  };

  // Handle option save (create or update)
  const handleOptionSave = async (data: CreateSpecOptionDto) => {
    if (!selectedTypeId) return;

    if (editingOption) {
      await updateSpecOption(selectedTypeId, editingOption.id, data);
    } else {
      await createSpecOption(selectedTypeId, data);
    }
    refetch();
  };

  // Handle option edit - open edit dialog
  const handleOptionEdit = (optionId: string) => {
    const option = selectedType?.options.find(o => o.id === optionId);
    if (option) {
      setEditingOption({ id: option.id, label: option.label, value: option.value });
      setShowAddOptionDialog(true);
    }
  };

  const footer = (
    <div className="flex items-center justify-end">
      <button
        onClick={onClose}
        className="px-6 py-2.5 text-[14px] font-medium text-white bg-[#002ec1] rounded-full hover:bg-blue-700 transition-colors"
      >
        اغلاق
      </button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="إدارة المواصفات"
        maxWidth="1000px"
        footer={footer}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16" dir="rtl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin"/>
              <span className="text-[14px] text-[#8286ab]">جاري التحميل...</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-8 h-[520px]" dir="rtl">
            {/* Right Column - Spec Type List (35%) */}
            <div className="w-[38%] border-l border-[#f2f2f2] pl-6 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <SpecTypeList
                  specTypes={specTypes}
                  selectedId={selectedTypeId}
                  onSelect={handleTypeSelect}
                  onAdd={() => {
                    setEditingType(null);
                    setShowAddTypeDialog(true);
                  }}
                  onEdit={(type) => {
                    setEditingType(type);
                    setShowAddTypeDialog(true);
                  }}
                  onReorder={handleTypeReorder}
                  onDelete={handleTypeDelete}
                />
              </div>
            </div>

            {/* Left Column - Option Manager (62%) */}
            <div className="w-[62%] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <SpecOptionManager
                  specType={selectedType}
                  onAddOption={() => {
                    if (!selectedType) {
                      toast.error('الرجاء اختيار نوع مواصفة أولاً');
                      return;
                    }
                    setEditingOption(null);
                    setShowAddOptionDialog(true);
                  }}
                  onEditOption={handleOptionEdit}
                  onDeleteOption={handleOptionDelete}
                  onReorderOptions={handleOptionReorder}
                  onEditSpecType={(type) => {
                    setEditingType(type);
                    setShowAddTypeDialog(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Spec Type Dialog */}
      <AddSpecTypeDialog
        isOpen={showAddTypeDialog}
        onClose={() => {
          setShowAddTypeDialog(false);
          setEditingType(null);
        }}
        editingType={editingType}
        onSave={handleTypeSave}
      />

      {/* Add/Edit Spec Option Dialog */}
      <AddSpecOptionDialog
        isOpen={showAddOptionDialog}
        onClose={() => {
          setShowAddOptionDialog(false);
          setEditingOption(null);
        }}
        specTypeId={selectedTypeId || ''}
        specTypeName={selectedType?.name || ''}
        editingOption={editingOption}
        onSave={handleOptionSave}
      />
    </>
  );
}