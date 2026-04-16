<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class CharitySystemTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;
    private User $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->manager = User::factory()->create([
            'name'      => 'مدير اختبار',
            'email'     => 'manager@test.com',
            'password'  => Hash::make('password123'),
            'role'      => 'manager',
            'is_active' => true,
        ]);

        $this->employee = User::factory()->create([
            'name'      => 'موظف اختبار',
            'email'     => 'employee@test.com',
            'password'  => Hash::make('password123'),
            'role'      => 'employee',
            'is_active' => true,
        ]);
    }

    // ══════════════════════════════════════════
    // ١. اختبارات المصادقة
    // ══════════════════════════════════════════

    /** @test */
    public function manager_can_login_with_correct_credentials()
    {
        $res = $this->postJson('/api/login', [
            'email'    => 'manager@test.com',
            'password' => 'password123',
        ]);

        $res->assertStatus(200)
            ->assertJsonStructure(['token', 'user'])
            ->assertJsonPath('user.role', 'manager');
    }

    /** @test */
    public function employee_can_login_with_correct_credentials()
    {
        $res = $this->postJson('/api/login', [
            'email'    => 'employee@test.com',
            'password' => 'password123',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('user.role', 'employee');
    }

    /** @test */
    public function login_fails_with_wrong_password()
    {
        $res = $this->postJson('/api/login', [
            'email'    => 'manager@test.com',
            'password' => 'wrongpassword',
        ]);

        $res->assertStatus(422);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_requests()
    {
        $this->getJson('/api/requests')->assertStatus(401);
    }

    // ══════════════════════════════════════════
    // ٢. اختبارات تقديم الطلب
    // ══════════════════════════════════════════

    /** @test */
    public function anyone_can_submit_a_request()
    {
        $res = $this->postJson('/api/requests', [
            'full_name'      => 'أحمد محمد',
            'phone'          => '0912345678',
            'age'            => 35,
            'gender'         => 'male',
            'family_members' => 4,
            'children_count' => 2,
            'national_id'    => '1234567890',
            'income_range'   => 'under_1m',
            'housing_status' => 'rented',
            'region'         => 'دمشق',
            'assistance_type'=> 'medical',
            'description'    => 'أحتاج مساعدة طبية عاجلة لعملية جراحية ضرورية',
        ]);

        $res->assertStatus(201)
            ->assertJsonStructure(['message', 'request_id', 'ref_number'])
            ->assertJsonPath('message', 'تم استلام طلبك بنجاح');
    }

    /** @test */
    public function request_requires_minimum_description_length()
    {
        $res = $this->postJson('/api/requests', [
            'full_name'      => 'أحمد محمد',
            'phone'          => '0912345678',
            'age'            => 35,
            'gender'         => 'male',
            'family_members' => 4,
            'housing_status' => 'rented',
            'region'         => 'دمشق',
            'assistance_type'=> 'medical',
            'description'    => 'قصير', // أقل من 20 حرف
        ]);

        $res->assertStatus(422);
    }

    /** @test */
    public function duplicate_request_within_60_seconds_is_rejected()
    {
        $data = [
            'full_name'      => 'أحمد محمد',
            'phone'          => '0912345678',
            'age'            => 35,
            'gender'         => 'male',
            'family_members' => 4,
            'housing_status' => 'rented',
            'region'         => 'دمشق',
            'assistance_type'=> 'medical',
            'description'    => 'أحتاج مساعدة طبية عاجلة لعملية جراحية ضرورية',
        ];

        $this->postJson('/api/requests', $data)->assertStatus(201);
        $this->postJson('/api/requests', $data)->assertStatus(200)
            ->assertJsonStructure(['message', 'ref_number']);
    }

    /** @test */
    public function request_is_auto_assigned_to_employee()
    {
        $this->postJson('/api/requests', [
            'full_name'      => 'أحمد محمد',
            'phone'          => '0912345678',
            'age'            => 35,
            'gender'         => 'male',
            'family_members' => 4,
            'housing_status' => 'rented',
            'region'         => 'دمشق',
            'assistance_type'=> 'medical',
            'description'    => 'أحتاج مساعدة طبية عاجلة لعملية جراحية ضرورية',
        ]);

        $request = Request::latest()->first();
        $this->assertNotNull($request->assigned_to);
    }

    /** @test */
    public function national_id_and_income_range_are_saved_correctly()
    {
        $res = $this->postJson('/api/requests', [
            'full_name'      => 'سارة أحمد',
            'phone'          => '0987654321',
            'age'            => 28,
            'gender'         => 'female',
            'family_members' => 3,
            'national_id'    => '9876543210',
            'income_range'   => '1m_2m',
            'housing_status' => 'owned',
            'region'         => 'حلب',
            'assistance_type'=> 'education',
            'description'    => 'أحتاج دعماً تعليمياً لأطفالي الثلاثة في المرحلة الابتدائية',
        ]);

        $res->assertStatus(201);
        $request = Request::latest()->first();
        $this->assertEquals('9876543210', $request->national_id);
        $this->assertEquals('1m_2m', $request->income_range);
    }

    // ══════════════════════════════════════════
    // ٣. اختبارات التتبع
    // ══════════════════════════════════════════

    /** @test */
    public function user_can_track_request_by_ref_number()
    {
        $request = Request::factory()->create([
            'ref_number' => 'GH-1234567',
            'status'     => 'new',
        ]);

        $res =$this->getJson('/api/requests/track?query=GH-1234567');
;

        $res->assertStatus(200)
            ->assertJsonPath('ref_number', 'GH-1234567')
            ->assertJsonStructure(['id', 'ref_number', 'status', 'created_at', 'updated_at']);
    }

    /** @test */
    public function user_can_track_request_by_phone()
    {
        Request::factory()->create(['phone' => '0911111111']);

        $res = $this->getJson('/api/requests/track?query=0911111111');

        $res->assertStatus(200);
    }

    /** @test */
    public function tracking_returns_404_for_unknown_request()
    {
        $this->postJson('/api/track' , ['query' => 'GH-0000000'])
            ->assertStatus(404);
    }

    // ══════════════════════════════════════════
    // ٤. اختبارات الطلبات (Dashboard)
    // ══════════════════════════════════════════

    /** @test */
    public function manager_can_view_all_requests()
    {
        Request::factory()->count(5)->create();

        $res = $this->actingAs($this->manager)
            ->getJson('/api/requests');

        $res->assertStatus(200)
            ->assertJsonStructure(['data', 'total']);
    }

    /** @test */
    public function employee_can_only_view_assigned_requests()
    {
        // طلبات مسندة للموظف
        Request::factory()->count(3)->create(['assigned_to' => $this->employee->id]);
        // طلبات غير مسندة
        Request::factory()->count(2)->create(['assigned_to' => $this->manager->id]);

        $res = $this->actingAs($this->employee)
            ->getJson('/api/requests');

        $res->assertStatus(200);
        $this->assertCount(3, $res->json('data'));
    }

    /** @test */
    public function manager_can_update_request_status()
    {
        $request = Request::factory()->create(['status' => 'new']);

        $res = $this->actingAs($this->manager)
            ->patchJson("/api/requests/{$request->id}/status", [
                'status' => 'reviewing',
                'note'   => 'قيد المراجعة من المدير',
            ]);

        $res->assertStatus(200);
        $this->assertEquals('reviewing', $request->fresh()->status);
    }

    /** @test */
    public function employee_cannot_update_unassigned_request()
    {
        $request = Request::factory()->create([
            'assigned_to' => $this->manager->id,
            'status'      => 'new',
        ]);

        $res = $this->actingAs($this->employee)
            ->patchJson("/api/requests/{$request->id}/status", [
                'status' => 'reviewing',
            ]);

        $res->assertStatus(403);
    }

    /** @test */
    public function manager_can_filter_requests_by_status()
    {
        Request::factory()->count(3)->create(['status' => 'new']);
        Request::factory()->count(2)->create(['status' => 'approved']);

        $res = $this->actingAs($this->manager)
            ->getJson('/api/requests?status=new');

        $res->assertStatus(200);
        $this->assertCount(3, $res->json('data'));
    }

    // ══════════════════════════════════════════
    // ٥. اختبارات الملاحظات
    // ══════════════════════════════════════════

    /** @test */
    public function employee_can_add_note_to_assigned_request()
    {
        $request = Request::factory()->create(['assigned_to' => $this->employee->id]);

        $res = $this->actingAs($this->employee)
            ->postJson("/api/requests/{$request->id}/notes", [
                'content' => 'ملاحظة داخلية مهمة',
            ]);

        $res->assertStatus(201);
        $this->assertDatabaseHas('notes', [
            'request_id' => $request->id,
            'content'    => 'ملاحظة داخلية مهمة',
        ]);
    }

    /** @test */
   
public function manager_can_delete_any_note()
{
    $request = Request::factory()->create();
    
    // ✅ أنشئ الـ note مباشرة بدل الـ relation
    $note = \App\Models\Note::create([
        'request_id' => $request->id,
        'content'    => 'ملاحظة للحذف',
        'user_id'    => $this->employee->id,
    ]);

    $res = $this->actingAs($this->manager)
        ->deleteJson("/api/requests/{$request->id}/notes/{$note->id}");

    $res->assertStatus(200);
    $this->assertDatabaseMissing('notes', ['id' => $note->id]);
}
    // ══════════════════════════════════════════
    // ٦. اختبارات إدارة المستخدمين
    // ══════════════════════════════════════════

    /** @test */
    public function manager_can_create_employee()
    {
        $res = $this->actingAs($this->manager)
            ->postJson('/api/users', [
                'name'     => 'موظف جديد',
                'email'    => 'newemployee@test.com',
                'password' => 'password123',
                'role'     => 'employee',
            ]);

        $res->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newemployee@test.com']);
    }

    /** @test */
    public function employee_cannot_create_users()
    {
        $res = $this->actingAs($this->employee)
            ->postJson('/api/users', [
                'name'     => 'موظف جديد',
                'email'    => 'newemployee@test.com',
                'password' => 'password123',
                'role'     => 'employee',
            ]);

        $res->assertStatus(403);
    }

    // ══════════════════════════════════════════
    // ٧. اختبارات التطوع
    // ══════════════════════════════════════════

    /** @test */
    public function anyone_can_submit_volunteer_request()
    {
        $res = $this->postJson('/api/volunteer', [
            'name'           => 'متطوع جديد',
            'phone'          => '0955555555',
            'email'          => 'volunteer@test.com',
            'region'         => 'دمشق',
            'volunteer_type' => 'technical',
            'availability'   => 'partial',
            'skills'         => 'برمجة وتطوير ويب',
        ]);

        $res->assertStatus(201);
    }

    /** @test */
    public function volunteer_request_requires_mandatory_fields()
    {
        $res = $this->postJson('/api/volunteer', [
            'name' => 'متطوع',
            // ناقص phone, region, volunteer_type, availability
        ]);

        $res->assertStatus(422);
    }

    // ══════════════════════════════════════════
    // ٨. اختبارات الأمان
    // ══════════════════════════════════════════

    /** @test */
    public function sql_injection_in_search_is_safe()
    {
        $res = $this->actingAs($this->manager)
            ->getJson("/api/requests?search=' OR 1=1 --");

        $res->assertStatus(200); // ما انكسر
    }

    /** @test */
    public function request_status_must_be_valid()
    {
        $request = Request::factory()->create();

        $res = $this->actingAs($this->manager)
            ->patchJson("/api/requests/{$request->id}/status", [
                'status' => 'invalid_status',
            ]);

        $res->assertStatus(422);
    }

    /** @test */
    public function income_range_must_be_valid_enum()
    {
        $res = $this->postJson('/api/requests', [
            'full_name'      => 'أحمد',
            'phone'          => '0912345678',
            'age'            => 30,
            'gender'         => 'male',
            'family_members' => 3,
            'housing_status' => 'rented',
            'region'         => 'دمشق',
            'assistance_type'=> 'medical',
            'description'    => 'وصف طويل كافٍ للاختبار هذا النص',
            'income_range'   => 'invalid_range',
        ]);

        $res->assertStatus(422);
    }
}