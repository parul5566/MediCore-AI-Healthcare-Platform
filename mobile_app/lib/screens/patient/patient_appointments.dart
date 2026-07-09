import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/app_widgets.dart';

class PatientAppointments extends StatefulWidget {
  const PatientAppointments({super.key});

  @override
  State<PatientAppointments> createState() => _PatientAppointmentsState();
}

class _PatientAppointmentsState extends State<PatientAppointments>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<AppointmentModel> _appointments = [];
  List<DoctorModel> _doctors = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final auth = context.read<ApiService>();
      final appts = await auth.getAppointments();
      final docs = await auth.getDoctors();
      setState(() { _appointments = appts; _doctors = docs; _isLoading = false; });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          tabs: const [
            Tab(icon: Icon(Icons.calendar_month), text: 'My Appointments'),
            Tab(icon: Icon(Icons.add_circle), text: 'Book New'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [_buildAppointmentList(), _buildBookTab()],
            ),
    );
  }

  Widget _buildAppointmentList() {
    if (_appointments.isEmpty) {
      return const EmptyState(
        title: 'No Appointments',
        message: 'Book an appointment with a doctor to get started.',
        icon: Icons.calendar_month_outlined,
      );
    }
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _appointments.length,
        itemBuilder: (context, index) {
          final appt = _appointments[index];
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
                          backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                          child: const Icon(Icons.person, color: AppTheme.primary),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(appt.doctorName ?? 'Doctor',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text(appt.type == 'VIDEO' ? 'Video Consultation' : 'In-Person Visit',
                                style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                            ],
                          ),
                        ),
                        StatusBadge(status: appt.status),
                      ],
                    ),
                    const Divider(height: 20),
                    Row(
                      children: [
                        Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 6),
                        Text('${appt.date.day}/${appt.date.month}/${appt.date.year}',
                          style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                        const SizedBox(width: 16),
                        Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 6),
                        Text(appt.time, style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                      ],
                    ),
                    if (appt.reason != null && appt.reason!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text('Reason: ${appt.reason}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                    ],
                    if (appt.status == 'PENDING' || appt.status == 'CONFIRMED') ...[
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => _cancelAppointment(appt.id),
                        icon: const Icon(Icons.cancel, size: 18),
                        label: const Text('Cancel'),
                        style: OutlinedButton.styleFrom(foregroundColor: AppTheme.danger),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBookTab() {
    if (_doctors.isEmpty) {
      return const EmptyState(title: 'No Doctors Available', icon: Icons.medical_services_outlined);
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _doctors.length,
      itemBuilder: (context, index) {
        final doc = _doctors[index];
        return AnimatedListItem(
          index: index,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassCard(
              onTap: () => _showBookingSheet(doc),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                    child: Text(doc.name.split(' ').last[0],
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(doc.specialization, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.star, size: 14, color: Colors.amber[600]),
                            const SizedBox(width: 4),
                            Text(doc.rating.toStringAsFixed(1),
                              style: const TextStyle(fontSize: 12)),
                            const SizedBox(width: 12),
                            if (doc.verified)
                              const Row(children: [
                                Icon(Icons.verified, size: 14, color: AppTheme.success),
                                SizedBox(width: 4),
                                Text('Verified', style: TextStyle(fontSize: 12, color: AppTheme.success)),
                              ]),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('\$${doc.consultationFee.toStringAsFixed(0)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primary)),
                      const SizedBox(height: 4),
                      const Icon(Icons.arrow_forward_ios, size: 14),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showBookingSheet(DoctorModel doctor) {
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    TimeOfDay selectedTime = const TimeOfDay(hour: 10, minute: 0);
    String type = 'IN_PERSON';
    final reasonCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40, height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Text('Book with ${doctor.name}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  // Date picker
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.calendar_today, color: AppTheme.primary),
                    title: Text('${selectedDate.day}/${selectedDate.month}/${selectedDate.year}'),
                    trailing: const Icon(Icons.edit),
                    onTap: () async {
                      final d = await showDatePicker(
                        context: context,
                        initialDate: selectedDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (d != null) setSheetState(() => selectedDate = d);
                    },
                  ),
                  // Time picker
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.access_time, color: AppTheme.primary),
                    title: Text('${selectedTime.hour}:${selectedTime.minute.toString().padLeft(2, '0')}'),
                    trailing: const Icon(Icons.edit),
                    onTap: () async {
                      final t = await showTimePicker(context: context, initialTime: selectedTime);
                      if (t != null) setSheetState(() => selectedTime = t);
                    },
                  ),
                  // Type toggle
                  Row(
                    children: [
                      ChoiceChip(label: const Text('In-Person'), selected: type == 'IN_PERSON',
                        onSelected: (_) => setSheetState(() => type = 'IN_PERSON')),
                      const SizedBox(width: 8),
                      ChoiceChip(label: const Text('Video'), selected: type == 'VIDEO',
                        onSelected: (_) => setSheetState(() => type = 'VIDEO')),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: reasonCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Reason for visit',
                      prefixIcon: Icon(Icons.note_alt),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 24),
                  GradientButton(
                    label: 'Confirm Booking',
                    icon: Icons.check_circle,
                    onPressed: () async {
                      try {
                        final auth = context.read<ApiService>();
                        await auth.createAppointment(
                          doctorId: doctor.id,
                          date: selectedDate.toIso8601String(),
                          time: '${selectedTime.hour}:${selectedTime.minute.toString().padLeft(2, '0')}',
                          type: type,
                          reason: reasonCtrl.text,
                        );
                        if (context.mounted) {
                          Navigator.pop(context);
                          _loadData();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Appointment booked!'), backgroundColor: AppTheme.success),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Booking failed: $e'), backgroundColor: AppTheme.danger),
                          );
                        }
                      }
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _cancelAppointment(String id) async {
    try {
      await context.read<ApiService>().updateAppointmentStatus(id, 'CANCELLED');
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cancel failed: $e'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }
}
