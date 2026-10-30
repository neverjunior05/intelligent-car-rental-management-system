"use client";

import { useState, useEffect, useCallback } from "react";
import {
  rentalStore,
  FleetVehicle,
  BookingRecord,
  UserAccount,
  HandoverRecord,
  MaintenanceJob,
  SystemNotification,
  ActivityLog,
  PricingConfig,
  RentalLocation,
} from "./rentalStore";

export function useRentalStore() {
  const [fleet, setFleet] = useState<FleetVehicle[]>(() => rentalStore.getFleet());
  const [bookings, setBookings] = useState<BookingRecord[]>(() => rentalStore.getBookings());
  const [users, setUsers] = useState<UserAccount[]>(() => rentalStore.getUsers());
  const [handovers, setHandovers] = useState<HandoverRecord[]>(() => rentalStore.getHandovers());
  const [maintenanceJobs, setMaintenanceJobs] = useState<MaintenanceJob[]>(() => rentalStore.getMaintenanceJobs());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => rentalStore.getNotifications());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => rentalStore.getActivityLogs());
  const [pricing, setPricing] = useState<PricingConfig>(() => rentalStore.getPricing());
  const [locations, setLocations] = useState<RentalLocation[]>(() => rentalStore.getLocations());

  const refresh = useCallback(() => {
    setFleet(rentalStore.getFleet());
    setBookings(rentalStore.getBookings());
    setUsers(rentalStore.getUsers());
    setHandovers(rentalStore.getHandovers());
    setMaintenanceJobs(rentalStore.getMaintenanceJobs());
    setNotifications(rentalStore.getNotifications());
    setActivityLogs(rentalStore.getActivityLogs());
    setPricing(rentalStore.getPricing());
    setLocations(rentalStore.getLocations());
  }, []);

  useEffect(() => {
    refresh();

    // Listen for custom store updates in this window
    const handleLocalUpdate = () => refresh();
    window.addEventListener("veloce_store_updated", handleLocalUpdate);

    // Listen for cross-tab storage changes
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("veloce_")) {
        refresh();
      }
    };
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("veloce_store_updated", handleLocalUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refresh]);

  return {
    fleet,
    bookings,
    users,
    handovers,
    maintenanceJobs,
    notifications,
    activityLogs,
    pricing,
    locations,
    refresh,
    actions: rentalStore,
  };
}
