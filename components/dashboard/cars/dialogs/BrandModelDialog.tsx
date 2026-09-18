'use client';

import React, { useState } from 'react';
import Modal from '../../../ui/Modal';
import { useCarBrands } from '../../../../hooks/useCarBrands';
import { CarBrand, CreateBrandDto, CreateModelDto, CarBrandModel } from '../../../../lib/api-client';
import BrandList from './BrandList';
import ModelList from './ModelList';
import AddBrandDialog from './AddBrandDialog';
import AddModelDialog from './AddModelDialog';
import toast from 'react-hot-toast';

interface BrandModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandsChange?: () => void;
}

export default function BrandModelDialog({ 
  isOpen, 
  onClose, 
  onBrandsChange 
}: BrandModelDialogProps) {
  const {
    brands,
    loading,
    refetch,
    createBrand,
    updateBrand,
    deleteBrand,
    createModel,
    updateModel,
    deleteModel,
    reorderBrands,
    reorderModels,
  } = useCarBrands();

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [showAddBrandDialog, setShowAddBrandDialog] = useState(false);
  const [showAddModelDialog, setShowAddModelDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<CarBrand | null>(null);
  const [editingModel, setEditingModel] = useState<CarBrandModel | null>(null);

  // Get selected brand
  const selectedBrand = brands.find(brand => brand.id === selectedBrandId) || null;

  // Handle brand selection
  const handleBrandSelect = (id: string) => {
    setSelectedBrandId(id === selectedBrandId ? null : id);
  };

  // Handle brand deletion with confirmation
  const handleBrandDelete = async (id: string) => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return;

    const confirmMessage = brand.models.length > 0
      ? `سيتم حذف الماركة "${brand.name}" وجميع موديلاتها (${brand.models.length}). هل أنت متأكد؟`
      : `سيتم حذف الماركة "${brand.name}". هل أنت متأكد؟`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const success = await deleteBrand(id);
    if (success && selectedBrandId === id) {
      setSelectedBrandId(null);
    }
    if (onBrandsChange) {
      onBrandsChange();
    }
  };

  // Handle brand reordering
  const handleBrandReorder = async (brandIds: string[]) => {
    await reorderBrands(brandIds);
    if (onBrandsChange) {
      onBrandsChange();
    }
  };

  // Handle brand save (create or update)
  const handleBrandSave = async (data: CreateBrandDto) => {
    if (editingBrand) {
      await updateBrand(editingBrand.id, data);
    } else {
      await createBrand(data);
    }
    refetch();
    if (onBrandsChange) {
      onBrandsChange();
    }
  };

  // Handle model deletion
  const handleModelDelete = async (modelId: string) => {
    if (!selectedBrandId) return;

    const brand = brands.find(b => b.id === selectedBrandId);
    const model = brand?.models.find(m => m.id === modelId);
    if (!model) return;

    if (!window.confirm(`سيتم حذف الموديل "${model.name}". هل أنت متأكد؟`)) {
      return;
    }

    await deleteModel(selectedBrandId, modelId);
  };

  // Handle model reordering
  const handleModelReorder = async (modelIds: string[]) => {
    if (!selectedBrandId) return;
    await reorderModels(selectedBrandId, modelIds);
  };

  // Handle model save (create or update)
  const handleModelSave = async (data: CreateModelDto) => {
    if (!selectedBrandId) return;

    if (editingModel) {
      await updateModel(selectedBrandId, editingModel.id, data);
    } else {
      await createModel(selectedBrandId, data);
    }
    refetch();
  };

  // Handle model edit - open edit dialog
  const handleModelEdit = (modelId: string, data: CreateModelDto) => {
    const model = selectedBrand?.models.find(m => m.id === modelId);
    if (model) {
      setEditingModel(model);
      setShowAddModelDialog(true);
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
        title="إدارة الماركات والموديلات"
        maxWidth="900px"
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
          <div className="flex gap-6" style={{ minHeight: '400px' }} dir="rtl">
            {/* Right Column - Brand List (40%) */}
            <div className="w-[40%] border-l border-[#f2f2f2] pl-6">
              <BrandList
                brands={brands}
                selectedId={selectedBrandId}
                onSelect={handleBrandSelect}
                onAdd={() => {
                  setEditingBrand(null);
                  setShowAddBrandDialog(true);
                }}
                onReorder={handleBrandReorder}
                onDelete={handleBrandDelete}
                onEdit={(id) => {
                  const brand = brands.find(b => b.id === id);
                  if (brand) {
                    setEditingBrand(brand);
                    setShowAddBrandDialog(true);
                  }
                }}
              />
            </div>

            {/* Left Column - Model List (60%) */}
            <div className="w-[60%] pr-6">
              <ModelList
                brand={selectedBrand}
                onAdd={() => {
                  if (!selectedBrand) {
                    toast.error('الرجاء اختيار ماركة أولاً');
                    return;
                  }
                  setEditingModel(null);
                  setShowAddModelDialog(true);
                }}
                onEdit={handleModelEdit}
                onDelete={handleModelDelete}
                onReorder={handleModelReorder}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Brand Dialog */}
      <AddBrandDialog
        isOpen={showAddBrandDialog}
        onClose={() => {
          setShowAddBrandDialog(false);
          setEditingBrand(null);
        }}
        editingBrand={editingBrand}
        onSave={handleBrandSave}
      />

      {/* Add/Edit Model Dialog */}
      <AddModelDialog
        isOpen={showAddModelDialog}
        onClose={() => {
          setShowAddModelDialog(false);
          setEditingModel(null);
        }}
        brandId={selectedBrandId || ''}
        editingModel={editingModel}
        onSave={handleModelSave}
      />
    </>
  );
}