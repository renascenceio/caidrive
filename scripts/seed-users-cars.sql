-- Seed 20 Random Users
-- Note: These users will need to be created in auth.users first or we insert into profiles directly

INSERT INTO profiles (id, full_name, phone, nationality, address, level, total_km_traveled, bonus_km, company, avatar_url)
VALUES
  (gen_random_uuid(), 'Ahmed Al Maktoum', '+971501234567', 'UAE', 'Dubai Marina, Tower A, Apt 2301', 3, 5420, 542, NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  (gen_random_uuid(), 'Sarah Johnson', '+971502345678', 'UK', 'JBR, Rimal 3, Unit 1205', 2, 2150, 215, NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
  (gen_random_uuid(), 'Mohammed Ali Hassan', '+971503456789', 'Egypt', 'Business Bay, Executive Towers, 1805', 4, 12500, 1875, NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  (gen_random_uuid(), 'Elena Petrova', '+971504567890', 'Russia', 'Palm Jumeirah, Shoreline Apt 901', 2, 3200, 320, NULL, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
  (gen_random_uuid(), 'James Chen', '+971505678901', 'Singapore', 'DIFC, Index Tower, 3201', 5, 28000, 4200, NULL, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  (gen_random_uuid(), 'Fatima Al Rashid', '+971506789012', 'UAE', 'Jumeirah, Villa 42', 3, 6800, 680, NULL, 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150'),
  (gen_random_uuid(), 'Michael Thompson', '+971507890123', 'USA', 'Downtown Dubai, Boulevard Point 2205', 2, 1890, 189, NULL, 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150'),
  (gen_random_uuid(), 'Aisha Khalid', '+971508901234', 'Pakistan', 'Marina Walk, Iris Blue 1504', 1, 450, 45, NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  (gen_random_uuid(), 'David Miller', '+971509012345', 'Australia', 'JLT, Cluster D, Lake View Tower 1102', 2, 2400, 240, NULL, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
  (gen_random_uuid(), 'Layla Hassan', '+971500123456', 'Lebanon', 'City Walk, Al Multaqa Ave, Apt 805', 3, 5100, 510, NULL, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
  (gen_random_uuid(), 'Robert Wilson', '+971501112233', 'Canada', 'Dubai Hills, Maple 2, Villa 15', 4, 9800, 1470, NULL, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
  (gen_random_uuid(), 'Noor Al Farsi', '+971502223344', 'Oman', 'Al Barsha, First Community, 605', 1, 680, 68, NULL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
  (gen_random_uuid(), 'Pierre Dubois', '+971503334455', 'France', 'Marina Promenade, Le Reve 2801', 3, 7200, 720, NULL, 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150'),
  (gen_random_uuid(), 'Lisa Anderson', '+971504445566', 'Sweden', 'Bluewaters Island, Building 5, 1205', 2, 3400, 340, NULL, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
  (gen_random_uuid(), 'Omar Bin Khalid', '+971505556677', 'Saudi Arabia', 'Emirates Hills, Sector E, Villa 23', 5, 35000, 5250, NULL, 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'),
  (gen_random_uuid(), 'Anna Schmidt', '+971506667788', 'Germany', 'Meydan, Polo Residence 1408', 2, 2800, 280, NULL, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150'),
  (gen_random_uuid(), 'Raj Patel', '+971507778899', 'India', 'JVC, Belgravia Square 904', 1, 920, 92, NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  (gen_random_uuid(), 'Sophie Martin', '+971508889900', 'Belgium', 'Al Wasl, City Walk 1105', 3, 4600, 460, NULL, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
  (gen_random_uuid(), 'Hassan Al Sayed', '+971509990011', 'Jordan', 'Dubai Silicon Oasis, Binghatti Stars 702', 2, 1650, 165, NULL, 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150'),
  (gen_random_uuid(), 'Emma Williams', '+971500001122', 'New Zealand', 'Jumeirah Village Circle, Tower 9, 1203', 1, 350, 35, NULL, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150')
ON CONFLICT DO NOTHING;

-- Seed 20 Luxury Cars with Multiple Images
INSERT INTO vehicles (id, brand, model, year, type, daily_rate, currency, horsepower, top_speed, acceleration, transmission, fuel_type, seats, color, description, features, images, is_featured, rating, review_count, available)
VALUES
  -- Supercars
  (gen_random_uuid(), 'Ferrari', 'SF90 Stradale', 2024, 'supercar', 2500, 'AED', 986, 340, 2.5, 'Automatic', 'Hybrid', 2, 'Rosso Corsa',
   'The Ferrari SF90 Stradale represents the ultimate in hybrid supercar technology. With 986 horsepower from its twin-turbo V8 and three electric motors, it delivers unprecedented performance.',
   ARRAY['Ceramic brakes', 'Carbon fiber seats', 'Assetto Fiorano package', 'Active aerodynamics', 'Heads-up display', 'Launch control'],
   ARRAY['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   true, 4.95, 47, true),

  (gen_random_uuid(), 'Lamborghini', 'Huracán EVO', 2024, 'supercar', 2200, 'AED', 631, 325, 2.9, 'Automatic', 'Petrol', 2, 'Verde Mantis',
   'The Huracán EVO elevates driving to a new level with its naturally aspirated V10 engine and advanced aerodynamics. Pure Lamborghini DNA in every detail.',
   ARRAY['LDVI system', 'Magnetic ride suspension', 'Full LED headlights', 'Carbon ceramic brakes', 'Sport exhaust', 'Lifting system'],
   ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800', 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   true, 4.9, 63, true),

  (gen_random_uuid(), 'McLaren', '720S Spider', 2024, 'supercar', 2400, 'AED', 710, 341, 2.9, 'Automatic', 'Petrol', 2, 'Papaya Spark',
   'The McLaren 720S Spider combines breathtaking performance with the thrill of open-top driving. The retractable hardtop transforms the driving experience in just 11 seconds.',
   ARRAY['Proactive chassis control', 'Variable drift control', 'Carbon monocoque', 'Electrochromic roof', 'Bowers & Wilkins audio', 'Track telemetry'],
   ARRAY['https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800', 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
   true, 4.85, 38, true),

  (gen_random_uuid(), 'Porsche', '911 GT3 RS', 2024, 'supercar', 1800, 'AED', 518, 312, 3.2, 'PDK', 'Petrol', 2, 'Python Green',
   'The 911 GT3 RS is the most track-focused street-legal 911 ever built. Derived directly from motorsport, it delivers an uncompromising driving experience.',
   ARRAY['DRS rear wing', 'PCCB ceramic brakes', 'Sport chrono package', 'Carbon bucket seats', 'Roll cage', 'Fire extinguisher'],
   ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800', 'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800'],
   false, 4.88, 52, true),

  (gen_random_uuid(), 'Aston Martin', 'DBS Superleggera', 2024, 'supercar', 2100, 'AED', 715, 340, 3.4, 'Automatic', 'Petrol', 2, 'Onyx Black',
   'The DBS Superleggera is Aston Martin''s flagship super GT. Hand-crafted luxury meets brutal performance in this stunning British masterpiece.',
   ARRAY['Adaptive damping', 'Carbon fiber body panels', 'Bang & Olufsen audio', 'Touchtronic III', 'Heated seats', '360 camera'],
   ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   false, 4.82, 29, true),

  -- Luxury Sedans
  (gen_random_uuid(), 'Rolls-Royce', 'Ghost', 2024, 'luxury', 3500, 'AED', 563, 250, 4.8, 'Automatic', 'Petrol', 5, 'English White',
   'The Rolls-Royce Ghost offers minimalist, post-opulent luxury. Whisper-quiet and supremely comfortable, it represents the pinnacle of refined motoring.',
   ARRAY['Starlight headliner', 'Illuminated grille', 'Planar suspension', 'Champagne cooler', 'Rear theatre', 'Lambswool floor mats'],
   ARRAY['https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   true, 4.97, 34, true),

  (gen_random_uuid(), 'Bentley', 'Flying Spur', 2024, 'luxury', 2800, 'AED', 626, 333, 3.8, 'Automatic', 'Petrol', 4, 'Glacier White',
   'The Bentley Flying Spur combines grand touring luxury with sports car performance. A four-door masterpiece of British craftsmanship.',
   ARRAY['48V active anti-roll', 'Naim audio', 'Rotating display', 'Rear entertainment', 'All-wheel steering', 'Air suspension'],
   ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   false, 4.91, 41, true),

  (gen_random_uuid(), 'Mercedes-Maybach', 'S680', 2024, 'luxury', 2600, 'AED', 621, 250, 4.5, 'Automatic', 'Petrol', 4, 'Designo Mocha Black',
   'The Mercedes-Maybach S680 sets the standard for automotive luxury. V12 power meets ultimate comfort in this executive flagship.',
   ARRAY['Executive rear seats', 'Magic Body Control', 'Burmester 4D', 'Fragrance system', 'Hot stone massage', 'MBUX tablet'],
   ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
   true, 4.94, 28, true),

  -- Luxury SUVs
  (gen_random_uuid(), 'Lamborghini', 'Urus', 2024, 'suv', 1900, 'AED', 657, 305, 3.6, 'Automatic', 'Petrol', 5, 'Blu Eleos',
   'The Lamborghini Urus is the world''s first Super Sport Utility Vehicle. It combines the performance of a supercar with the functionality of an SUV.',
   ARRAY['Rear-wheel steering', 'Torque vectoring', 'Adaptive air suspension', 'Carbon ceramic brakes', 'Bang & Olufsen', 'Head-up display'],
   ARRAY['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   true, 4.86, 72, true),

  (gen_random_uuid(), 'Bentley', 'Bentayga EWB', 2024, 'suv', 2400, 'AED', 542, 290, 4.6, 'Automatic', 'Petrol', 4, 'Brittany Blue',
   'The Bentley Bentayga Extended Wheelbase offers unmatched luxury in an SUV. Extra rear legroom and first-class airline seating deliver ultimate comfort.',
   ARRAY['Airline seats', 'Rear refrigerator', 'Bentley Rotating Display', 'Diamond illumination', 'All-terrain specification', 'Night vision'],
   ARRAY['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   false, 4.89, 35, true),

  (gen_random_uuid(), 'Range Rover', 'SV Autobiography', 2024, 'suv', 1600, 'AED', 557, 261, 5.0, 'Automatic', 'Petrol', 4, 'Charente Grey',
   'The Range Rover SV Autobiography represents the pinnacle of Land Rover luxury. Bespoke craftsmanship meets legendary off-road capability.',
   ARRAY['SV Executive class', 'Meridian Signature', 'Pixel LED headlights', 'Active noise cancellation', 'Hot stone massage', 'Deployable table'],
   ARRAY['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   false, 4.84, 58, true),

  -- Convertibles
  (gen_random_uuid(), 'Ferrari', 'Roma Spider', 2024, 'convertible', 1800, 'AED', 612, 320, 3.4, 'Automatic', 'Petrol', 2, 'Argento Nurburgring',
   'The Ferrari Roma Spider is a front-engined, V8-powered, open-top GT. La Dolce Vita spirit meets cutting-edge Ferrari technology.',
   ARRAY['Retractable soft top', 'Manettino dial', 'Virtual cockpit', 'Premium JBL audio', 'Adaptive cruise', 'Carbon fiber options'],
   ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800'],
   false, 4.87, 31, true),

  (gen_random_uuid(), 'Rolls-Royce', 'Dawn', 2024, 'convertible', 3200, 'AED', 563, 250, 4.9, 'Automatic', 'Petrol', 4, 'Jubilee Silver',
   'The Rolls-Royce Dawn is the world''s quietest convertible. A masterpiece of engineering that delivers uncompromised luxury whether the roof is up or down.',
   ARRAY['Silent soft top', 'Starlight headliner', 'Bespoke audio', 'Rear theatre system', 'Champagne cooler', 'Picnic trunk'],
   ARRAY['https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   true, 4.93, 22, true),

  (gen_random_uuid(), 'Bentley', 'Continental GT Convertible', 2024, 'convertible', 2000, 'AED', 650, 333, 3.7, 'Automatic', 'Petrol', 4, 'Sequin Blue',
   'The Bentley Continental GT Convertible is a grand tourer without compromise. The world''s fastest four-seat convertible delivers effortless performance.',
   ARRAY['Tweed hood', 'Neck warmer', 'Naim audio', 'Rotating display', 'All-wheel drive', 'Air suspension'],
   ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   false, 4.88, 44, true),

  -- Sports Cars
  (gen_random_uuid(), 'Porsche', 'Taycan Turbo S', 2024, 'sports', 1400, 'AED', 750, 260, 2.8, 'Automatic', 'Electric', 4, 'Frozen Berry',
   'The Porsche Taycan Turbo S is the most powerful production EV from Porsche. Instant electric torque meets legendary Porsche handling.',
   ARRAY['800V architecture', 'Porsche Active Ride', 'Matrix LED', 'Bose surround', 'Passenger display', 'Over-the-air updates'],
   ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800'],
   true, 4.91, 67, true),

  (gen_random_uuid(), 'BMW', 'M8 Competition', 2024, 'sports', 1200, 'AED', 617, 305, 3.2, 'Automatic', 'Petrol', 4, 'Frozen Marina Bay Blue',
   'The BMW M8 Competition Gran Coupe combines stunning design with devastating performance. A four-door sports car like no other.',
   ARRAY['M Carbon exterior', 'Bowers & Wilkins', 'M Drive Professional', 'M Carbon bucket seats', 'M Track mode', 'Driving Assistant Pro'],
   ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   false, 4.78, 53, true),

  (gen_random_uuid(), 'Mercedes-AMG', 'GT 63 S E Performance', 2024, 'sports', 1500, 'AED', 831, 315, 2.9, 'Automatic', 'Hybrid', 4, 'Manufaktur Cashmere White',
   'The Mercedes-AMG GT 63 S E Performance is AMG''s most powerful production car ever. Hybrid technology delivers supercar-beating performance.',
   ARRAY['AMG Performance hybrid', 'AMG RIDE CONTROL+', 'Burmester high-end', 'AMG Track Pace', 'Rear axle steering', 'MBUX Hyperscreen'],
   ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
   true, 4.85, 39, true),

  -- Hypercars
  (gen_random_uuid(), 'Bugatti', 'Chiron Sport', 2024, 'hypercar', 8500, 'AED', 1479, 420, 2.4, 'Automatic', 'Petrol', 2, 'Atlantic Blue',
   'The Bugatti Chiron Sport is the ultimate expression of automotive engineering. With 1,479 horsepower, it redefines what is possible.',
   ARRAY['Quad-turbo W16', 'Carbon fiber monocoque', 'Adaptive chassis', 'Advanced aero', 'Alcantara interior', 'Diamond speaker grilles'],
   ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'],
   true, 5.0, 12, true),

  (gen_random_uuid(), 'Koenigsegg', 'Jesko', 2024, 'hypercar', 9500, 'AED', 1600, 330, 2.5, 'LST', 'E85', 2, 'Tang Orange',
   'The Koenigsegg Jesko pushes the boundaries of automotive performance. The Light Speed Transmission enables instant gear changes at any speed.',
   ARRAY['LST 9-speed', 'Triplex suspension', 'Active rear wing', 'Carbon ceramic brakes', 'Ghost package', 'Autoskin doors'],
   ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   true, 4.98, 8, false),

  (gen_random_uuid(), 'Pagani', 'Huayra Roadster', 2024, 'hypercar', 7500, 'AED', 764, 370, 3.0, 'Automated Manual', 'Petrol', 2, 'Blu Francia',
   'The Pagani Huayra Roadster is a work of art in motion. Hand-crafted perfection meets advanced aerodynamics in this Italian masterpiece.',
   ARRAY['Carbo-Titanium monocoque', 'Active aero flaps', 'Bespoke interior', 'Sonus Faber audio', 'Titanium exhaust', 'Diamond knurled controls'],
   ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
   true, 4.99, 6, true)

ON CONFLICT DO NOTHING;
