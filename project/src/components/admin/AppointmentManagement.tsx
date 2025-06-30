import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, MessageCircle, X } from 'lucide-react';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface Appointment {
  id: string;
  user_id: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    whatsapp: string;
  };
}

export const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          users(first_name, last_name, email, whatsapp)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const updateAppointment = async (appointmentId: string, status: 'confirmed' | 'cancelled', notes?: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status, 
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      await fetchAppointments();
      setSelectedAppointment(null);
      alert(`Appointment ${status} successfully!`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const openWhatsAppChat = (whatsappNumber: string, userName: string) => {
    const message = encodeURIComponent(`Hello ${userName}! This is TrustMission support regarding your appointment request. How can we help you?`);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Appointment Management</h2>
        
        {/* Filter Tabs */}
        <div className="flex rounded-lg bg-gray-800 p-1">
          {[
            { key: 'all', label: 'All', count: appointments.length },
            { key: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
            { key: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length },
            { key: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {appointment.users?.first_name} {appointment.users?.last_name}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300"><strong>Email:</strong> {appointment.users?.email}</p>
                  <p className="text-gray-300"><strong>WhatsApp:</strong> {appointment.users?.whatsapp}</p>
                  <p className="text-gray-300"><strong>Date:</strong> {appointment.preferred_date}</p>
                  <p className="text-gray-300"><strong>Time:</strong> {appointment.preferred_time}</p>
                  {appointment.message && (
                    <p className="text-gray-300"><strong>Message:</strong> {appointment.message}</p>
                  )}
                  <p className="text-gray-300">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      appointment.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : appointment.status === 'confirmed'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {appointment.status}
                    </span>
                  </p>
                  <p className="text-gray-300"><strong>Requested:</strong> {new Date(appointment.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {appointment.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateAppointment(appointment.id, 'confirmed')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    onClick={() => updateAppointment(appointment.id, 'cancelled')}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => setSelectedAppointment(appointment)}
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  onClick={() => openWhatsAppChat(
                    appointment.users?.whatsapp || '', 
                    `${appointment.users?.first_name} ${appointment.users?.last_name}`
                  )}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Appointment Details
              </h3>
              <Button onClick={() => setSelectedAppointment(null)} variant="ghost" size="sm" className="text-gray-400">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h4 className="font-medium text-white mb-3">User Information</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300"><strong>Name:</strong> {selectedAppointment.users?.first_name} {selectedAppointment.users?.last_name}</p>
                    <p className="text-gray-300"><strong>Email:</strong> {selectedAppointment.users?.email}</p>
                    <p className="text-gray-300"><strong>WhatsApp:</strong> {selectedAppointment.users?.whatsapp}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h4 className="font-medium text-white mb-3">Appointment Details</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="text-gray-300"><strong>Preferred Date:</strong> {selectedAppointment.preferred_date}</p>
                  <p className="text-gray-300"><strong>Preferred Time:</strong> {selectedAppointment.preferred_time}</p>
                  <p className="text-gray-300"><strong>Requested:</strong> {new Date(selectedAppointment.created_at).toLocaleString()}</p>
                  <p className="text-gray-300">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedAppointment.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : selectedAppointment.status === 'confirmed'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {selectedAppointment.status}
                    </span>
                  </p>
                  {selectedAppointment.message && (
                    <div>
                      <p className="text-gray-300 font-medium">Message:</p>
                      <p className="text-gray-300 mt-1 p-2 bg-gray-700/50 rounded">{selectedAppointment.message}</p>
                    </div>
                  )}
                  {selectedAppointment.admin_notes && (
                    <div>
                      <p className="text-gray-300 font-medium">Admin Notes:</p>
                      <p className="text-gray-300 mt-1 p-2 bg-gray-700/50 rounded">{selectedAppointment.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateAppointment(selectedAppointment.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Appointment
                    </Button>
                    <Button
                      onClick={() => updateAppointment(selectedAppointment.id, 'cancelled')}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => openWhatsAppChat(
                    selectedAppointment.users?.whatsapp || '', 
                    `${selectedAppointment.users?.first_name} ${selectedAppointment.users?.last_name}`
                  )}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};