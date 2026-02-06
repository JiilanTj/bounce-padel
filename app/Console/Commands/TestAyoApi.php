<?php

namespace App\Console\Commands;

use App\Services\AyoApiService;
use Illuminate\Console\Command;

class TestAyoApi extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ayo:test 
                            {--fields : Get venue fields instead of bookings}
                            {--active-only : Get only active fields (use with --fields)}
                            {--date= : Specific date (YYYY-MM-DD)}
                            {--start-date= : Start date for range (YYYY-MM-DD)}
                            {--end-date= : End date for range (YYYY-MM-DD)}
                            {--booking-id= : Specific booking ID}
                            {--field-name= : Field name filter}
                            {--status= : Status filter (SUCCESS, PENDING, CANCELLED, FINISHED)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test AYO API - Get Bookings or Venue Fields';

    protected AyoApiService $ayoService;

    public function __construct(AyoApiService $ayoService)
    {
        parent::__construct();
        $this->ayoService = $ayoService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Check if user wants to test fields endpoint
        if ($this->option('fields')) {
            return $this->handleFields();
        }

        // Default: test bookings endpoint
        return $this->handleBookings();
    }

    /**
     * Handle get fields test
     */
    protected function handleFields(): int
    {
        $this->info('🚀 Testing AYO API - Get Venue Fields');
        $this->newLine();

        // Display config
        $this->displayConfig();
        $this->newLine();

        // Make request
        $this->info('🔄 Sending request...');
        $this->newLine();

        if ($this->option('active-only')) {
            $this->info('📋 Filter: Active fields only');
            $this->newLine();
            $result = $this->ayoService->getActiveFields();
        } else {
            $result = $this->ayoService->getFields();
        }

        // Display results
        $this->displayFieldsResults($result);

        return $result['success'] ? Command::SUCCESS : Command::FAILURE;
    }

    /**
     * Handle get bookings test
     */
    protected function handleBookings(): int
    {
        $this->info('🚀 Testing AYO API - Get Bookings');
        $this->newLine();

        // Display config
        $this->displayConfig();
        $this->newLine();

        // Build filters
        $filters = $this->buildFilters();

        if (!empty($filters)) {
            $this->info('📋 Filters:');
            foreach ($filters as $key => $value) {
                $this->line("   {$key}: {$value}");
            }
            $this->newLine();
        }

        // Make request
        $this->info('🔄 Sending request...');
        $this->newLine();

        $result = $this->ayoService->getBookings($filters);

        // Display results
        $this->displayResults($result);

        return $result['success'] ? Command::SUCCESS : Command::FAILURE;
    }

    /**
     * Display AYO API configuration
     */
    protected function displayConfig(): void
    {
        $this->info('⚙️  Configuration:');
        $this->line('   Base URL: ' . config('services.ayo.base_url'));
        $this->line('   Venue Code: ' . config('services.ayo.venue_code'));
        $this->line('   API Key: ' . substr(config('services.ayo.api_key'), 0, 20) . '...');
        $this->line('   Private Key: ' . substr(config('services.ayo.private_key'), 0, 20) . '...');
    }

    /**
     * Build filters from options
     */
    protected function buildFilters(): array
    {
        $filters = [];

        if ($date = $this->option('date')) {
            $filters['date'] = $date;
        }

        if ($startDate = $this->option('start-date')) {
            $filters['start_date'] = $startDate;
        }

        if ($endDate = $this->option('end-date')) {
            $filters['end_date'] = $endDate;
        }

        if ($bookingId = $this->option('booking-id')) {
            $filters['booking_id'] = $bookingId;
        }

        if ($fieldName = $this->option('field-name')) {
            $filters['field_name'] = $fieldName;
        }

        if ($status = $this->option('status')) {
            $filters['status'] = strtoupper($status);
        }

        return $filters;
    }

    /**
     * Display API results
     */
    protected function displayResults(array $result): void
    {
        if ($result['success']) {
            $this->info('✅ Request Successful!');
            $this->newLine();

            $data = $result['data'];

            // Display response info
            $this->info('📊 Response:');
            $this->line('   Status Code: ' . $result['status_code']);
            $this->line('   Error: ' . ($data['error'] ? 'true' : 'false'));
            $this->newLine();

            // Display bookings
            if (isset($data['data']) && is_array($data['data']) && count($data['data']) > 0) {
                $this->info('📅 Bookings Found: ' . count($data['data']));
                $this->newLine();

                // Create table
                $headers = ['Booking ID', 'Field', 'Date', 'Time', 'Status'];
                $rows = [];

                foreach ($data['data'] as $booking) {
                    $rows[] = [
                        $booking['booking_id'] ?? 'N/A',
                        $booking['field_name'] ?? 'N/A',
                        $booking['date'] ?? 'N/A',
                        ($booking['start_time'] ?? 'N/A') . ' - ' . ($booking['end_time'] ?? 'N/A'),
                        $booking['status'] ?? 'N/A',
                    ];
                }

                $this->table($headers, $rows);
            } else {
                $this->warn('⚠️  No bookings found');
            }

            $this->newLine();

            // Display full JSON response
            if ($this->option('verbose')) {
                $this->info('📄 Full Response:');
                $this->line(json_encode($data, JSON_PRETTY_PRINT));
            }

        } else {
            $this->error('❌ Request Failed!');
            $this->newLine();

            $this->error('Status Code: ' . $result['status_code']);
            $this->error('Error: ' . json_encode($result['error'], JSON_PRETTY_PRINT));
        }
    }

    /**
     * Display fields results
     */
    protected function displayFieldsResults(array $result): void
    {
        if ($result['success']) {
            $this->info('✅ Request Successful!');
            $this->newLine();

            $data = $result['data'];

            // Display response info
            $this->info('📊 Response:');
            $this->line('   Status Code: ' . $result['status_code']);
            $this->line('   Error: ' . ($data['error'] ? 'true' : 'false'));
            $this->newLine();

            // Display fields
            if (isset($data['data']) && is_array($data['data']) && count($data['data']) > 0) {
                $this->info('🏟️  Fields Found: ' . count($data['data']));
                $this->newLine();

                // Create table
                $headers = ['ID', 'Name', 'Sport', 'Status', 'Active', 'Permanent'];
                $rows = [];

                foreach ($data['data'] as $field) {
                    $rows[] = [
                        $field['id'] ?? 'N/A',
                        $field['name'] ?? 'N/A',
                        $field['sport_name'] ?? 'N/A',
                        $field['status'] ?? 'N/A',
                        ($field['is_active'] ?? 0) ? '✅' : '❌',
                        ($field['is_permanent_active'] ?? 0) ? '✅' : '❌',
                    ];
                }

                $this->table($headers, $rows);
            } else {
                $this->warn('⚠️  No fields found');
            }

            $this->newLine();

            // Display full JSON response
            if ($this->option('verbose')) {
                $this->info('📄 Full Response:');
                $this->line(json_encode($data, JSON_PRETTY_PRINT));
            }

        } else {
            $this->error('❌ Request Failed!');
            $this->newLine();

            $this->error('Status Code: ' . $result['status_code']);
            $this->error('Error: ' . json_encode($result['error'], JSON_PRETTY_PRINT));
        }
    }
}
