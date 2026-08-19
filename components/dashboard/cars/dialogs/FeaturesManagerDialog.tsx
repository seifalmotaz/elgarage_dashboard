'use client';

import React, { useState } from 'react';
import Modal from '../../../ui/Modal';
import { useCarFeatures } from '../../../../hooks/useCarFeatures';
import { FeatureSection, FeatureItem, CreateFeatureSectionDto, CreateFeatureItemDto } from '../../../../lib/api-client';
import FeatureSectionsList from './FeatureSectionsList';
import FeatureItemsManager from './FeatureItemsManager';
import AddFeatureSectionDialog from './AddFeatureSectionDialog';
import AddFeatureItemDialog from './AddFeatureItemDialog';
import toast from 'react-hot-toast';

interface FeaturesManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFeaturesChange?: () => void;
}

export default function FeaturesManagerDialog({
  isOpen,
  onClose,
  onFeaturesChange,
}: FeaturesManagerDialogProps) {
  const {
    featureSections,
    loading,
    refetch,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  } = useCarFeatures();

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<FeatureSection | null>(null);
  const [editingItem, setEditingItem] = useState<FeatureItem | null>(null);

  // Get selected feature section
  const selectedSection = featureSections.find(section => section.id === selectedSectionId) || null;

  // Handle section selection
  const handleSectionSelect = (id: string) => {
    setSelectedSectionId(id === selectedSectionId ? null : id);
    setEditingItem(null);
  };

  // Handle section deletion with confirmation
  const handleSectionDelete = async (id: string) => {
    const section = featureSections.find(s => s.id === id);
    if (!section) return;

    const confirmMessage = section.items.length > 0
      ? `سيتم حذف القسم "${section.name}" وجميع ميزاته (${section.items.length}). هل أنت متأكد؟`
      : `سيتم حذف القسم "${section.name}". هل أنت متأكد؟`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const success = await deleteSection(id);
    if (success && selectedSectionId === id) {
      setSelectedSectionId(null);
    }
    if (onFeaturesChange) {
      onFeaturesChange();
    }
  };

  // Handle section reordering
  const handleSectionReorder = async (sectionIds: string[]) => {
    await reorderSections(sectionIds);
    if (onFeaturesChange) {
      onFeaturesChange();
    }
  };

  // Handle section save (create or update)
  const handleSectionSave = async (data: CreateFeatureSectionDto) => {
    if (editingSection) {
      await updateSection(editingSection.id, data);
    } else {
      await createSection(data);
    }
    refetch();
    if (onFeaturesChange) {
      onFeaturesChange();
    }
  };

  // Handle item deletion
  const handleItemDelete = async (itemId: string) => {
    if (!selectedSectionId) return;

    const item = selectedSection?.items.find(i => i.id === itemId);
    if (!item) return;

    if (!window.confirm(`سيتم حذف الميزة "${item.name}". هل أنت متأكد؟`)) {
      return;
    }

    await deleteItem(selectedSectionId, itemId);
  };

  // Handle item reordering
  const handleItemReorder = async (itemIds: string[]) => {
    if (!selectedSectionId) return;
    await reorderItems(selectedSectionId, itemIds);
  };

  // Handle item save (create or update)
  const handleItemSave = async (data: CreateFeatureItemDto) => {
    if (!selectedSectionId) return;

    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await createItem(selectedSectionId, data);
    }
    refetch();
  };

  // Handle item edit - open edit dialog
  const handleItemEdit = (itemId: string) => {
    const item = selectedSection?.items.find(i => i.id === itemId);
    if (item) {
      setEditingItem(item);
      setShowAddItemDialog(true);
    }
  };

  // Handle section edit - open edit dialog
  const handleSectionEdit = (sectionId: string) => {
    const section = featureSections.find(s => s.id === sectionId);
    if (section) {
      setEditingSection(section);
      setShowAddSectionDialog(true);
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
        title="إدارة المميزات"
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
          <div className="flex gap-6 h-[500px]" dir="rtl">
            {/* Right Column - Feature Sections List (35%) */}
            <div className="w-[35%] border-l border-[#f2f2f2] pl-6 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <FeatureSectionsList
                  sections={featureSections}
                  selectedId={selectedSectionId}
                  onSelect={handleSectionSelect}
                  onAdd={() => {
                    setEditingSection(null);
                    setShowAddSectionDialog(true);
                  }}
                  onEdit={handleSectionEdit}
                  onReorder={handleSectionReorder}
                  onDelete={handleSectionDelete}
                />
              </div>
            </div>

            {/* Left Column - Feature Items Manager (65%) */}
            <div className="w-[65%] pr-6 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <FeatureItemsManager
                  section={selectedSection}
                  onAddItem={() => {
                    if (!selectedSection) {
                      toast.error('الرجاء اختيار قسم أولاً');
                      return;
                    }
                    setEditingItem(null);
                    setShowAddItemDialog(true);
                  }}
                  onEditItem={handleItemEdit}
                  onDeleteItem={handleItemDelete}
                  onReorderItems={handleItemReorder}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Feature Section Dialog */}
      <AddFeatureSectionDialog
        isOpen={showAddSectionDialog}
        onClose={() => {
          setShowAddSectionDialog(false);
          setEditingSection(null);
        }}
        editingSection={editingSection}
        onSave={handleSectionSave}
      />

      {/* Add/Edit Feature Item Dialog */}
      <AddFeatureItemDialog
        isOpen={showAddItemDialog}
        onClose={() => {
          setShowAddItemDialog(false);
          setEditingItem(null);
        }}
        sectionId={selectedSectionId || ''}
        sectionName={selectedSection?.name || ''}
        editingItem={editingItem}
        onSave={handleItemSave}
      />
    </>
  );
}