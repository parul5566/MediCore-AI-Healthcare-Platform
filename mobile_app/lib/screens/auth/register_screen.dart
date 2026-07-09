import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/app_widgets.dart';
import '../patient/patient_shell.dart';
import '../doctor/doctor_shell.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  late TabController _tabController;
  final _pageController = PageController();

  // Shared fields
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  // Patient fields
  final _dobCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  String _gender = 'Male';
  String _bloodGroup = 'A+';

  // Doctor fields
  final _specializationCtrl = TextEditingController();
  final _licenseCtrl = TextEditingController();
  final _qualificationCtrl = TextEditingController();
  final _experienceCtrl = TextEditingController();
  final _feeCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();

  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _animController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    )..forward();
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeIn);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pageController.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _phoneCtrl.dispose();
    _dobCtrl.dispose();
    _heightCtrl.dispose();
    _weightCtrl.dispose();
    _specializationCtrl.dispose();
    _licenseCtrl.dispose();
    _qualificationCtrl.dispose();
    _experienceCtrl.dispose();
    _feeCtrl.dispose();
    _bioCtrl.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<ApiService>();
    final isDoctor = _tabController.index == 1;

    final userData = <String, dynamic>{
      'firstName': _firstNameCtrl.text.trim(),
      'lastName': _lastNameCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'password': _passwordCtrl.text,
      'phone': _phoneCtrl.text.trim(),
      'role': isDoctor ? 'DOCTOR' : 'PATIENT',
    };

    if (!isDoctor) {
      userData['dateOfBirth'] = _dobCtrl.text;
      userData['gender'] = _gender;
      userData['bloodGroup'] = _bloodGroup;
      userData['height'] = double.tryParse(_heightCtrl.text) ?? 0;
      userData['weight'] = double.tryParse(_weightCtrl.text) ?? 0;
    } else {
      userData['specialization'] = _specializationCtrl.text.trim();
      userData['licenseNumber'] = _licenseCtrl.text.trim();
      userData['qualification'] = _qualificationCtrl.text.trim();
      userData['experience'] = int.tryParse(_experienceCtrl.text) ?? 0;
      userData['consultationFee'] = double.tryParse(_feeCtrl.text) ?? 0;
      userData['bio'] = _bioCtrl.text.trim();
    }

    final success = await auth.register(userData);
    if (success && mounted) {
      final target = isDoctor ? const DoctorShell() : const PatientShell();
      Navigator.pushAndRemoveUntil(context,
        PageRouteBuilder(
          pageBuilder: (_, a, __) => target,
          transitionsBuilder: (_, a, __, child) => FadeTransition(opacity: a, child: child),
          transitionDuration: const Duration(milliseconds: 500),
        ),
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Registration failed'),
          backgroundColor: AppTheme.danger,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<ApiService>();
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.darkGradient),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnim,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Text('Create Account', style: TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white,
                      )),
                    ],
                  ),
                ),
                // Role selector tabs
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      labelColor: Colors.white,
                      unselectedLabelColor: Colors.white70,
                      dividerColor: Colors.transparent,
                      tabs: const [
                        Tab(icon: Icon(Icons.person), text: 'Patient'),
                        Tab(icon: Icon(Icons.medical_services), text: 'Doctor'),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  child: Form(
                    key: _formKey,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildPatientForm(auth),
                        _buildDoctorForm(auth),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _inputField(TextEditingController controller, String label, IconData icon,
      {bool obscure = false, String? Function(String?)? validator, TextInputType? keyboardType}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        obscureText: obscure,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70),
          prefixIcon: Icon(icon, color: Colors.white70),
          enabledBorder: const OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
            borderSide: BorderSide(color: Colors.white24),
          ),
          focusedBorder: const OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
            borderSide: BorderSide(color: AppTheme.primaryLight, width: 2),
          ),
        ),
        validator: validator,
      ),
    );
  }

  Widget _buildPatientForm(ApiService auth) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _inputField(_firstNameCtrl, 'First Name', Icons.person_outline,
          validator: (v) => v!.isEmpty ? 'Required' : null),
        _inputField(_lastNameCtrl, 'Last Name', Icons.person_outline,
          validator: (v) => v!.isEmpty ? 'Required' : null),
        _inputField(_emailCtrl, 'Email', Icons.email_outlined, keyboardType: TextInputType.emailAddress,
          validator: (v) => v!.isEmpty || !v.contains('@') ? 'Valid email required' : null),
        _inputField(_passwordCtrl, 'Password', Icons.lock_outline, obscure: true,
          validator: (v) => v!.length < 6 ? 'Min 6 characters' : null),
        _inputField(_phoneCtrl, 'Phone', Icons.phone, keyboardType: TextInputType.phone),
        _inputField(_dobCtrl, 'Date of Birth (YYYY-MM-DD)', Icons.cake, keyboardType: TextInputType.datetime),
        // Gender dropdown
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: DropdownButtonFormField<String>(
            value: _gender,
            dropdownColor: const Color(0xFF1E293B),
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Gender',
              labelStyle: TextStyle(color: Colors.white70),
              prefixIcon: Icon(Icons.wc, color: Colors.white70),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(16)),
                borderSide: BorderSide(color: Colors.white24),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(16)),
                borderSide: BorderSide(color: AppTheme.primaryLight, width: 2),
              ),
            ),
            items: ['Male', 'Female', 'Other'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
            onChanged: (v) => setState(() => _gender = v!),
          ),
        ),
        // Blood group dropdown
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: DropdownButtonFormField<String>(
            value: _bloodGroup,
            dropdownColor: const Color(0xFF1E293B),
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Blood Group',
              labelStyle: TextStyle(color: Colors.white70),
              prefixIcon: Icon(Icons.bloodtype, color: Colors.white70),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(16)),
                borderSide: BorderSide(color: Colors.white24),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(16)),
                borderSide: BorderSide(color: AppTheme.primaryLight, width: 2),
              ),
            ),
            items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                .map((b) => DropdownMenuItem(value: b, child: Text(b))).toList(),
            onChanged: (v) => setState(() => _bloodGroup = v!),
          ),
        ),
        Row(
          children: [
            Expanded(child: _inputField(_heightCtrl, 'Height (cm)', Icons.height, keyboardType: TextInputType.number)),
            const SizedBox(width: 12),
            Expanded(child: _inputField(_weightCtrl, 'Weight (kg)', Icons.monitor_weight, keyboardType: TextInputType.number)),
          ],
        ),
        const SizedBox(height: 16),
        GradientButton(label: 'Create Patient Account', icon: Icons.person_add, isLoading: auth.isLoading, onPressed: _register),
      ],
    );
  }

  Widget _buildDoctorForm(ApiService auth) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _inputField(_firstNameCtrl, 'First Name', Icons.person_outline, validator: (v) => v!.isEmpty ? 'Required' : null),
        _inputField(_lastNameCtrl, 'Last Name', Icons.person_outline, validator: (v) => v!.isEmpty ? 'Required' : null),
        _inputField(_emailCtrl, 'Email', Icons.email_outlined, keyboardType: TextInputType.emailAddress,
          validator: (v) => v!.isEmpty || !v.contains('@') ? 'Valid email required' : null),
        _inputField(_passwordCtrl, 'Password', Icons.lock_outline, obscure: true, validator: (v) => v!.length < 6 ? 'Min 6 characters' : null),
        _inputField(_phoneCtrl, 'Phone', Icons.phone, keyboardType: TextInputType.phone),
        _inputField(_specializationCtrl, 'Specialization', Icons.medical_services, validator: (v) => v!.isEmpty ? 'Required' : null),
        _inputField(_licenseCtrl, 'License Number', Icons.badge, validator: (v) => v!.isEmpty ? 'Required' : null),
        _inputField(_qualificationCtrl, 'Qualification (e.g., MBBS, MD)', Icons.school),
        _inputField(_experienceCtrl, 'Years of Experience', Icons.work, keyboardType: TextInputType.number),
        _inputField(_feeCtrl, 'Consultation Fee', Icons.attach_money, keyboardType: TextInputType.number),
        _inputField(_bioCtrl, 'Bio', Icons.info_outline, keyboardType: TextInputType.multiline),
        const SizedBox(height: 16),
        GradientButton(label: 'Create Doctor Account', icon: Icons.medical_information, isLoading: auth.isLoading, onPressed: _register),
      ],
    );
  }
}
