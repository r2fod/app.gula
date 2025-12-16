-- Habilitar Realtime para las tablas principales
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_timings;
ALTER PUBLICATION supabase_realtime ADD TABLE beverages;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE supplies;
ALTER PUBLICATION supabase_realtime ADD TABLE allergies;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE event_features;
ALTER PUBLICATION supabase_realtime ADD TABLE corners;
ALTER PUBLICATION supabase_realtime ADD TABLE room_equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE event_staff;
ALTER PUBLICATION supabase_realtime ADD TABLE rentals;
ALTER PUBLICATION supabase_realtime ADD TABLE furniture;
ALTER PUBLICATION supabase_realtime ADD TABLE other_requirements;
