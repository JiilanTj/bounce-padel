<?php

namespace App\Console\Commands;

use App\Services\CourtSyncService;
use Illuminate\Console\Command;

class SyncCourtsFromAyo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'courts:sync 
                            {--all : Sync all fields including inactive ones}
                            {--dry-run : Preview changes without saving}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync courts from AYO API to local database';

    protected CourtSyncService $syncService;

    public function __construct(CourtSyncService $syncService)
    {
        parent::__construct();
        $this->syncService = $syncService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔄 Court Sync - AYO API to Local Database');
        $this->newLine();

        // Get options
        $activeOnly = !$this->option('all');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        // Display sync mode
        $this->displaySyncMode($activeOnly, $dryRun);
        $this->newLine();

        // Confirmation
        if (!$force && !$dryRun) {
            if (!$this->confirm('Do you want to proceed with the sync?')) {
                $this->warn('Sync cancelled.');
                return Command::FAILURE;
            }
            $this->newLine();
        }

        // Execute sync
        $this->info('🚀 Starting sync...');
        $this->newLine();

        $result = $this->syncService->syncFromAyo($activeOnly, $dryRun);

        // Display results
        $this->displayResults($result);

        return $result['success'] ? Command::SUCCESS : Command::FAILURE;
    }

    /**
     * Display sync mode
     */
    protected function displaySyncMode(bool $activeOnly, bool $dryRun): void
    {
        $this->info('⚙️  Configuration:');
        $this->line('   Mode: ' . ($activeOnly ? 'Active fields only' : 'All fields'));
        $this->line('   Dry Run: ' . ($dryRun ? 'Yes (no changes will be saved)' : 'No'));
    }

    /**
     * Display sync results
     */
    protected function displayResults(array $result): void
    {
        if (!$result['success']) {
            $this->error('❌ Sync Failed!');
            $this->newLine();
            $this->error('Error: ' . ($result['message'] ?? 'Unknown error'));
            
            if (isset($result['error'])) {
                $this->error('Details: ' . json_encode($result['error']));
            }
            
            return;
        }

        $stats = $result['stats'];

        $this->info('✅ Sync Completed Successfully!');
        $this->newLine();

        // Display stats
        $this->info('📊 Summary:');
        $this->line('   Total AYO Fields: ' . $stats['total_ayo_fields']);
        $this->line('   Created: ' . $stats['created']);
        $this->line('   Updated: ' . $stats['updated']);
        $this->line('   Skipped: ' . $stats['skipped']);
        
        if ($stats['errors'] > 0) {
            $this->warn('   Errors: ' . $stats['errors']);
        }

        if (isset($stats['dry_run']) && $stats['dry_run']) {
            $this->newLine();
            $this->warn('⚠️  DRY RUN - No changes were saved to database');
        }

        $this->newLine();

        // Display changes
        if (!empty($stats['changes'])) {
            $this->displayChanges($stats['changes']);
        }
    }

    /**
     * Display detailed changes
     */
    protected function displayChanges(array $changes): void
    {
        $this->info('📋 Detailed Changes:');
        $this->newLine();

        $created = array_filter($changes, fn($c) => $c['action'] === 'created');
        $updated = array_filter($changes, fn($c) => $c['action'] === 'updated');
        $errors = array_filter($changes, fn($c) => $c['action'] === 'error');

        // Created
        if (!empty($created)) {
            $this->info('✨ Created:');
            foreach ($created as $change) {
                $this->line("   • {$change['name']} (AYO Field ID: {$change['ayo_field_id']})");
            }
            $this->newLine();
        }

        // Updated
        if (!empty($updated)) {
            $this->info('🔄 Updated:');
            foreach ($updated as $change) {
                $this->line("   • {$change['name']} (Court ID: {$change['court_id']})");
                
                if ($this->option('verbose')) {
                    foreach ($change['changes'] as $field => $values) {
                        $this->line("      - {$field}: {$values['old']} → {$values['new']}");
                    }
                }
            }
            $this->newLine();
        }

        // Errors
        if (!empty($errors)) {
            $this->error('❌ Errors:');
            foreach ($errors as $change) {
                $this->error("   • {$change['name']}: {$change['error']}");
            }
            $this->newLine();
        }
    }
}
