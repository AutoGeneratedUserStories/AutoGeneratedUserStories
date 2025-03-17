import React from 'react';

interface ResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveAndReset: () => void;
    onDeleteAndReset: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onSaveAndReset, onDeleteAndReset }) => {
    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold">Warning: Unsaved Changes</h2>
        <p className="text-gray-600 mt-2">Your project is not saved. Do you want to save before resetting?</p>
        
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={onSaveAndReset}
          >
            Save & Reset
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={onDeleteAndReset}
          >
            Delete & Reset
          </button>
            <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={onClose}
            >
                Cancel
            </button>
        </div>

        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ResetModal;