import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/app_widgets.dart';
import '../auth/login_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          const AdminDashboard(),
          const AdminUsers(),
          const AdminProfile(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Users'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────
class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
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
                title: const Text('Admin Dashboard',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                background: Container(decoration: const BoxDecoration(gradient: AppTheme.darkGradient)),
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
                    StatCard(title: 'Total Users', value: '${_data?['stats']?['totalUsers'] ?? 0}',
                      icon: Icons.people, gradient: AppTheme.primaryGradient),
                    StatCard(title: 'Doctors', value: '${_data?['stats']?['totalDoctors'] ?? 0}',
                      icon: Icons.medical_services, gradient: AppTheme.accentGradient),
                    StatCard(title: 'Patients', value: '${_data?['stats']?['totalPatients'] ?? 0}',
                      icon: Icons.person, gradient: AppTheme.successGradient),
                    StatCard(title: 'Appointments', value: '${_data?['stats']?['totalAppointments'] ?? 0}',
                      icon: Icons.calendar_today, gradient: AppTheme.warningGradient),
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
                        const Text('Recent Users', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        if ((_data?['recentUsers'] as List?)?.isEmpty ?? true)
                          const Text('No users yet', style: TextStyle(color: Colors.grey))
                        else
                          ...(_data!['recentUsers'] as List).take(10).map((u) => _buildUserItem(u)),
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

  Widget _buildUserItem(dynamic u) {
    final user = u as Map<String, dynamic>;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
            child: Text((user['firstName'] ?? 'U')[0].toUpperCase(),
              style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${user['firstName']} ${user['lastName']}',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(user['email'] ?? '', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              ],
            ),
          ),
          StatusBadge(status: user['role'] ?? 'USER'),
        ],
      ),
    );
  }
}

// ─── ADMIN USERS ───────────────────────────────────────────────
class AdminUsers extends StatefulWidget {
  const AdminUsers({super.key});

  @override
  State<AdminUsers> createState() => _AdminUsersState();
}

class _AdminUsersState extends State<AdminUsers> {
  List<UserModel> _users = [];
  bool _isLoading = true;
  String _roleFilter = '';
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    try {
      final users = await context.read<ApiService>().getAdminUsers(
        role: _roleFilter.isEmpty ? null : _roleFilter,
        search: _searchCtrl.text.isEmpty ? null : _searchCtrl.text,
      );
      setState(() { _users = users; _isLoading = false; });
    } catch (_) { setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    decoration: InputDecoration(
                      hintText: 'Search users...',
                      prefixIcon: const Icon(Icons.search),
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                    ),
                    onSubmitted: (_) => _loadUsers(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Role filter chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _filterChip('All', ''),
                  _filterChip('Patients', 'PATIENT'),
                  _filterChip('Doctors', 'DOCTOR'),
                  _filterChip('Admins', 'SUPER_ADMIN'),
                ],
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty
                    ? const EmptyState(title: 'No Users Found', icon: Icons.people_outline)
                    : RefreshIndicator(
                        onRefresh: _loadUsers,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _users.length,
                          itemBuilder: (context, index) {
                            final u = _users[index];
                            return AnimatedListItem(
                              index: index,
                              child: Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: GlassCard(
                                  padding: const EdgeInsets.all(16),
                                  child: Row(
                                    children: [
                                      CircleAvatar(
                                        backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                                        child: Text(u.firstName.isNotEmpty ? u.firstName[0] : 'U',
                                          style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(u.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                            Text(u.email, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                            const SizedBox(height: 4),
                                            Row(
                                              children: [
                                                StatusBadge(status: u.role),
                                                const SizedBox(width: 8),
                                                if (u.role == 'DOCTOR' && u.doctor?.verified != true)
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: AppTheme.warning.withValues(alpha: 0.15),
                                                      borderRadius: BorderRadius.circular(12),
                                                    ),
                                                    child: const Text('Unverified', style: TextStyle(
                                                      fontSize: 11, color: AppTheme.warning)),
                                                  ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      PopupMenuButton<String>(
                                        onSelected: (value) => _changeStatus(u.id, value),
                                        itemBuilder: (_) => [
                                          const PopupMenuItem(value: 'ACTIVE', child: Text('Activate')),
                                          const PopupMenuItem(value: 'SUSPENDED', child: Text('Suspend')),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final isSelected = _roleFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) {
          setState(() => _roleFilter = value);
          _loadUsers();
        },
      ),
    );
  }

  Future<void> _changeStatus(String userId, String status) async {
    try {
      await context.read<ApiService>().updateUserStatus(userId, status);
      _loadUsers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User status updated to $status'), backgroundColor: AppTheme.success),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }
}

// ─── ADMIN PROFILE ─────────────────────────────────────────────
class AdminProfile extends StatelessWidget {
  const AdminProfile({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().user;
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassCard(
            gradient: AppTheme.darkGradient,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.admin_panel_settings, size: 40, color: Colors.white),
                ),
                const SizedBox(height: 12),
                Text(user?.fullName ?? 'Admin', style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white,
                )),
                const SizedBox(height: 4),
                Text(user?.email ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.8))),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _infoRow('Role', 'Super Admin', Icons.admin_panel_settings),
                const Divider(),
                _infoRow('Email', user?.email ?? 'N/A', Icons.email),
                const Divider(),
                _infoRow('Phone', user?.phone ?? 'N/A', Icons.phone),
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

  Widget _infoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
