import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

type Props = {
    label?: string;
    onChange: (file: File | null) => void;
    error?: string;
    previewUrl?: string | null; // For existing image from DB
    className?: string;
};

export default function FileInput({
    label = 'Image',
    onChange,
    error,
    previewUrl,
    className = '',
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(previewUrl || null);
    const [fileName, setFileName] = useState<string | null>(null);

    // Update preview when previewUrl prop changes
    useEffect(() => {
        setPreview(previewUrl || null);
    }, [previewUrl]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onChange(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFileName(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const triggerSelect = () => {
        inputRef.current?.click();
    };

    return (
        <div className={className}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="flex flex-col space-y-3">
                {/* Preview Area */}
                <div
                    onClick={triggerSelect}
                    className={`relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400 ${
                        preview ? 'border-solid border-blue-200' : 'bg-gray-50'
                    }`}
                >
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                <span className="text-xs text-white">
                                    Change
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <span className="mt-1 block text-xs text-gray-500">
                                Upload
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions / Info */}
                <div>
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                    />

                    {fileName ? (
                        <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                            <span className="truncate text-sm text-gray-700">
                                {fileName}
                            </span>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="ml-2 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                                title="Remove selected file"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">
                            PNG, JPG, WEBP up to 8MB
                        </p>
                    )}

                    {!preview && previewUrl && (
                        <p className="mt-1 text-xs text-yellow-600">
                            Old image removed. Save to apply.
                        </p>
                    )}
                </div>
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
