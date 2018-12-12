<?php

namespace Tests\Feature\Http\Controllers;

use App\Constants\BoundaryType;
use App\Events\SnapshotRecordCreated;
use App\Models\Snapshot;
use App\Models\SnapshotCheck;
use App\Models\SnapshotCheckResult;
use App\Models\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class SnapshotControllerTest extends TestCase
{
    use WithoutMiddleware;

    protected $user;

    /**
     * Disable Auth middleware
     *
     */
    public function setUp()
    {
        parent::setUp();

        $this->user = factory(User::class)->create(
            ['name' => 'Test User']
        );

        // disable gates for test
        Gate::before(function () {
            return true;
        });
    }

    /**
     * @test
     * Start snapshot generation and verify response
     */
    public function shouldStartSnapshotGeneration()
    {
        $this->actingAs($this->user);

        Event::fake();

        $response = $this->json('POST', route('snapshots.store'), []);
        $data = json_decode($response->getContent(), true);

        // Event assertion
        Event::assertDispatched(SnapshotRecordCreated::class, function ($e) use ($data) {
            return $e->snapshot->id === $data['id'] &&
                $e->snapshot->status === $data['status'] &&
                $e->snapshot->user_id === $data['user_id'];
        });

        $response
            ->assertStatus(200)
            ->assertJsonStructure(
                [
                    'id',
                    'status',
                    'user_id',
                    'created_at',
                    'updated_at',
                ]
            );
    }

    /**
     * @test
     */
    public function shouldReturnSnapshotWithChecksAndResults()
    {
        $snapshot = factory(Snapshot::class)->create();
        $parentCheck = factory(SnapshotCheck::class)->create();
        $subChecks = factory(SnapshotCheck::class, 2)->create(['parent_id' => $parentCheck->id]);

        $delta = [
            BoundaryType::WCA => [
                'current'  => [3, 4],
                'previous' => [],
            ],
            BoundaryType::XDA => [
                'current'  => [2],
                'previous' => [],
            ],
        ];

        foreach ([$parentCheck, $subChecks->first(), $subChecks->last()] as $check) {
            factory(SnapshotCheckResult::class)->create([
                'snapshot_id' => $snapshot->id,
                'check_id'    => $check->id,
                'delta'       => $delta,
            ]);
        }

        $response = $this->json('GET', route('snapshots.show', ['snapshot' => $snapshot->id]));


        $resultJsonStructure = ['id', 'delta_count', 'pass', 'tolerance', 'created_at', 'updated_at'];
        $jsonStructure = [
            'id',
            'status',
            'user_id',
            'created_at',
            'updated_at',
            'snapshotChecks' => [
                [
                    'id',
                    'name',
                    'description',
                    'tolerance',
                    'result'    => $resultJsonStructure,
                    'subChecks' => [
                        ['id', 'name', 'description', 'tolerance', 'result' => $resultJsonStructure],
                        ['id', 'name', 'description', 'tolerance', 'result' => $resultJsonStructure],
                    ]
                ]
            ],
        ];

        $response
            ->assertStatus(200)
            ->assertJsonStructure($jsonStructure);

        $data = json_decode($response->getContent(), true);

        $this->assertEquals(3, $data['snapshotChecks'][0]['result']['delta_count']);
        $this->assertTrue($data['snapshotChecks'][0]['result']['pass']);
        $this->assertEquals(0, $data['snapshotChecks'][0]['result']['tolerance']);
    }

    /**
     * @test
     */
    public function shouldNotCreateSnapshotIfOneAlreadyProcessing()
    {
        $this->actingAs($this->user);

        factory(Snapshot::class, 2)->create();

        Event::fake();

        $response = $this->json('POST', route('snapshots.store'), []);

        $this->assertEquals(
            "Snapshot 2 is currently being generated. Please wait until it is finished.",
            $response->exception->getMessage()
        );
        $response
            ->assertStatus(500);
    }
}
