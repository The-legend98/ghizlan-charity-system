<?php

namespace Database\Factories;

use App\Models\Request;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Request>
 */
class RequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
   public function definition(): array
{
    return [
        'full_name'      => $this->faker->name(),
        'phone'          => '09' . $this->faker->numerify('########'),
        'age'            => $this->faker->numberBetween(18, 70),
        'gender'         => $this->faker->randomElement(['male', 'female']),
        'family_members' => $this->faker->numberBetween(1, 10),
        'children_count' => $this->faker->numberBetween(0, 5),
        'housing_status' => $this->faker->randomElement(['owned', 'rented', 'other']),
        'region'         => $this->faker->randomElement(['دمشق', 'حلب', 'حمص', 'حماة']),
        'assistance_type'=> $this->faker->randomElement(['medical', 'education', 'financial']),
        'description'    => $this->faker->sentence(10),
        'status'         => 'new',
        'priority'       => 'normal',
        'ref_number'     => 'GH-' . $this->faker->numerify('#######'),
    ];
}
}
