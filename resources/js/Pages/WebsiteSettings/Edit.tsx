import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AtSymbolIcon,
    BuildingOffice2Icon,
    EnvelopeIcon,
    GlobeAmericasIcon,
    HashtagIcon,
    LinkIcon,
    MapPinIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface WebsiteSettings {
    phone_number: string | null;
    email: string | null;
    location: string | null;
    location_link: string | null;
    facebook_link: string | null;
    instagram_link: string | null;
    twitter_link: string | null;
}

export default function Edit({ settings }: { settings?: WebsiteSettings }) {
    const { data, setData, put, processing, errors } = useForm({
        phone_number: settings?.phone_number || '',
        email: settings?.email || '',
        location: settings?.location || '',
        location_link: settings?.location_link || '',
        facebook_link: settings?.facebook_link || '',
        instagram_link: settings?.instagram_link || '',
        twitter_link: settings?.twitter_link || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('website-settings.update'), {
            onSuccess: () => {
                toast.success('Website settings updated successfully');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Website Settings
                </h2>
            }
        >
            <Head title="Website Settings" />

            <div className="py-12">
                <div className="mx-auto mb-8 max-w-7xl sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-100 md:px-12 md:py-12">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
                                Website Control Center
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg text-gray-500">
                                Manage your digital presence. Keep your contact
                                info, location, and social connections fresh for
                                the Bounce Padel community.
                            </p>
                        </div>
                        {/* Decorative background element - Subtle */}
                        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-gray-50 blur-3xl"></div>
                        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-blue-50 blur-2xl"></div>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8"
                >
                    {/* Contact Information Section */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                    <BuildingOffice2Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Business Details
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Manage your contact info & location
                                        display.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 md:grid-cols-2">
                            {/* Phone */}
                            <div>
                                <InputLabel
                                    htmlFor="phone_number"
                                    value="Phone Number"
                                />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="phone_number"
                                        className="block w-full pl-10"
                                        value={data.phone_number}
                                        placeholder="+62 812..."
                                        onChange={(e) =>
                                            setData(
                                                'phone_number',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={errors.phone_number}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="block w-full pl-10"
                                        value={data.email}
                                        placeholder="contact@bouncepadel.com"
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {/* Location */}
                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="location"
                                    value="Location / Address"
                                />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="location"
                                        className="block w-full pl-10"
                                        value={data.location}
                                        placeholder="Jl. Padel No. 1, Jakarta"
                                        onChange={(e) =>
                                            setData('location', e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={errors.location}
                                />
                            </div>

                            {/* Google Maps Link */}
                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="location_link"
                                    value="Google Maps Link"
                                />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="location_link"
                                        className="block w-full pl-10"
                                        value={data.location_link}
                                        placeholder="https://maps.google.com/..."
                                        onChange={(e) =>
                                            setData(
                                                'location_link',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={errors.location_link}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                    <HashtagIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Social Presence
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Connect your brand across platforms.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Facebook */}
                            <div>
                                <InputLabel
                                    htmlFor="facebook_link"
                                    value="Facebook URL"
                                />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <LinkIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <TextInput
                                        id="facebook_link"
                                        className="block w-full pl-10"
                                        value={data.facebook_link}
                                        placeholder="https://facebook.com/..."
                                        onChange={(e) =>
                                            setData(
                                                'facebook_link',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Instagram */}
                            <div>
                                <InputLabel
                                    htmlFor="instagram_link"
                                    value="Instagram URL"
                                />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <LinkIcon className="h-5 w-5 text-pink-500" />
                                    </div>
                                    <TextInput
                                        id="instagram_link"
                                        className="block w-full pl-10"
                                        value={data.instagram_link}
                                        placeholder="https://instagram.com/..."
                                        onChange={(e) =>
                                            setData(
                                                'instagram_link',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Twitter */}
                            <div>
                                <InputLabel
                                    htmlFor="twitter_link"
                                    value="X (Twitter) URL"
                                />
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <AtSymbolIcon className="h-5 w-5 text-gray-800" />
                                    </div>
                                    <TextInput
                                        id="twitter_link"
                                        className="block w-full pl-10"
                                        value={data.twitter_link}
                                        placeholder="https://x.com/..."
                                        onChange={(e) =>
                                            setData(
                                                'twitter_link',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-end">
                                <PrimaryButton
                                    disabled={processing}
                                    className="px-6 py-2"
                                >
                                    Save Changes
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
