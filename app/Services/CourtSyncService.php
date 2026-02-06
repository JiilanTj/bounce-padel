<?php

namespace App\Services;

use App\Models\Court;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CourtSyncService
{
    protected AyoApiService $ayoService;

    public function __construct(AyoApiService $ayoService)
    {
        $this->ayoService = $ayoService;
    }

    /**
     * Sync courts from AYO API to local database
     *
     * @param bool $activeOnly Sync only active fields
     * @param bool $dryRun Preview changes without saving
     * @return array
     */
    public function syncFromAyo(bool $activeOnly = true, bool $dryRun = false): array
    {
        Log::info('Court Sync Started', [
            'active_only' => $activeOnly,
            'dry_run' => $dryRun,
        ]);

        // Get fields from AYO
        $result = $activeOnly 
            ? $this->ayoService->getActiveFields() 
            : $this->ayoService->getFields();

        if (!$result['success']) {
            Log::error('Court Sync Failed - AYO API Error', [
                'error' => $result['error'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch fields from AYO API',
                'error' => $result['error'],
            ];
        }

        $ayoFields = $result['data']['data'] ?? [];
        $stats = [
            'total_ayo_fields' => count($ayoFields),
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => 0,
            'changes' => [],
        ];

        DB::beginTransaction();

        try {
            foreach ($ayoFields as $field) {
                $syncResult = $this->syncField($field, $dryRun);

                if ($syncResult['action'] === 'created') {
                    $stats['created']++;
                } elseif ($syncResult['action'] === 'updated') {
                    $stats['updated']++;
                } elseif ($syncResult['action'] === 'skipped') {
                    $stats['skipped']++;
                } elseif ($syncResult['action'] === 'error') {
                    $stats['errors']++;
                }

                $stats['changes'][] = $syncResult;
            }

            if ($dryRun) {
                DB::rollBack();
                $stats['dry_run'] = true;
                $stats['message'] = 'Dry run completed - no changes saved';
            } else {
                DB::commit();
                $stats['message'] = 'Sync completed successfully';
            }

            Log::info('Court Sync Completed', $stats);

            return [
                'success' => true,
                'stats' => $stats,
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Court Sync Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Sync failed with error',
                'error' => $e->getMessage(),
                'stats' => $stats,
            ];
        }
    }

    /**
     * Sync single field
     *
     * @param array $field
     * @param bool $dryRun
     * @return array
     */
    protected function syncField(array $field, bool $dryRun = false): array
    {
        try {
            $ayoFieldId = $field['id'];
            $existingCourt = Court::where('ayo_field_id', $ayoFieldId)->first();

            // Prepare court data
            $courtData = [
                'ayo_field_id' => $ayoFieldId,
                'name' => $field['name'],
                'type' => 'indoor', // Default, bisa diubah manual
                'status' => $this->mapStatus($field['status'], $field['is_active']),
                'surface' => $field['sport_name'] ?? 'Padel',
            ];

            if ($existingCourt) {
                // Check if update needed
                $hasChanges = false;
                $changes = [];

                foreach ($courtData as $key => $value) {
                    if ($key !== 'ayo_field_id' && $existingCourt->$key !== $value) {
                        $hasChanges = true;
                        $changes[$key] = [
                            'old' => $existingCourt->$key,
                            'new' => $value,
                        ];
                    }
                }

                if ($hasChanges) {
                    if (!$dryRun) {
                        $existingCourt->update($courtData);
                    }

                    return [
                        'action' => 'updated',
                        'ayo_field_id' => $ayoFieldId,
                        'court_id' => $existingCourt->id,
                        'name' => $field['name'],
                        'changes' => $changes,
                    ];
                } else {
                    return [
                        'action' => 'skipped',
                        'ayo_field_id' => $ayoFieldId,
                        'court_id' => $existingCourt->id,
                        'name' => $field['name'],
                        'reason' => 'No changes detected',
                    ];
                }
            } else {
                // Create new court
                if (!$dryRun) {
                    // Set default price if not set
                    $courtData['price_per_hour'] = 0;
                    
                    $newCourt = Court::create($courtData);
                    $courtId = $newCourt->id;

                    // Create default operating hours
                    for ($i = 0; $i < 7; $i++) {
                        $newCourt->operatingHours()->create([
                            'day_of_week' => $i,
                            'open_time' => '08:00',
                            'close_time' => '22:00',
                            'is_closed' => false,
                        ]);
                    }
                } else {
                    $courtId = null;
                }

                return [
                    'action' => 'created',
                    'ayo_field_id' => $ayoFieldId,
                    'court_id' => $courtId,
                    'name' => $field['name'],
                    'data' => $courtData,
                ];
            }

        } catch (\Exception $e) {
            Log::error('Failed to sync field', [
                'field' => $field,
                'error' => $e->getMessage(),
            ]);

            return [
                'action' => 'error',
                'ayo_field_id' => $field['id'] ?? null,
                'name' => $field['name'] ?? 'Unknown',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Map AYO status to local status
     *
     * @param string $ayoStatus
     * @param int $isActive
     * @return string
     */
    protected function mapStatus(string $ayoStatus, int $isActive): string
    {
        if ($ayoStatus === 'ACTIVE' && $isActive == 1) {
            return 'active';
        }

        return 'closed';
    }

    /**
     * Get sync preview without saving
     *
     * @param bool $activeOnly
     * @return array
     */
    public function previewSync(bool $activeOnly = true): array
    {
        return $this->syncFromAyo($activeOnly, true);
    }

    /**
     * Check if court exists in AYO
     *
     * @param int $courtId
     * @return bool
     */
    public function isCourtSyncedWithAyo(int $courtId): bool
    {
        $court = Court::find($courtId);
        
        if (!$court || !$court->ayo_field_id) {
            return false;
        }

        $result = $this->ayoService->getFields();

        if (!$result['success']) {
            return false;
        }

        $ayoFields = $result['data']['data'] ?? [];
        $ayoFieldIds = array_column($ayoFields, 'id');

        return in_array($court->ayo_field_id, $ayoFieldIds);
    }

    /**
     * Get AYO field ID for local court
     *
     * @param int $courtId
     * @return int|null
     */
    public function getAyoFieldId(int $courtId): ?int
    {
        $court = Court::find($courtId);
        return $court?->ayo_field_id;
    }

    /**
     * Get local court by AYO field ID
     *
     * @param int $ayoFieldId
     * @return Court|null
     */
    public function getCourtByAyoFieldId(int $ayoFieldId): ?Court
    {
        return Court::where('ayo_field_id', $ayoFieldId)->first();
    }
}
