import { getSupabase } from './supabase';
import { store } from './store';
import { EmergencyVehicle, VehicleStatus, VehicleType } from '../types';

export class VehicleService {
  public async getVehicles(): Promise<EmergencyVehicle[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('emergency_vehicles').select('*');
      if (data && !error) {
        return data.map(v => ({
          id: v.id,
          vehicleNumber: v.vehicle_number,
          vehicleType: v.vehicle_type as VehicleType,
          operatorId: v.operator_id,
          status: v.status as VehicleStatus,
          currentLatitude: v.current_latitude,
          currentLongitude: v.current_longitude,
          destination: v.destination,
          createdAt: v.created_at
        }));
      }
    }
    return store.getVehicles();
  }

  public async getVehicleById(id: string): Promise<EmergencyVehicle | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('emergency_vehicles')
        .select('*')
        .eq('id', id)
        .single();
      if (data && !error) {
        return {
          id: data.id,
          vehicleNumber: data.vehicle_number,
          vehicleType: data.vehicle_type as VehicleType,
          operatorId: data.operator_id,
          status: data.status as VehicleStatus,
          currentLatitude: data.current_latitude,
          currentLongitude: data.current_longitude,
          destination: data.destination,
          createdAt: data.created_at
        };
      }
    }
    return store.getVehicleById(id);
  }

  public async updateVehicle(id: string, updates: Partial<EmergencyVehicle>): Promise<EmergencyVehicle | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.currentLatitude) dbUpdates.current_latitude = updates.currentLatitude;
      if (updates.currentLongitude) dbUpdates.current_longitude = updates.currentLongitude;
      if (updates.destination) dbUpdates.destination = updates.destination;

      await supabase.from('emergency_vehicles').update(dbUpdates).eq('id', id);
    }
    return store.updateVehicle(id, updates);
  }
}

export const vehicleService = new VehicleService();
