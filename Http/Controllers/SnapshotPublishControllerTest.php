<?php

namespace Tests\Feature\Http\Controllers;

use App\Constants\SnapshotStatus;
use App\Models\Snapshot;
use App\Models\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class SnapshotPublishControllerTest extends TestCase
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
     *
     * Publish snapshot
     *
     * @return void
     */
    public function publish()
    {
        $this->actingAs($this->user);

        $snapshot = Snapshot::create([
            'user_id' => $this->user->id,
            'status'  => SnapshotStatus::PROPOSED,
        ]);

        $response = $this->json('POST', route('api.snapshots.publish', ['id' => $snapshot->id]));
        $actual = json_decode($response->getContent(), true);
        $expected = [
            'status' => 'success',
        ];

        $this->assertEquals($expected, $actual);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseHas(
            'snapshots',
            ['status' => SnapshotStatus::PUBLISHED]
        );
    }
}
