<?php

namespace Tests\Http\Middlewares;

use App\Models\Snapshot;
use App\Models\User;
use Tests\TestCaseWithAuthDisabled;

class ApiAuthMiddlewareTest extends TestCaseWithAuthDisabled
{
    public function setUp()
    {
        parent::setUp();

        $this->user = factory(User::class)->create(
            ['name' => 'Test User']
        );
    }

    /**
     * Simply hit a normally protected endpoint and assert that a 200 is returned
     * rather than a 401 when auth is disabled.
     *
     * @test
     */
    public function shouldAllowAccessToProtectedEndpointIfAuthIsDisabled()
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
    }
}
