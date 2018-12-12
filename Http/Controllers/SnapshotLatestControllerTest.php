<?php

namespace Tests\Feature\Http\Controllers;

use App\Constants\SnapshotStatus;
use App\Models\Snapshot;
use App\Models\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class SnapshotLatestControllerTest extends TestCase
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
    public function shouldReturn404WithInitialCaseWithoutSnapshots()
    {
        $response = $this->json('GET', route('api.snapshots.latest'), []);
        $decoded = json_decode($response->getContent(), true);

        $this->assertEquals(trans('exceptions.snapshot-not-found'), $decoded['errors'][0]['detail']);
        $response->assertStatus(404);
    }

    /**
     * @test
     */
    public function shouldReturnLatestSnapshotIdAndStatus()
    {
        factory(Snapshot::class)->create();
        $response = $this->json('GET', route('api.snapshots.latest'));

        $jsonStructure = [
            'id',
            'status',
            'user_id',
            'created_at',
            'updated_at',
        ];
        $response
            ->assertStatus(200)
            ->assertJsonStructure($jsonStructure);

        $data = json_decode($response->getContent(), true);

        $this->assertEquals(1, $data['id']);
        $this->assertEquals(SnapshotStatus::PROCESSING, $data['status']);
        $this->assertEquals(1, $data['user_id']);
    }
}
