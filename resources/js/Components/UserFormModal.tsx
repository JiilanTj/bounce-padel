import { User } from '@/types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import InputError from './InputError';
import InputLabel from './InputLabel';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import TextInput from './TextInput';

interface UserFormModalProps {
    show: boolean;
    onClose: () => void;
    user?: User | null;
    availableRoles: Record<string, string>;
}

export default function UserFormModal({
    show,
    onClose,
    user = null,
    availableRoles,
}: UserFormModalProps) {
    const isEditing = !!user;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            password_confirmation: '',
            role: user?.role || '',
        });

    // Update form when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (show && user) {
            setData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                role: user.role,
            });
        } else if (show && !user) {
            reset();
        }
    }, [show, user, setData, reset]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEditing && user) {
            put(route('users.update', user.id), {
                onSuccess: () => {
                    handleClose();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    const handleClose = () => {
        if (!processing) {
            reset();
            clearErrors();
            setShowPassword(false);
            setShowPasswordConfirmation(false);
            onClose();
        }
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit User' : 'Create New User'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {isEditing
                            ? 'Update user information and permissions'
                            : 'Add a new user to the system'}
                    </p>
                </div>

                {/* Form Body */}
                <div className="px-6 py-6">
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <InputLabel
                                htmlFor="name"
                                value="Name"
                                className="font-medium"
                            />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1 block w-full"
                                autoFocus
                                required
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email"
                                className="font-medium"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value={
                                    isEditing
                                        ? 'Password (Optional)'
                                        : 'Password'
                                }
                                className="font-medium"
                            />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="block w-full pr-10"
                                    required={!isEditing}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {isEditing && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Kosongkan jika tidak ingin mengubah password
                                </p>
                            )}
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                                className="font-medium"
                            />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password_confirmation"
                                    type={
                                        showPasswordConfirmation
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="block w-full pr-10"
                                    required={!isEditing || !!data.password}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordConfirmation(
                                            !showPasswordConfirmation,
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <InputLabel
                                htmlFor="role"
                                value="Role"
                                className="font-medium"
                            />
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) =>
                                    setData('role', e.target.value)
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                disabled={
                                    isEditing && user?.role === 'owner' // Can't change owner role
                                }
                            >
                                <option value="">Select a role</option>
                                {Object.entries(availableRoles).map(
                                    ([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            {isEditing && user?.role === 'owner' && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Owner role cannot be changed
                                </p>
                            )}
                            <InputError
                                message={errors.role}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton
                            type="button"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update User'
                                  : 'Create User'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
