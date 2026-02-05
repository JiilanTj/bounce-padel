import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import {
    ChevronDownIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

type Props = {
    value: string | null;
    onChange: (icon: string | null) => void;
    error?: string;
    label?: string;
};

// Extended list of Material Icons
const MATERIAL_ICONS = [
    // Sports & Activities
    'sports_tennis',
    'sports_soccer',
    'sports_basketball',
    'sports_baseball',
    'sports_golf',
    'sports_volleyball',
    'sports_handball',
    'sports_rugby',
    'sports_cricket',
    'sports_martial_arts',
    'sports_kabaddi',
    'sports_mma',
    'sports_score',
    'pool',
    'fitness_center',
    'gym',
    'directions_run',
    'directions_bike',
    'self_improvement',
    'skateboarding',
    'snowboarding',
    'kayaking',
    'rowing',
    'sailing',
    'surfing',
    'scuba_diving',
    'downhill_skiing',
    'paragliding',
    'hiking',
    'terrain',

    // Food & Drink
    'restaurant',
    'local_cafe',
    'local_bar',
    'local_pizza',
    'local_dining',
    'fastfood',
    'ramen_dining',
    'dinner_dining',
    'lunch_dining',
    'brunch_dining',
    'breakfast_dining',
    'coffee',
    'coffee_maker',
    'set_meal',
    'restaurant_menu',
    'icecream',
    'cake',
    'bakery_dining',
    'microwave',
    'pizza',
    'wine_bar',
    'liquor',

    // Travel & Places
    'local_parking',
    'directions_car',
    'directions_bus',
    'directions_subway',
    'directions_train',
    'directions_walk',
    'flight',
    'flight_land',
    'flight_takeoff',
    'hotel',
    'bed',
    'luggage',
    'apartment',
    'home',
    'home_work',
    'cottage',
    'cabin',
    'houseboat',
    'villa',
    'bungalow',
    'villa',
    'castle',
    'apartment',
    'domain',

    // Weather & Environment
    'air',
    'water_drop',
    'severe_cold',
    'ac_unit',
    'thermostat',
    'waves',
    'pool',
    'spa',
    'hot_tub',
    'shower',
    'water',
    'clean_hands',
    'bathtub',
    'kitchen',
    'toilet',
    'soap',

    // Building & Facilities
    'meeting_room',
    'door_sliding',
    'door_front',
    'garage',
    'warehouse',
    'store',
    'storefront',
    'business',
    'corporate_fare',
    'office_box',
    'deck',
    'balcony',
    'stairs',
    'elevator',
    'escalator',
    'outdoor_grill',
    'roofing',
    'foundation',
    'countertops',
    'plumbing',

    // Amenities
    'tv',
    'monitor',
    'computer',
    'laptop',
    'tablet',
    'smartphone',
    'phone',
    'wifi',
    'cable',
    'satellite_alt',
    'router',
    'bluetooth',
    'bluetooth_audio',
    'headphones',
    'speaker',
    'volume_up',
    'volume_down',
    'volume_off',
    'music_note',
    'music_off',
    'library_music',
    'audiotrack',
    'album',
    'queue_music',

    // Security & Access
    'security',
    'shield',
    'shield_locked',
    'shield_with_heart',
    'verified_user',
    'admin_panel_settings',
    'badge',
    'lock',
    'lock_open',
    'key',
    'no_crash',
    'safety_check',
    'policy',
    'gavel',
    'local_police',
    'local_hospital',
    'medical_services',
    'health_and_safety',
    'vaccines',
    'coronavirus',
    'sick',

    // Accessibility
    'accessible',
    'accessible_forward',
    'not_accessible',
    'wheelchair_pickup',
    'support_agent',
    'support',

    // Services
    'cleaning_services',
    'dry_cleaning',
    'iron',
    'iron',
    'mop',
    'broom',
    'delete_sweep',
    'cleaning_services_public',
    'laundry_service',
    'dry_cleaning',
    'car_rental',

    // Recreation
    'theater_comedy',
    'casino',
    'sports_esports',
    'videogame_asset',
    'sports_esports',
    'joystick',
    'casino',
    'emoji_events',
    'military_tech',
    'celebration',
    'confetti',
    'card_giftcard',
    'redeem',
    'card_membership',
    'loyalty',

    // Shopping
    'shopping_bag',
    'shopping_cart',
    'shopping_basket',
    'shopping_bag',
    'store',
    'storefront',
    'local_shipping',
    'local_mall',
    'attach_money',
    'payments',
    'savings',
    'account_balance_wallet',
    'account_balance',
    'monetization_on',
    'paid',

    // Health & Wellness
    'spa',
    'massage',
    'healing',
    'self_improvement',
    'meditation',
    'psychology',
    'favorite',
    'favorite_border',
    'thumb_up',
    'sentiment_satisfied',
    'sentiment_very_satisfied',
    'sentiment_neutral',
    'sentiment_dissatisfied',

    // Tech & Smart
    'smartphone',
    'tablet_android',
    'tablet_mac',
    'laptop',
    'desktop_windows',
    'developer_board',
    'memory',
    'storage',
    'usb',
    'bluetooth',
    'wifi',
    'router',
    'cloud',
    'cloud_upload',
    'cloud_download',
    'language',
    'translate',
    'public',
    'share',

    // Communication
    'email',
    'alternate_email',
    'mark_email_read',
    'mark_email_unread',
    'chat',
    'chat_bubble',
    'chat_bubble_outline',
    'forum',
    'comments',
    'call',
    'call_end',
    'phone',
    'phone_enabled',
    'phone_disabled',
    'video_call',
    'video_camera_front',
    'video_camera_back',

    // Miscellaneous
    'star',
    'star_border',
    'star_half',
    'bookmark',
    'bookmark_border',
    'favorite',
    'favorite_border',
    'thumb_up',
    'thumb_down',
    'notifications',
    'notifications_active',
    'notifications_none',
    'notifications_paused',
    'notifications_off',
    'lightbulb',
    'lightbulb_outline',
    'eco',
    'energy_savings_leaf',
    'nature',
    'park',
    'forest',
    'landscape',
    'grass',
    'flower',
];

export default function IconPicker({
    value,
    onChange,
    error,
    label = 'Icon',
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIcons = MATERIAL_ICONS.filter((icon) =>
        icon.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleSelect = (icon: string) => {
        onChange(icon);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        onChange(null);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <InputLabel htmlFor="icon-picker" value={label} />

            {/* Selected Icon Display */}
            <button
                type="button"
                id="icon-picker"
                onClick={() => setIsOpen(!isOpen)}
                className="mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2.5 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
                <div className="flex items-center gap-3">
                    {value ? (
                        <span className="material-symbols-outlined text-2xl text-gray-700">
                            {value}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-500">
                            Select an icon...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {value && (
                        <XMarkIcon
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="h-5 w-5 text-gray-400 hover:text-red-500"
                        />
                    )}
                    <ChevronDownIcon
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                    {/* Search Box */}
                    <div className="border-b border-gray-200 p-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search icons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Icons Grid */}
                    <div className="max-h-80 overflow-y-auto p-3">
                        {filteredIcons.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">
                                No icons found matching "{searchQuery}"
                            </div>
                        ) : (
                            <div className="grid grid-cols-8 gap-1">
                                {filteredIcons.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => handleSelect(icon)}
                                        className={`relative flex aspect-square items-center justify-center rounded-lg text-2xl transition-all hover:bg-indigo-50 hover:text-indigo-600 ${
                                            value === icon
                                                ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500'
                                                : 'text-gray-600'
                                        }`}
                                        title={icon}
                                    >
                                        <span className="material-symbols-outlined">
                                            {icon}
                                        </span>
                                        {value === icon && (
                                            <div className="absolute bottom-0.5 right-0.5">
                                                <span className="material-symbols-outlined text-sm text-indigo-600">
                                                    check_circle
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                        {filteredIcons.length} icons available
                    </div>
                </div>
            )}

            {/* Error */}
            <InputError message={error} className="mt-2" />
        </div>
    );
}
