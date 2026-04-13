-- 08_distance_function.sql

-- Creates a remote procedure call (RPC) we can trigger directly from the mobile app's JS
-- It calculates the spherical distance between the searching user and the entire profiles table
CREATE OR REPLACE FUNCTION get_users_in_range(
  origin_lat double precision,
  origin_lon double precision,
  max_distance_miles double precision
)
RETURNS TABLE (returned_user_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT user_id
  FROM profiles
  WHERE latitude IS NOT NULL 
    AND longitude IS NOT NULL
    AND (
      -- Haversine Formula with clamping to prevent float inaccuracies from crashing 'acos'
      3959 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(origin_lat)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(origin_lon)) +
          sin(radians(origin_lat)) * sin(radians(latitude))
        ))
      )
    ) <= max_distance_miles;
END;
$$ LANGUAGE plpgsql STABLE;
