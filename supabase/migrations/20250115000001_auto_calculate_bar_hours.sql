-- Función para calcular automáticamente bar_hours cuando cambian bar_start o bar_end
CREATE OR REPLACE FUNCTION calculate_bar_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Si bar_start y bar_end están definidos, calcular bar_hours automáticamente
  IF NEW.bar_start IS NOT NULL AND NEW.bar_end IS NOT NULL THEN
    DECLARE
      start_minutes INTEGER;
      end_minutes INTEGER;
      duration_minutes INTEGER;
    BEGIN
      -- Convertir tiempos a minutos desde medianoche
      start_minutes := EXTRACT(HOUR FROM NEW.bar_start) * 60 + EXTRACT(MINUTE FROM NEW.bar_start);
      end_minutes := EXTRACT(HOUR FROM NEW.bar_end) * 60 + EXTRACT(MINUTE FROM NEW.bar_end);
      
      -- Si end_time es menor que start_time, asumimos que cruza medianoche
      IF end_minutes < start_minutes THEN
        end_minutes := end_minutes + (24 * 60);
      END IF;
      
      -- Calcular duración en minutos y convertir a horas (redondeado)
      duration_minutes := end_minutes - start_minutes;
      NEW.bar_hours := GREATEST(1, ROUND(duration_minutes::NUMERIC / 60));
      
      RAISE NOTICE 'Auto-calculado bar_hours: % (de % a %)', NEW.bar_hours, NEW.bar_start, NEW.bar_end;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecuta antes de INSERT o UPDATE
DROP TRIGGER IF EXISTS trigger_calculate_bar_hours ON event_timings;
CREATE TRIGGER trigger_calculate_bar_hours
  BEFORE INSERT OR UPDATE OF bar_start, bar_end
  ON event_timings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bar_hours();
