import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/app_widgets.dart';
import '../auth/login_screen.dart';

class DoctorShell extends StatefulWidget {
  const DoctorShell({super.key});

  @override
  State<DoctorShell> createState() => _DoctorShellState();
}

class _DoctorShellState extends State<DoctorShell> {
  int _currentIndex = 0;
  late List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const DoctorDashboard(),
      const DoctorAppointments(),
      const DoctorPatients(),
      const DoctorProfile(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month_outlined), activeIcon: Icon(Icons.calendar_month), label: 'Appts'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Patients'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

// ─── DOCTOR DASHBOARD ──────────────────────────────────────────
class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});

  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  Map<String, dynamic>? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await context.read<ApiService>().getDashboard();
      setState(() { _data = data; _isLoading = false; });
    } catch (_) { setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().user;
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 120,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: const EdgeInsets.only(left: 16, bottom: 14),
                title: Text('Dr. ${user?.lastName ?? ""}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                background: Container(decoration: const BoxDecoration(gradient: AppTheme.accentGradient)),
              ),
            ),
            if (_isLoading)
              const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
            else ...[
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.1,
                  ),
                  delegate: SliverChildListDelegate([
                    StatCard(title: 'Confirmed Appts', value: '${_data?['stats']?['todayAppointments'] ?? 0}',
                      icon: Icons.check_circle, gradient: AppTheme.successGradient),
                    StatCard(title: 'Total Patients', value: '${_data?['stats']?['totalPatients'] ?? 0}',
                      icon: Icons.people, gradient: AppTheme.primaryGradient),
                    StatCard(title: 'Pending Requests', value: '${_data?['stats']?['pendingRequests'] ?? 0}',
                      icon: Icons.pending, gradient: AppTheme.warningGradient),
                    StatCard(title: 'Rating', value: user?.doctor?.rating?.toStringAsFixed(1) ?? '0.0',
                      icon: Icons.star, gradient: AppTheme.accentGradient),
                  ]),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverToBoxAdapter(
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Upcoming Appointments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        if ((_data?['upcomingAppointments'] as List?)?.isEmpty ?? true)
                          const Text('No upcoming appointments', style: TextStyle(color: Colors.grey))
                        else
                          ...(_data!['upcomingAppointments'] as List).take(5).map((a) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Row(
                              children: [
                                const Icon(Icons.person, color: AppTheme.primary),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(a['patientName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                                      Text('${a['time']} • ${a['date'].toString().substring(0, 10)}',
                                        style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                                    ],
                                  ),
                                ),
                                StatusBadge(status: a['status'] ?? 'PENDING'),
                              ],
                            ),
                          )),
                      ],
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── DOCTOR APPOINTMENTS ───────────────────────────────────────
class DoctorAppointments extends StatefulWidget {
  const DoctorAppointments({super.key});

  @override
  State<DoctorAppointments> createState() => _DoctorAppointmentsState();
}

class _DoctorAppointmentsState extends State<DoctorAppointments> {
  List<AppointmentModel> _appointments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final appts = await context.read<ApiService>().getAppointments();
      setState(() { _appointments = appts; _isLoading = false; });
    } catch (_) { setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Appointments')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _appointments.isEmpty
              ? const EmptyState(title: 'No Appointments', icon: Icons.calendar_month_outlined)
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _appointments.length,
                    itemBuilder: (context, index) {
                      final a = _appointments[index];
                      return AnimatedListItem(
                        index: index,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: GlassCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: AppTheme.accent.withValues(alpha: 0.1),
                                      child: const Icon(Icons.person, color: AppTheme.accent),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(a.patientName ?? 'Patient', style: const TextStyle(fontWeight: FontWeight.bold)),
                                          Text('${a.date.day}/${a.date.month}/${a.date.year} at ${a.time}',
                                            style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                        ],
                                      ),
                                    ),
                                    StatusBadge(status: a.status),
                                  ],
                                ),
                                if (a.reason != null && a.reason!.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Text('Reason: ${a.reason}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                ],
                                if (a.status == 'PENDING') ...[
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          onPressed: () => _updateStatus(a.id, 'CONFIRMED'),
                                          icon: const Icon(Icons.check, size: 18),
                                          label: const Text('Accept'),
                                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          onPressed: () => _updateStatus(a.id, 'CANCELLED'),
                                          icon: const Icon(Icons.close, size: 18),
                                          label: const Text('Decline'),
                                          style: OutlinedButton.styleFrom(foregroundColor: AppTheme.danger),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      await context.read<ApiService>().updateAppointmentStatus(id, status);
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }
}

// ─── DOCTOR PATIENTS ───────────────────────────────────────────
class DoctorPatients extends StatefulWidget {
  const DoctorPatients({super.key});

  @override
  State<DoctorPatients> createState() => _DoctorPatientsState();
}

class _DoctorPatientsState extends State<DoctorPatients> {
  List<AppointmentModel> _appointments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final appts = await context.read<ApiService>().getAppointments();
      setState(() { _appointments = appts; _isLoading = false; });
    } catch (_) { setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    // Extract unique patients
    final patientMap = <String, String>{};
    for (final a in _appointments) {
      if (a.patientId != null && a.patientName != null) {
        patientMap[a.patientId!] = a.patientName!;
      }
    }
    final patients = patientMap.entries.toList();

    return Scaffold(
      appBar: AppBar(title: const Text('My Patients')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : patients.isEmpty
              ? const EmptyState(title: 'No Patients Yet', icon: Icons.people_outline)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: patients.length,
                  itemBuilder: (context, index) {
                    final p = patients[index];
                    return AnimatedListItem(
                      index: index,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GlassCard(
                          onTap: () => _showPatientDetails(p.key, p.value),
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                                child: const Icon(Icons.person, color: AppTheme.primary),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(p.value, style: const TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              const Icon(Icons.arrow_forward_ios, size: 16),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  void _showPatientDetails(String patientId, String name) async {
    try {
      final auth = context.read<ApiService>();
      final records = await auth.getMedicalRecords(patientId: patientId);
      final prescriptions = await auth.getPrescriptions(patientId: patientId);
      if (!mounted) return;

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (context) => DraggableScrollableSheet(
          initialChildSize: 0.7,
          maxChildSize: 0.9,
          minChildSize: 0.3,
          expand: false,
          builder: (context, scrollController) => Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView(
                    controller: scrollController,
                    children: [
                      const Text('Medical Records', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 8),
                      if (records.isEmpty)
                        const Text('No records', style: TextStyle(color: Colors.grey))
                      else
                        ...records.map((r) => ListTile(
                          leading: const Icon(Icons.folder, color: AppTheme.primary),
                          title: Text(r.title),
                          subtitle: Text('${r.date.day}/${r.date.month}/${r.date.year}'),
                        )),
                      const SizedBox(height: 16),
                      const Text('Prescriptions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 8),
                      if (prescriptions.isEmpty)
                        const Text('No prescriptions', style: TextStyle(color: Colors.grey))
                      else
                        ...prescriptions.map((p) => ListTile(
                          leading: const Icon(Icons.medication, color: AppTheme.purple),
                          title: Text('Prescription ${p.date.day}/${p.date.month}/${p.date.year}'),
                          subtitle: Text(p.status),
                        )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load: $e'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }
}

// ─── DOCTOR PROFILE ────────────────────────────────────────────
class DoctorProfile extends StatelessWidget {
  const DoctorProfile({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().user;
    final doc = user?.doctor;
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassCard(
            gradient: AppTheme.accentGradient,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.medical_services, size: 40, color: Colors.white),
                ),
                const SizedBox(height: 12),
                Text(user?.fullName ?? 'Doctor', style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white,
                )),
                const SizedBox(height: 4),
                Text(doc?.specialization ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.8))),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.star, color: Colors.amber[100], size: 20),
                    const SizedBox(width: 4),
                    Text(doc?.rating?.toStringAsFixed(1) ?? '0.0',
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                if (doc?.verified == true)
                  _infoRow(context, 'Verified', 'Yes', Icons.verified)
                else
                  _infoRow(context, 'Verified', 'Pending', Icons.hourglass_top),
                const Divider(),
                _infoRow(context, 'License', doc?.licenseNumber ?? 'N/A', Icons.badge),
                const Divider(),
                _infoRow(context, 'Experience', '${doc?.experience ?? 0} years', Icons.work),
                const Divider(),
                _infoRow(context, 'Consultation Fee', '\$${doc?.consultationFee?.toStringAsFixed(0) ?? 0}', Icons.attach_money),
                if (doc?.qualification != null) ...[
                  const Divider(),
                  _infoRow(context, 'Qualification', doc!.qualification!, Icons.school),
                ],
                if (doc?.bio != null && doc!.bio!.isNotEmpty) ...[
                  const Divider(),
                  _infoRow(context, 'Bio', doc.bio!, Icons.info),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          GradientButton(
            label: 'Sign Out',
            icon: Icons.logout,
            gradient: LinearGradient(colors: [AppTheme.danger, AppTheme.danger.withValues(alpha: 0.8)]),
            onPressed: () async {
              await context.read<ApiService>().logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _infoRow(BuildContext context, String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          Flexible(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}