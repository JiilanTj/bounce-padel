import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import DangerButton from './DangerButton';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

interface ConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export default function ConfirmationModal({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmationModalProps) {
    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && show && !loading) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [show, loading, onClose]);

    // Icon and color based on variant
    const variantConfig = {
        danger: {
            icon: TrashIcon,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            button: DangerButton,
        },
        warning: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            button: PrimaryButton,
        },
        info: {
            icon: InformationCircleIcon,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            button: PrimaryButton,
        },
    };

    const config = variantConfig[variant];
    const Icon = config.icon;
    const ButtonComponent = config.button;

    return (
        <Modal show={show} onClose={loading ? () => {} : onClose} maxWidth="md">
            <div className="p-6">
                {/* Icon */}
                <div className="flex items-center justify-center">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}
                    >
                        <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                </div>

                {/* Title */}
                <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                </div>

                {/* Message */}
                <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">{message}</p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-center space-x-3">
                    <SecondaryButton onClick={onClose} disabled={loading}>
                        {cancelText}
                    </SecondaryButton>
                    <ButtonComponent onClick={onConfirm} disabled={loading}>
                        {loading ? 'Processing...' : confirmText}
                    </ButtonComponent>
                </div>
            </div>
        </Modal>
    );
}
